import CodeSubmission from '../models/CodeSubmission.js';
import UserProgress from '../models/UserProgress.js';

// Execute JavaScript code with test cases
const executeCode = (code, testCases) => {
  console.log('📝 Executing code against', testCases.length, 'test cases');
  const results = [];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const startTime = Date.now();
    
    try {
      console.log(`  Test ${i + 1}: Input = ${testCase.input}`);
      
      // Create a safe execution context
      const func = new Function('input', `
        ${code}
        return solution(${testCase.input});
      `);
      
      const actualOutput = func();
      const executionTime = Date.now() - startTime;
      
      const passed = JSON.stringify(actualOutput) === JSON.stringify(JSON.parse(testCase.expectedOutput));
      
      console.log(`  Test ${i + 1}: ${passed ? '✅ PASSED' : '❌ FAILED'} - Expected: ${testCase.expectedOutput}, Got: ${JSON.stringify(actualOutput)}`);
      
      results.push({
        testCase: i + 1,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: JSON.stringify(actualOutput),
        executionTime,
        explanation: testCase.explanation
      });
    } catch (error) {
      console.log(`  Test ${i + 1}: ❌ ERROR - ${error.message}`);
      
      results.push({
        testCase: i + 1,
        passed: false,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: `Error: ${error.message}`,
        executionTime: Date.now() - startTime,
        explanation: testCase.explanation
      });
    }
  }
  
  return results;
};

// @desc    Run code against test cases
// @route   POST /api/submissions/run
// @access  Public
export const runCode = async (req, res) => {
  try {
    console.log('=== RUN CODE REQUEST RECEIVED ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { code, language, testCases } = req.body;

    if (!code) {
      console.log('❌ No code provided');
      return res.status(400).json({ message: 'Code is required' });
    }

    if (!testCases || !Array.isArray(testCases) || testCases.length === 0) {
      console.log('❌ Invalid test cases');
      return res.status(400).json({ message: 'Test cases are required' });
    }

    if (language !== 'javascript') {
      console.log('❌ Unsupported language:', language);
      return res.status(400).json({ 
        message: 'Only JavaScript is currently supported' 
      });
    }

    console.log('✅ Executing code with', testCases.length, 'test cases');
    const results = executeCode(code, testCases);
    const passedTests = results.filter(r => r.passed).length;
    
    const response = {
      results,
      passedTests,
      totalTests: testCases.length,
      allPassed: passedTests === testCases.length
    };

    console.log('✅ Execution completed:', passedTests, '/', testCases.length, 'passed');
    res.json(response);
  } catch (error) {
    console.error('❌ Error in runCode:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit code solution
// @route   POST /api/submissions/submit
// @access  Private
export const submitCode = async (req, res) => {
  try {
    const { code, language, problemId, problemTitle, testCases, roadmapId } = req.body;

    const results = executeCode(code, testCases);
    const passedTests = results.filter(r => r.passed).length;
    const allPassed = passedTests === testCases.length;

    const submission = await CodeSubmission.create({
      user: req.user._id,
      problem: problemId,
      problemTitle,
      code,
      language,
      status: allPassed ? 'accepted' : 'wrong-answer',
      testResults: results,
      passedTests,
      totalTests: testCases.length
    });

    // Update user progress if all tests passed
    if (allPassed && roadmapId) {
      let progress = await UserProgress.findOne({
        user: req.user._id,
        roadmap: roadmapId
      });

      if (progress) {
        for (let section of progress.sections) {
          const problem = section.problems.find(
            p => p.problemId.toString() === problemId
          );
          
          if (problem) {
            if (!problem.completed) {
              problem.completed = true;
              problem.completedAt = new Date();
              section.completedProblems += 1;
              progress.totalCompleted += 1;
            }
            problem.attempts += 1;
            problem.lastAttempt = new Date();
            problem.bestSubmission = submission._id;
            break;
          }
        }

        progress.calculateProgress();
        progress.lastActivity = new Date();
        await progress.save();
      }
    }

    res.status(201).json({
      submission,
      message: allPassed ? 'All test cases passed! 🎉' : 'Some test cases failed'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user submissions for a problem
// @route   GET /api/submissions/problem/:problemId
// @access  Private
export const getProblemSubmissions = async (req, res) => {
  try {
    const submissions = await CodeSubmission.find({
      user: req.user._id,
      problem: req.params.problemId
    }).sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user submissions
// @route   GET /api/submissions
// @access  Private
export const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await CodeSubmission.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
