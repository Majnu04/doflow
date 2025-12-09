import CodeSubmission from '../models/CodeSubmission.js';
import UserProgress from '../models/UserProgress.js';
import Enrollment from '../models/Enrollment.js';
import Roadmap from '../models/Roadmap.js';
import axios from 'axios';
import { Buffer } from 'buffer';
import Problem from '../models/Problem.js';
import { buildHarnessedSource } from '../utils/compilerHarness.js';
import { buildDsaProgressSnapshot } from '../utils/dsaProgress.js';
import { deduplicateImports } from '../utils/importDeduplicator.js';
import judge0Queue from '../utils/judge0Queue.js';
import retryWithBackoff from '../utils/judge0Retry.js';

const ADAPTER_ENTRYPOINTS = {
  javascript: '__doflow_entry(...__doflowArgs)',
  python: '__doflow_entry(*__doflow_args)',
  java: 'DoFlowAdapter.__doflow_entry(rawArgs)',
  cpp: '__doflow_entry(rawArgs)',
  c: '__doflow_entry(argc, argv)',
};

// Map language names to Judge0 language IDs
const LANGUAGE_MAPPING = {
  javascript: 93, // Node.js
  python: 71,     // Python 3.8.1
  java: 62,       // Java 15.0.2
  cpp: 54,        // C++ 17
  c: 50,          // C (GCC 9.2.0)
};

const coerceExpectedOutput = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const buildJudge0Client = () => {
  const judge0ApiKey = process.env.JUDGE0_API_KEY;
  const isRapidApi = Boolean(judge0ApiKey);

  let judge0ApiUrl = process.env.JUDGE0_API_URL || (isRapidApi ? 'https://judge0-ce.p.rapidapi.com' : 'https://ce.judge0.com');

  if (!isRapidApi && /rapidapi/i.test(judge0ApiUrl)) {
    console.warn('⚠️ RapidAPI host configured but no API key found. Falling back to https://ce.judge0.com');
    judge0ApiUrl = 'https://ce.judge0.com';
  }

  const judge0Headers = isRapidApi
    ? {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': judge0ApiKey,
      }
    : {
        'Content-Type': 'application/json',
      };

  if (!judge0ApiKey) {
    console.warn('⚠️ Judge0 API Key not found. Using public Judge0 instance (https://ce.judge0.com) which has strict rate limits.');
  }

  return { judge0ApiUrl, judge0Headers };
};

const submitSingleTestCase = async ({ judge0ApiUrl, judge0Headers }, payload) => {
  // Encode source_code and expected_output as base64
  const toBase64 = (str) => Buffer.from(str ?? '', 'utf-8').toString('base64');
  const fromBase64 = (value) => {
    if (!value) return value;
    try {
      return Buffer.from(value, 'base64').toString('utf-8');
    } catch (error) {
      return value;
    }
  };
  const base64Payload = { ...payload };
  if (payload.source_code) {
    base64Payload.source_code = toBase64(payload.source_code);
  }
  if (payload.expected_output) {
    base64Payload.expected_output = toBase64(payload.expected_output);
  }
  
  // Submit to Judge0 with retry logic and queue management
  const response = await judge0Queue.enqueue(() =>
    retryWithBackoff(
      () =>
        axios.post(
          `${judge0ApiUrl}/submissions?base64_encoded=true&wait=true`,
          base64Payload,
          { headers: judge0Headers, timeout: 30000 }
        ),
      3,
      1000
    )
  );
  
  const raw = response.data || {};
  return {
    ...raw,
    stdout: fromBase64(raw.stdout),
    stderr: fromBase64(raw.stderr),
    compile_output: fromBase64(raw.compile_output),
    message: fromBase64(raw.message),
    expected_output: fromBase64(raw.expected_output),
  };
};

const formatJudge0Result = (rawResult, testCase, index) => {
  const stdout = (rawResult.stdout || '').trim();
  const errorOutput = (rawResult.stderr || rawResult.compile_output || '').trim();
  const statusDescription = rawResult.status?.description || 'Unknown';
  const expected = typeof testCase.expectedOutput === 'string' ? (testCase.expectedOutput || '').trim() : undefined;
  const isAccepted = rawResult.status?.id === 3;
  const passed = isAccepted && (expected !== undefined ? stdout === expected : true);

  const actualOutput = stdout || errorOutput || statusDescription;
  const timeSeconds = rawResult.time !== undefined && rawResult.time !== null ? Number(rawResult.time) : null;
  const executionTime = Number.isFinite(timeSeconds) ? Number((timeSeconds * 1000)) : null;
  const memoryValue = rawResult.memory !== undefined && rawResult.memory !== null ? Number(rawResult.memory) : null;

  return {
    testCase: index + 1,
    originalIndex: index,
    input: testCase.input,
    expectedOutput: expected,
    actualOutput,
    errorOutput,
    executionTime,
    memory: Number.isFinite(memoryValue) ? memoryValue : null,
    explanation: testCase.explanation,
    status: statusDescription,
    isHidden: Boolean(testCase.isHidden),
    passed,
  };
};

const aggregatePerformanceSummary = (results = []) => {
  const timeValues = results
    .map(result => (typeof result.executionTime === 'number' ? result.executionTime : null))
    .filter((value) => value !== null);
  const memoryValues = results
    .map(result => (typeof result.memory === 'number' ? result.memory : null))
    .filter((value) => value !== null);

  if (!timeValues.length && !memoryValues.length) {
    return null;
  }

  const averageMs = timeValues.length
    ? Number((timeValues.reduce((sum, value) => sum + value, 0) / timeValues.length).toFixed(2))
    : null;

  return {
    averageMs,
    fastestMs: timeValues.length ? Math.min(...timeValues) : null,
    slowestMs: timeValues.length ? Math.max(...timeValues) : null,
    peakMemoryKb: memoryValues.length ? Math.max(...memoryValues) : null,
  };
};

const resolveLanguageAdapters = (problem, language) => {
  const starter = problem?.starterCode?.find(entry => entry.language === language);
  if (!starter) {
    return { adapterCode: '', entryInvocation: null };
  }
  return {
    adapterCode: starter.adapterCode || '',
    entryInvocation: starter.adapterCode ? ADAPTER_ENTRYPOINTS[language] || null : null,
  };
};

const executeTestsSequentially = async (code, language, testCases = [], options = {}) => {
  const { stopOnFailure = false, problem } = options;
  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new Error('Test cases are required for execution.');
  }

  const languageId = LANGUAGE_MAPPING[language];
  if (!languageId) {
    throw new Error(`Language "${language}" is not supported.`);
  }

  const client = buildJudge0Client();
  const results = [];

  const { adapterCode, entryInvocation } = resolveLanguageAdapters(problem, language);

  // Separate public and hidden tests
  const publicTests = testCases.filter(tc => !tc.isHidden);
  const hiddenTests = testCases.filter(tc => tc.isHidden);

  // Execute public tests in parallel for faster feedback
  if (publicTests.length > 0) {
    console.log(`🚀 Executing ${publicTests.length} public test(s) in parallel...`);
    
    const publicPromises = publicTests.map(async (testCase, i) => {
      const harnessedSource = buildHarnessedSource(language, code, testCase, adapterCode, entryInvocation);
      const payload = {
        language_id: languageId,
        source_code: harnessedSource,
      };

      const expectedOutput = coerceExpectedOutput(testCase.expectedOutput);
      if (expectedOutput !== null) {
        payload.expected_output = expectedOutput;
      }

      const rawResult = await submitSingleTestCase(client, payload);
      const formatted = formatJudge0Result(rawResult, testCase, i);
      console.log(`  ↳ Test ${i + 1}: ${formatted.passed ? '✅ PASSED' : '❌ FAILED'} (${formatted.status})`);
      return formatted;
    });

    const publicResults = await Promise.all(publicPromises);
    results.push(...publicResults);

    // Check if any public test failed and stopOnFailure is enabled
    const publicFailure = publicResults.find(r => !r.passed);
    if (stopOnFailure && publicFailure) {
      const failedResult = publicFailure;
      const passedTests = results.filter(r => r.passed).length;
      const performanceSummary = aggregatePerformanceSummary(results);

      return {
        results,
        failedResult,
        passedTests,
        totalTests: testCases.length,
        executedTests: results.length,
        allPassed: false,
        performanceSummary,
      };
    }
  }

  // Execute hidden tests sequentially (if all public tests passed or stopOnFailure is false)
  if (hiddenTests.length > 0) {
    console.log(`🚀 Executing ${hiddenTests.length} hidden test(s) sequentially...`);
    
    for (let i = 0; i < hiddenTests.length; i += 1) {
      const testCase = hiddenTests[i];
      const originalIndex = publicTests.length + i;
      
      const harnessedSource = buildHarnessedSource(language, code, testCase, adapterCode, entryInvocation);
      const payload = {
        language_id: languageId,
        source_code: harnessedSource,
      };

      const expectedOutput = coerceExpectedOutput(testCase.expectedOutput);
      if (expectedOutput !== null) {
        payload.expected_output = expectedOutput;
      }

      const rawResult = await submitSingleTestCase(client, payload);
      const formatted = formatJudge0Result(rawResult, testCase, originalIndex);
      results.push(formatted);
      console.log(`  ↳ Hidden test ${i + 1}: ${formatted.passed ? '✅ PASSED' : '❌ FAILED'} (${formatted.status})`);

      if (stopOnFailure && formatted.passed === false) {
        break;
      }
    }
  }

  const failedResult = results.find(r => r.passed === false) || null;
  const passedTests = results.filter(r => r.passed).length;
  const performanceSummary = aggregatePerformanceSummary(results);

  return {
    results,
    failedResult,
    passedTests,
    totalTests: testCases.length,
    executedTests: results.length,
    allPassed: !failedResult && results.length === testCases.length,
    performanceSummary,
  };
};


// @desc    Run code against test cases
// @route   POST /api/submissions/run
// @access  Public
export const runCode = async (req, res) => {
  try {
    console.log('=== RUN CODE REQUEST RECEIVED (Judge0) ===');
    const { code, language, testCases, problemId } = req.body;

    if (!code || !language || !testCases || !Array.isArray(testCases)) {
      console.error('❌ Bad request: Missing code, language, or testCases');
      return res.status(400).json({ message: 'Code, language, and test cases are required.' });
    }

    let problem = null;
    if (problemId) {
      problem = await Problem.findById(problemId);
    }

    let evaluation;
    try {
      evaluation = await executeTestsSequentially(code, language, testCases, { stopOnFailure: false, problem });
    } catch (judgeError) {
      // Log full Judge0 error details
      console.error('❌ Judge0 execution error:', judgeError && judgeError.response ? judgeError.response.data : judgeError);
      return res.status(500).json({
        message: 'Judge0 execution error',
        details: judgeError && judgeError.response ? judgeError.response.data : String(judgeError)
      });
    }

    const response = {
      mode: 'run',
      visibility: 'public',
      ...evaluation,
    };

    console.log('✅ Execution completed (run mode):', evaluation.passedTests, '/', testCases.length, 'passed');
    res.json(response);
  } catch (error) {
    console.error('❌ Error in runCode (Judge0):', error.response ? error.response.data : error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit code solution
// @route   POST /api/submissions/submit
// @access  Private
export const submitCode = async (req, res) => {
  try {
    console.log('=== SUBMIT CODE REQUEST RECEIVED (Judge0) ===');
    const { code, language, problemId, problemTitle, testCases, roadmapId, courseId } = req.body;

    if (!code || !language || !problemId || !testCases) {
        return res.status(400).json({ message: 'Missing required fields for submission.' });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const orderedTestCases = [
      ...testCases.filter(tc => !tc.isHidden),
      ...testCases.filter(tc => tc.isHidden)
    ];

    const evaluation = await executeTestsSequentially(code, language, orderedTestCases, { stopOnFailure: true, problem });
    const { results, failedResult, passedTests, totalTests, executedTests, allPassed, performanceSummary } = evaluation;

    const submission = await CodeSubmission.create({
      user: req.user._id,
      problem: problemId,
      problemTitle,
      code,
      language,
      status: allPassed ? 'accepted' : 'wrong-answer',
      testResults: results,
      passedTests,
      totalTests,
      executionTime: performanceSummary?.slowestMs ?? null,
      memory: performanceSummary?.peakMemoryKb ?? null,
    });

    const courseObjectId = courseId || (problem.course ? problem.course.toString() : null);

    // Update user progress if all tests passed
    // Try to use roadmapId first, otherwise derive it from courseId
    let effectiveRoadmapId = roadmapId;
    if (!effectiveRoadmapId && courseObjectId) {
      try {
        const roadmap = await Roadmap.findOne({ course: courseObjectId }).lean();
        if (roadmap) {
          effectiveRoadmapId = roadmap._id;
        }
      } catch (err) {
        console.log('Could not fetch roadmap for courseId:', courseObjectId, err?.message);
      }
    }

    if (allPassed && effectiveRoadmapId) {
      let progress = await UserProgress.findOne({
        user: req.user._id,
        roadmap: effectiveRoadmapId
      });

      if (progress) {
        for (let section of progress.sections) {
          const problemInSection = section.problems.find(
            p => p.problemId.toString() === problemId
          );
          
          if (problemInSection) {
            if (!problemInSection.completed) {
              problemInSection.completed = true;
              problemInSection.completedAt = new Date();
              section.completedProblems += 1;
              progress.totalCompleted += 1;
            }
            problemInSection.attempts += 1;
            problemInSection.lastAttempt = new Date();
            problemInSection.bestSubmission = submission._id;
            break;
          }
        }

        progress.calculateProgress();
        progress.lastActivity = new Date();
        await progress.save();
        console.log(`✅ Progress updated for user ${req.user._id}: ${progress.progressPercentage}% completed`);
      }
    }

    let courseProgress = null;
    if (allPassed && courseObjectId) {
      courseProgress = await buildDsaProgressSnapshot(req.user._id, courseObjectId);

      if (courseProgress) {
        await Enrollment.findOneAndUpdate(
          {
            user: req.user._id,
            course: courseObjectId,
            'paymentInfo.status': 'completed'
          },
          {
            $set: {
              progress: courseProgress.percentage
            },
            ...(courseProgress.percentage === 100 ? { completedAt: new Date() } : {})
          }
        );
      }
    }

    const hiddenFailures = failedResult && failedResult.isHidden
      ? [{
          testCase: failedResult.testCase,
          input: failedResult.input,
          expectedOutput: failedResult.expectedOutput,
          actualOutput: failedResult.actualOutput,
          executedOutput: failedResult.actualOutput,
          status: failedResult.status || 'Failed'
        }]
      : [];

    res.status(201).json({
      submission,
      hiddenFailures,
      failedResult,
      executedTests,
      performanceSummary,
      progressOverview: courseProgress,
      message: allPassed ? 'All test cases passed! 🎉' : 'Stopped after the first failing test case.'
    });
  } catch (error) {
    console.error('❌ Error in submitCode (Judge0):', error.response ? error.response.data : error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user submissions for a problem
// @route   GET /api/submissions/problem/:problemId?page=1&limit=20
// @access  Private
export const getProblemSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const submissions = await CodeSubmission.find({
      user: req.user._id,
      problem: req.params.problemId
    })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await CodeSubmission.countDocuments({
      user: req.user._id,
      problem: req.params.problemId
    });

    res.json({
      submissions,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user submissions
// @route   GET /api/submissions?page=1&limit=20
// @access  Private
export const getAllSubmissions = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const submissions = await CodeSubmission.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await CodeSubmission.countDocuments({ user: req.user._id });

    res.json({
      submissions,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
