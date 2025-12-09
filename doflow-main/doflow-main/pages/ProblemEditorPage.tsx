import React, { useState, useEffect, useMemo, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { FiPlay, FiCheck, FiBookmark, FiStar, FiChevronLeft, FiLoader, FiExternalLink } from 'react-icons/fi';
import { Button, Badge } from '../src/components/ui';
import toast from 'react-hot-toast';
import { 
  fetchProblemData, 
  runCode, 
  submitCode,
  clearRunResults,
  clearSubmitResults,
  Submission,
  PerformanceSummary,
  saveProblemNote
} from '../src/store/slices/problemEditorSlice';
import { ErrorState, EmptyState } from '../src/components/common/StateIndicators';
import { explainSolutionComplexity } from '../services/geminiService';

const SUPPORTED_LANGUAGES = ['javascript', 'python', 'cpp', 'java', 'c'] as const;

const LANGUAGE_LABELS: Record<string, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  cpp: 'C++',
  java: 'Java',
  c: 'C',
};

const DEFAULT_SNIPPETS: Record<string, string> = {
  javascript: `function solve(...args) {
  // args contains the values supplied by each test case.
  // Return a string/number/JSON-serializable value.
  return '';
}
`,
  python: `def solve(*args):
    """args contains the values supplied by each test case."""
    return ''
`,
  cpp: `std::string solve(const std::vector<std::string>& args) {
    // Parse args and return the desired output as a string.
    return "";
}
`,
  java: `class Solution {
    public static Object solve(String[] args) {
        // Parse args (strings) and return any object/primitive.
        return "";
    }
}
`,
  c: `const char* solve(int argc, const char* argv[]) {
    // Build the answer in a static buffer or allocate memory that outlives the call.
    return "";
}
`,
};

const SOLVE_SIGNATURE_PATTERNS: Record<string, RegExp> = {
  javascript: /function\s+solve\s*\(/,
  python: /def\s+solve\s*\(/,
  cpp: /(?:std::)?string\s+solve\s*\(/,
  java: /static\s+Object\s+solve\s*\(/,
  c: /const\s+char\s*\*\s*solve\s*\(/,
};

const BRACE_LANGUAGES = new Set(['javascript', 'cpp', 'java', 'c']);

const extractBraceBlock = (snippet: string, signatureIndex: number) => {
  const braceStart = snippet.indexOf('{', signatureIndex);
  if (braceStart === -1) return snippet.slice(signatureIndex).trim();
  let depth = 0;
  for (let i = braceStart; i < snippet.length; i += 1) {
    const char = snippet[i];
    if (char === '{') {
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        return snippet.slice(signatureIndex, i + 1).trim();
      }
    }
  }
  return snippet.slice(signatureIndex).trim();
};

const extractPythonBlock = (snippet: string, signatureIndex: number) => {
  const afterSignature = snippet.slice(signatureIndex);
  const lines = afterSignature.split(/\r?\n/);
  if (lines.length === 0) return afterSignature.trim();
  const header = lines[0];
  const indentMatch = header.match(/^\s*/);
  const baseIndent = indentMatch ? indentMatch[0].length : 0;
  const collected: string[] = [header];
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) {
      collected.push(line);
      continue;
    }
    const lineIndent = line.match(/^\s*/)?.[0].length ?? 0;
    if (lineIndent <= baseIndent) {
      break;
    }
    collected.push(line);
  }
  return collected.join('\n').trimEnd();
};

const extractSolveSection = (language: string, snippet: string) => {
  if (!snippet) return '';
  const pattern = SOLVE_SIGNATURE_PATTERNS[language];
  if (!pattern) return snippet.trim();
  const match = pattern.exec(snippet);
  if (!match) return snippet.trim();
  const signatureIndex = match.index;
  if (language === 'python') {
    return extractPythonBlock(snippet, signatureIndex);
  }
  if (BRACE_LANGUAGES.has(language)) {
    return extractBraceBlock(snippet, signatureIndex);
  }
  return snippet.slice(signatureIndex).trim();
};

const LANGUAGE_SIGNATURES: Record<string, string> = {
  javascript: 'function solve(...args)',
  python: 'def solve(*args)',
  cpp: 'std::string solve(const std::vector<std::string>& args)',
  java: 'class Solution { static Object solve(String[] args) }',
  c: 'const char* solve(int argc, const char* argv[])',
};

const deriveSignature = (language: string, snippet: string) => {
  if (!snippet) {
    return LANGUAGE_SIGNATURES[language] || 'solve(...)';
  }
  const lines = snippet.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) {
    return LANGUAGE_SIGNATURES[language] || 'solve(...)';
  }
  if (language === 'python') {
    const methodLine = lines.find((line) => line.startsWith('def '));
    if (methodLine) {
      return methodLine.replace(/:\s*$/, '');
    }
  }
  if (language === 'java') {
    const methodLine = lines.find((line) => line.includes('(') && line.includes(')'));
    if (methodLine) {
      return methodLine.replace(/\{\s*$/, '').trim();
    }
  }
  if (language === 'javascript' || language === 'cpp' || language === 'c') {
    const signatureLine = lines.find((line) => /function\s+|solve\s*\(/.test(line));
    if (signatureLine) {
      return signatureLine.replace(/\{\s*$/, '').trim();
    }
  }
  return lines[0];
};

const MONACO_LANGUAGE_MAP: Record<string, string> = {
  javascript: 'javascript',
  python: 'python',
  cpp: 'cpp',
  java: 'java',
  c: 'cpp',
};

const formatRuntime = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (value >= 1000) {
    return `${(value / 1000).toFixed(2)} s`;
  }
  if (value >= 10) {
    return `${value.toFixed(1)} ms`;
  }
  return `${value.toFixed(3)} ms`;
};

const formatMemory = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (value >= 1024) {
    return `${(value / 1024).toFixed(2)} MB`;
  }
  return `${value.toFixed(1)} KB`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

const statusBadgeClass = (status?: string) => {
  switch (status) {
    case 'accepted':
      return 'bg-green-100 text-green-700';
    case 'wrong-answer':
      return 'bg-red-100 text-red-700';
    case 'runtime-error':
      return 'bg-orange-100 text-orange-700';
    case 'time-limit-exceeded':
      return 'bg-yellow-100 text-yellow-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

interface ProblemEditorPageProps {
  problemId: string;
}

const ProblemEditorPage: React.FC<ProblemEditorPageProps> = ({ problemId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { 
    problem, 
    status, 
    error,
    runStatus,
    runResults,
    runError,
    submitStatus,
    submitResults,
    submitError,
    submissions,
    notes,
  } = useSelector((state: RootState) => state.problemEditor);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<typeof SUPPORTED_LANGUAGES[number]>('javascript');
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'discussions' | 'notes'>('description');
  const [showResults, setShowResults] = useState(false);
  const [complexitySummary, setComplexitySummary] = useState<string | null>(null);
  const [complexityStatus, setComplexityStatus] = useState<'idle' | 'loading' | 'failed' | 'succeeded'>('idle');
  const [noteContent, setNoteContent] = useState('');
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);

  useEffect(() => {
    if (problemId) {
      dispatch(fetchProblemData(problemId));
    }
    // Cleanup results on unmount
    return () => {
      dispatch(clearRunResults());
      dispatch(clearSubmitResults());
    }
  }, [problemId, dispatch]);

  // Set initial code when problem data loads
  const hasAutoSelectedLanguage = useRef(false);

  useEffect(() => {
    if (!problem?.starterCode?.length || hasAutoSelectedLanguage.current) return;
    if (!problem.starterCode.some((sc: any) => sc.language === language)) {
      const fallbackLanguage = problem.starterCode[0]?.language;
      if (fallbackLanguage) {
        setLanguage(fallbackLanguage as typeof SUPPORTED_LANGUAGES[number]);
      }
    }
    hasAutoSelectedLanguage.current = true;
  }, [problem, language]);

  const starterEntry = useMemo(() => {
    if (!problem?.starterCode) return null;
    return problem.starterCode.find((sc: any) => sc.language === language) || null;
  }, [problem, language]);

  useEffect(() => {
    if (!problem) return;
    const rawSnippet = starterEntry?.visibleCode ?? starterEntry?.code ?? DEFAULT_SNIPPETS[language] ?? '';
    const visibleSnippet = starterEntry?.visibleCode ? rawSnippet : (extractSolveSection(language, rawSnippet) || rawSnippet);
    setCode(visibleSnippet);
  }, [problem, language, starterEntry]);

  // Show toast notifications for run/submit errors
  useEffect(() => {
    if (runStatus === 'failed' && runError) {
      toast.error(`Run failed: ${runError}`);
    }
  }, [runStatus, runError]);

  useEffect(() => {
    if (submitStatus === 'failed' && submitError) {
      toast.error(`Submit failed: ${submitError}`);
    }
    if (submitStatus === 'succeeded' && submitResults) {
        if (submitResults.submission.status === 'accepted') {
            toast.success('All test cases passed! Problem solved successfully!');
        } else {
            toast.error('Some test cases failed. Keep trying!');
        }
    }
  }, [submitStatus, submitError, submitResults]);

  useEffect(() => {
    if (runStatus === 'running' || submitStatus === 'running') {
      setComplexitySummary(null);
      setComplexityStatus('idle');
    }
  }, [runStatus, submitStatus]);

  useEffect(() => {
    setNoteContent(notes?.content || '');
  }, [notes?.content]);

  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang as typeof SUPPORTED_LANGUAGES[number]);
    dispatch(clearRunResults());
    dispatch(clearSubmitResults());
    setShowResults(false);
  };

  const handleRunCode = () => {
    if (!problem) return;
    setShowResults(true);
    const allCases = Array.isArray(problem.testCases) ? problem.testCases : [];
    const publicCases = allCases.filter((tc: any) => !tc.isHidden);
    const casesToRun = publicCases.length > 0 ? publicCases : allCases;
    if (casesToRun.length === 0) {
      toast.error('No test cases available for this problem.');
      return;
    }
    dispatch(runCode({ code, language, testCases: casesToRun, problemId }));
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      window.location.hash = '/auth';
      return;
    }
    if (!problem) return;
    setShowResults(true);
    dispatch(submitCode({ 
      code, 
      language, 
      problemId, 
      problemTitle: problem.title, 
      testCases: problem.testCases,
      courseId: (problem as any).course,
      roadmapId: (problem as any).roadmap
    }));
  };

  const handleGenerateComplexity = async () => {
    if (!code || !code.trim()) {
      toast.error('Write some code before requesting complexity insights.');
      return;
    }

    try {
      setComplexityStatus('loading');
      const insights = await explainSolutionComplexity({
        language,
        code,
        problemTitle: problem?.title,
        metrics: performanceSummary || undefined,
      });
      setComplexitySummary(insights || 'No complexity commentary returned.');
      setComplexityStatus('succeeded');
    } catch (error: any) {
      console.error('Complexity generation failed:', error);
      setComplexitySummary(null);
      setComplexityStatus('failed');
      toast.error(error?.message || 'Unable to generate complexity insights.');
    }
  };

  const toggleSubmissionCode = (submissionId: string) => {
    setExpandedSubmissionId(prev => (prev === submissionId ? null : submissionId));
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(event.target.value);
    if (noteStatus === 'saved' || noteStatus === 'error') {
      setNoteStatus('idle');
    }
  };

  const handleSaveNote = async () => {
    if (!isAuthenticated) {
      toast.error('Login to save notes.');
      window.location.hash = '/auth';
      return;
    }
    if (!problem) return;
    try {
      setNoteStatus('saving');
      await dispatch(saveProblemNote({
        problemId: problem._id,
        problemTitle: problem.title,
        content: noteContent,
      })).unwrap();
      setNoteStatus('saved');
      toast.success('Note saved');
      setTimeout(() => setNoteStatus('idle'), 2000);
    } catch (error: any) {
      console.error('Failed to save note', error);
      setNoteStatus('error');
      toast.error(error?.message || 'Unable to save note');
    }
  };

  const isRunning = useMemo(() => runStatus === 'running' || submitStatus === 'running', [runStatus, submitStatus]);
  const resultsToShow = useMemo(() => submitResults?.submission || runResults, [submitResults, runResults]);
  const resultsMode = useMemo(() => {
    if (!resultsToShow) return null;
    if ((resultsToShow as any).mode) return (resultsToShow as any).mode;
    return submitResults?.submission ? 'submit' : 'run';
  }, [resultsToShow, submitResults]);
  const isRunResult = resultsMode === 'run';
  const displayedResults = useMemo(() => {
    if (!resultsToShow) return [];
    if (Array.isArray((resultsToShow as any).results)) {
      return (resultsToShow as any).results;
    }
    if (Array.isArray((resultsToShow as any).testResults)) {
      return (resultsToShow as any).testResults;
    }
    return [];
  }, [resultsToShow]);
  const publicResults = useMemo(
    () => displayedResults.filter((result: any) => !result.isHidden),
    [displayedResults]
  );
  const hiddenFailedResults = useMemo(
    () => displayedResults.filter((result: any) => result.isHidden && result.passed === false),
    [displayedResults]
  );
  const hiddenFailures = useMemo(() => {
    if (hiddenFailedResults.length > 0) {
      return hiddenFailedResults;
    }
    if (submitResults?.hiddenFailures) {
      return submitResults.hiddenFailures.map((failure: any) => ({
        ...failure,
        isHidden: true,
        passed: false,
        actualOutput: failure.actualOutput ?? failure.executedOutput,
      }));
    }
    return [];
  }, [hiddenFailedResults, submitResults]);
  const summaryPassed = useMemo(() => {
    if (isRunResult) {
      return Boolean((resultsToShow as any)?.allPassed);
    }
    if (submitResults?.submission) {
      return submitResults.submission.status === 'accepted';
    }
    // For runResults, check allPassed
    if (runResults && typeof runResults.allPassed === 'boolean') {
      return runResults.allPassed;
    }
    return false;
  }, [isRunResult, resultsToShow, submitResults]);
  const failedResult = useMemo(() => {
    const runPayload: any = runResults;
    const submitPayload: any = submitResults;
    if (runPayload && runPayload.failedResult) {
      return runPayload.failedResult;
    }
    if (submitPayload && submitPayload.failedResult) {
      return submitPayload.failedResult;
    }
    return null;
  }, [submitResults, runResults]);
  const executedTestsCount = useMemo(() => {
    const runPayload: any = runResults;
    const submitPayload: any = submitResults;
    if (runPayload && typeof runPayload.executedTests === 'number') {
      return runPayload.executedTests;
    }
    if (submitPayload && typeof submitPayload.executedTests === 'number') {
      return submitPayload.executedTests;
    }
    return displayedResults.length;
  }, [submitResults, runResults, displayedResults.length]);
  const visibleTestCases = useMemo(() => problem?.testCases?.filter((tc: any) => !tc.isHidden) || [], [problem]);
  const performanceSummary = useMemo<PerformanceSummary | null>(() => {
    if (isRunResult) {
      return (runResults as any)?.performanceSummary ?? null;
    }
    if (submitResults?.performanceSummary) {
      return submitResults.performanceSummary as PerformanceSummary;
    }
    if (submitResults?.submission?.performanceSummary) {
      return submitResults.submission.performanceSummary as PerformanceSummary;
    }
    if ((resultsToShow as any)?.performanceSummary) {
      return (resultsToShow as any).performanceSummary as PerformanceSummary;
    }
    return null;
  }, [isRunResult, runResults, submitResults, resultsToShow]);
  const publicResultsToShow = useMemo(() => {
    if (visibleTestCases.length === 0) {
      return publicResults.length > 0 ? publicResults : displayedResults;
    }

    const resultsByIndex = new Map<number, any>();
    publicResults.forEach((result: any) => {
      const idx = typeof result.originalIndex === 'number'
        ? result.originalIndex
        : typeof result.testCase === 'number'
          ? result.testCase - 1
          : null;
      if (idx !== null && idx >= 0) {
        resultsByIndex.set(idx, result);
      }
    });

    const merged = visibleTestCases.map((testCase: any, idx: number) => {
      const matched = resultsByIndex.get(idx);
      if (matched) {
        return {
          ...matched,
          testCase: idx + 1,
          input: matched.input ?? testCase.input,
          expectedOutput: matched.expectedOutput ?? testCase.expectedOutput,
          status: matched.status || (matched.passed ? 'Accepted' : matched.passed === false ? 'Failed' : 'Executed'),
          actualOutput: matched.actualOutput ?? '',
        };
      }
      return {
        testCase: idx + 1,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: 'Not executed',
        status: 'Not executed',
        passed: null,
        isHidden: false,
      };
    });

    // Append any additional public results that did not map cleanly (safety)
    publicResults.forEach((result: any) => {
      const idx = typeof result.originalIndex === 'number'
        ? result.originalIndex
        : typeof result.testCase === 'number'
          ? result.testCase - 1
          : -1;
      if (idx < 0 || idx >= merged.length) {
        merged.push(result);
      }
    });

    return merged;
  }, [visibleTestCases, publicResults, displayedResults]);
  const sanitizedDescription = useMemo(() => {
    if (!problem?.description) return null;
    return /<[^>]+>/.test(problem.description) ? { __html: problem.description } : null;
  }, [problem]);
  const plainDescription = useMemo(() => (problem?.description ? problem.description.replace(/<[^>]+>/g, '') : ''), [problem]);
  const activeSignature = useMemo(() => {
    const snippetSource = starterEntry?.visibleCode ?? starterEntry?.code ?? '';
    return deriveSignature(language, snippetSource) || (LANGUAGE_SIGNATURES[language] || 'solve(...)');
  }, [language, starterEntry]);
  const lastNoteUpdated = useMemo(() => {
    if (!notes?.updatedAt) return null;
    try {
      return new Date(notes.updatedAt).toLocaleString();
    } catch (error) {
      return notes.updatedAt;
    }
  }, [notes?.updatedAt]);

  const submissionList = useMemo(() => {
    if (Array.isArray(submissions)) return submissions;
    if (submissions && Array.isArray((submissions as any).submissions)) return (submissions as any).submissions;
    if (submissions && Array.isArray((submissions as any).data)) return (submissions as any).data;
    return [];
  }, [submissions]);
  useEffect(() => {
    if (activeTab === 'submissions') {
      // eslint-disable-next-line no-console
      console.log('Submissions loaded:', submissionList);
    }
  }, [activeTab, submissionList]);

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center">
        <FiLoader className="animate-spin text-brand-primary text-4xl" />
      </div>
    );
  }

  if (status === 'failed') {
    return <ErrorState message={error || "Failed to load problem."} onRetry={() => dispatch(fetchProblemData(problemId))} />;
  }

  if (!problem) {
    return <EmptyState title="Problem Not Found" message="The requested problem could not be loaded." />;
  }

  if (!problem) {
    return <EmptyState title="Problem Not Found" message="We couldn't find the problem you're looking for." />;
  }

  return (
    <div className="h-screen bg-light-bg dark:bg-dark-bg flex flex-col pt-16">
      {/* Header */}
      <div className="border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => window.location.hash = `/dsa/problems/${problem.course}`}
              className="p-2 text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt rounded-lg transition-colors flex-shrink-0"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-light-text dark:text-dark-text truncate">{problem.title}</h1>
            <Badge className={getDifficultyClass(problem.difficulty)}>{problem.difficulty}</Badge>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {problem.leetcodeLink && (
              <a
                href={problem.leetcodeLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-light-border dark:border-dark-border text-sm text-light-text dark:text-dark-text hover:border-brand-primary"
              >
                <FiExternalLink className="w-4 h-4" />
                View prompt
              </a>
            )}
            <Button variant="ghost" size="icon" className="text-light-textMuted dark:text-dark-muted hover:text-brand-gold">
              <FiBookmark className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-light-textMuted dark:text-dark-muted hover:text-brand-primary">
              <FiStar className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
        {/* Left Panel */}
        <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-light-border dark:border-dark-border flex flex-col min-h-0">
          <div className="flex border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
            {(['description', 'submissions', 'discussions', 'notes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium capitalize ${
                  activeTab === tab
                    ? 'text-brand-primary border-b-2 border-brand-primary bg-indigo-50 dark:bg-dark-cardAlt'
                    : 'text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt'
                } transition-colors`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-light-bg dark:bg-dark-bg">
            {activeTab === 'description' && (
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3">Problem Statement</h3>
                  {sanitizedDescription ? (
                    <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={sanitizedDescription} />
                  ) : (
                    <p className="text-light-textSecondary dark:text-dark-muted leading-relaxed whitespace-pre-wrap">{plainDescription || 'Problem statement will appear here.'}</p>
                  )}
                </section>

                {problem.constraints && problem.constraints.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3">Constraints</h3>
                    <ul className="list-disc pl-5 space-y-2 text-light-textSecondary dark:text-dark-muted">
                      {problem.constraints.map((constraint, idx) => (
                        <li key={idx}>{constraint}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {problem.examples && problem.examples.length > 0 && (
                  <section className="space-y-4">
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text">Examples</h3>
                    {problem.examples.map((ex, idx) => (
                      <div key={idx} className="border border-light-border dark:border-dark-border rounded-2xl p-4 bg-white/80 dark:bg-dark-card">
                        <p className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">Example {idx + 1}</p>
                        <div className="text-xs uppercase tracking-widest text-light-textMuted dark:text-dark-muted mb-1">Input</div>
                        <pre className="bg-light-cardAlt dark:bg-dark-cardAlt rounded-xl p-3 text-sm font-mono text-light-text dark:text-dark-text overflow-x-auto">{ex.input}</pre>
                        <div className="text-xs uppercase tracking-widest text-light-textMuted dark:text-dark-muted mt-3 mb-1">Output</div>
                        <pre className="bg-light-cardAlt dark:bg-dark-cardAlt rounded-xl p-3 text-sm font-mono text-light-text dark:text-dark-text overflow-x-auto">{ex.output}</pre>
                        {ex.explanation && (
                          <p className="text-sm text-light-textSecondary dark:text-dark-muted mt-3">{ex.explanation}</p>
                        )}
                      </div>
                    ))}
                  </section>
                )}

                {visibleTestCases.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3">Sample Test Cases</h3>
                    <div className="space-y-3">
                      {visibleTestCases.map((tc: any, idx: number) => (
                        <div key={idx} className="border border-dashed border-light-border dark:border-dark-border rounded-2xl p-4">
                          <p className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">Test Case {idx + 1}</p>
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <p className="text-xs uppercase tracking-widest text-light-textMuted dark:text-dark-muted mb-1">Input</p>
                              <pre className="bg-light-cardAlt dark:bg-dark-cardAlt rounded-xl p-3 text-sm font-mono text-light-text dark:text-dark-text overflow-x-auto">{tc.input}</pre>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-widest text-light-textMuted dark:text-dark-muted mb-1">Expected Output</p>
                              <pre className="bg-light-cardAlt dark:bg-dark-cardAlt rounded-xl p-3 text-sm font-mono text-light-text dark:text-dark-text overflow-x-auto">{tc.expectedOutput}</pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {problem.hints && problem.hints.length > 0 && (
                  <section>
                    <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-3">Hints</h3>
                    <ol className="list-decimal pl-5 space-y-2 text-light-textSecondary dark:text-dark-muted">
                      {problem.hints.map((hint, idx) => (
                        <li key={idx}>{hint}</li>
                      ))}
                    </ol>
                  </section>
                )}
              </div>
            )}
            {activeTab === 'submissions' && (
              !isAuthenticated ? (
                <EmptyState title="Login Required" message="Sign in to track your submissions." />
              ) : submissionList.length === 0 ? (
                <EmptyState title="No Submissions Yet" message="Submit a solution to see your history here." />
              ) : (
                <div className="space-y-4">
                  {submissionList.map((submission) => {
                    const submissionId = submission._id;
                    const submittedAt = submission.createdAt || submission.submittedAt;
                    const execMs = submission.executionTime ?? submission.performanceSummary?.slowestMs ?? null;
                    const peakMemory = submission.memory ?? submission.performanceSummary?.peakMemoryKb ?? null;
                    const testsSummary = `${submission.passedTests ?? 0} / ${submission.totalTests ?? 0}`;
                    const bestResult = (submission.testResults || submission.results || [])[0];
                    const computedRuntime = execMs ?? bestResult?.executionTime ?? null;
                    const computedMemory = peakMemory ?? bestResult?.memory ?? null;
                    const isExpanded = expandedSubmissionId === submissionId;
                    return (
                      <div key={submissionId} className="border border-light-border dark:border-dark-border rounded-2xl p-4 bg-white/80 dark:bg-dark-card">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-light-text dark:text-dark-text">{formatDateTime(submittedAt)}</p>
                            <p className="text-xs text-light-textMuted dark:text-dark-muted">{submission.language?.toUpperCase()}</p>
                          </div>
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusBadgeClass(submission.status)}`}>
                            {(submission.status || 'pending').replace(/-/g, ' ')}
                          </span>
                        </div>
                        <div className="grid gap-3 md:grid-cols-3 text-sm text-light-textSecondary dark:text-dark-muted mt-4">
                          <div>
                            <p className="text-xs uppercase tracking-widest text-light-textMuted dark:text-dark-muted">Tests</p>
                            <p className="font-semibold text-light-text dark:text-dark-text">{testsSummary}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-light-textMuted dark:text-dark-muted">Runtime</p>
                            <p className="font-semibold text-light-text dark:text-dark-text">{formatRuntime(computedRuntime)}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-light-textMuted dark:text-dark-muted">Memory</p>
                            <p className="font-semibold text-light-text dark:text-dark-text">{formatMemory(computedMemory)}</p>
                          </div>
                        </div>
                        {bestResult?.input && (
                          <div className="mt-4 text-xs text-light-textSecondary dark:text-dark-muted">
                            <p className="font-semibold mb-1">Sample Input</p>
                            <pre className="bg-light-cardAlt dark:bg-dark-cardAlt rounded-xl p-3 font-mono overflow-x-auto">{bestResult.input}</pre>
                          </div>
                        )}
                        <div className="mt-4 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSubmissionCode(submissionId)}
                          >
                            {isExpanded ? 'Hide Code' : 'View Code'}
                          </Button>
                        </div>
                        {isExpanded && (
                          <div className="mt-3">
                            <p className="text-xs uppercase tracking-widest text-light-textMuted dark:text-dark-muted mb-1">Submitted Code</p>
                            <pre className="bg-light-cardAlt dark:bg-dark-cardAlt rounded-xl p-3 text-xs font-mono text-light-text dark:text-dark-text overflow-auto max-h-64 whitespace-pre-wrap">
                              {submission.code || '// Code not stored for this submission.'}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )
            )}
            {activeTab === 'discussions' && <EmptyState title="No Discussions" message="Start a conversation with the community about this problem." />}
            {activeTab === 'notes' && (
              !isAuthenticated ? (
                <EmptyState title="Login Required" message="Sign in to jot down personal notes." />
              ) : (
                <div className="flex flex-col gap-4">
                  <textarea
                    value={noteContent}
                    onChange={handleNoteChange}
                    className="w-full h-64 p-4 rounded-2xl border border-light-border dark:border-dark-border bg-white/80 dark:bg-dark-card text-sm text-light-text dark:text-dark-text focus:outline-none focus:border-brand-primary resize-none"
                    placeholder="Capture ideas, edge cases, or alternative approaches here..."
                    maxLength={5000}
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-light-textMuted dark:text-dark-muted">
                    <span>{noteContent.length}/5000 characters</span>
                    {lastNoteUpdated && <span>Last saved {lastNoteUpdated}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    {noteStatus === 'error' && (
                      <span className="text-xs text-red-500">Failed to save note. Try again.</span>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={noteStatus === 'saving' || !problem}
                    >
                      {noteStatus === 'saving' ? 'Saving...' : noteStatus === 'saved' ? 'Saved' : 'Save Note'}
                    </Button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-0">
          <div className="flex items-center justify-between px-4 py-2 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-light-card dark:bg-dark-cardAlt border border-light-border dark:border-dark-border text-light-text dark:text-dark-text px-3 py-1.5 rounded-md text-sm focus:outline-none focus:border-brand-primary"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {LANGUAGE_LABELS[lang]}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRunCode} disabled={isRunning}>
                {isRunning ? <FiLoader className="animate-spin mr-2" /> : <FiPlay className="mr-2" />}
                {runStatus === 'running' ? 'Running...' : 'Run'}
              </Button>
              <Button variant="primary" size="sm" onClick={handleSubmit} disabled={isRunning}>
                {isRunning ? <FiLoader className="animate-spin mr-2" /> : <FiCheck className="mr-2" />}
                {submitStatus === 'running' ? 'Submitting...' : 'Submit'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateComplexity}
                disabled={isRunning || complexityStatus === 'loading'}
              >
                {complexityStatus === 'loading' ? (
                  <FiLoader className="animate-spin mr-2" />
                ) : (
                  <span className="mr-2">Σ</span>
                )}
                {complexityStatus === 'loading' ? 'Analyzing...' : 'Explain Complexity'}
              </Button>
            </div>
          </div>
          <div className="px-4 py-2 text-xs text-light-textSecondary dark:text-dark-muted border-b border-light-border dark:border-dark-border bg-light-cardAlt dark:bg-dark-cardAlt">
            Implement <span className="font-semibold text-light-text dark:text-dark-text">{activeSignature}</span> (or the method shown in the stub) only. We automatically call it for each test case and compare the returned value against the expected output—no <code>main</code>, no stdin parsing, no manual wiring needed.
          </div>

          <div className="flex-1 relative min-h-0">
            <Editor
              height="100%"
              language={MONACO_LANGUAGE_MAP[language] || 'javascript'}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme={ "vs-dark"}
              options={{ fontSize: 14, minimap: { enabled: false }, scrollBeyondLastLine: false, automaticLayout: true, tabSize: 2, wordWrap: 'on' }}
            />
          </div>

          {showResults && resultsToShow && (
              <div className="flex-none border-t border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card p-4 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text">
                    {isRunResult ? 'Public Test Cases (Run)' : 'Submission Results'}
                  </h3>
                  <button onClick={() => setShowResults(false)} className="text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text">✕</button>
                </div>
                <p className="text-xs text-light-textSecondary dark:text-dark-muted mb-3">
                  {isRunResult
                    ? 'Run calls your solve function for every public test case and compares the returned value with the expected output.'
                    : 'Submit runs public tests first, then hidden ones, halting immediately on the first failure (hidden failures reveal their inputs/outputs).'}
                </p>

                {failedResult && failedResult.passed === false && (
                  <div className={`mb-3 rounded-lg border px-3 py-2 text-sm ${
                    failedResult.isHidden
                      ? 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-500/60 dark:bg-amber-500/10'
                      : 'border-red-300 bg-red-50 text-red-800 dark:border-red-500/60 dark:bg-red-500/10'
                  }`}>
                    <p className="font-semibold">
                      {failedResult.isHidden && !isRunResult ? 'Hidden test failed' : 'First failing test'}
                    </p>
                    <p className="text-xs opacity-80">
                      {isRunResult
                        ? `First failure: test case ${failedResult.testCase} (${failedResult.isHidden ? 'Hidden' : 'Public'})`
                        : `Stopped at test case ${failedResult.testCase} (${failedResult.isHidden ? 'Hidden' : 'Public'})`}
                    </p>
                  </div>
                )}

                {performanceSummary && (
                  <div className="grid grid-cols-2 gap-3 mb-4 text-xs text-light-textSecondary dark:text-dark-muted">
                    <div className="p-3 rounded-lg bg-light-cardAlt dark:bg-dark-cardAlt border border-light-border dark:border-dark-border">
                      <p className="uppercase tracking-widest text-[10px] mb-1">Avg Runtime</p>
                      <p className="text-base font-semibold text-light-text dark:text-dark-text">{formatRuntime(performanceSummary.averageMs)}</p>
                      <p className="mt-1">Fastest: {formatRuntime(performanceSummary.fastestMs)}</p>
                      <p>Slowest: {formatRuntime(performanceSummary.slowestMs)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-light-cardAlt dark:bg-dark-cardAlt border border-light-border dark:border-dark-border">
                      <p className="uppercase tracking-widest text-[10px] mb-1">Peak Memory</p>
                      <p className="text-base font-semibold text-light-text dark:text-dark-text">{formatMemory(performanceSummary.peakMemoryKb)}</p>
                      <p className="mt-1">Remember: Judge0 memory is per process.</p>
                    </div>
                  </div>
                )}

                {publicResultsToShow.length === 0 ? (
                  <p className="text-sm text-light-textSecondary dark:text-dark-muted">No results to display yet. Try running the code again.</p>
                ) : (
                  publicResultsToShow.map((result: any, index: number) => {
                    const showPassFail = typeof result.passed === 'boolean';
                    const passed = !!result.passed;
                    const cardTone = showPassFail
                      ? passed
                        ? 'border-green-500/30 bg-green-500/5'
                        : 'border-red-500/30 bg-red-500/5'
                      : 'border-light-border bg-light-cardAlt dark:border-dark-border dark:bg-dark-cardAlt';

                    return (
                      <div key={index} className={`mb-3 p-3 border rounded-lg ${cardTone}`}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={`font-semibold text-sm ${
                            showPassFail
                              ? passed ? 'text-green-600' : 'text-red-500'
                              : 'text-light-text dark:text-dark-text'
                          }`}>
                            Test Case {result.testCase || index + 1}{showPassFail ? ` · ${passed ? 'Passed' : 'Failed'}` : ''}
                          </span>
                          {result.executionTime !== undefined && result.executionTime !== null && (
                            <span className="text-light-textMuted dark:text-dark-muted text-xs">{result.executionTime}ms</span>
                          )}
                        </div>
                        {result.status && (
                          <p className="text-xs text-light-textSecondary dark:text-dark-muted mb-2">Status: {result.status}</p>
                        )}
                        <div className="text-xs text-light-textSecondary dark:text-dark-muted space-y-1 font-mono">
                          <p><strong>Input:</strong> {JSON.stringify(result.input)}</p>
                          {result.expectedOutput !== undefined && (
                            <p><strong>Expected:</strong> {JSON.stringify(result.expectedOutput)}</p>
                          )}
                          <p><strong>Executed:</strong> {JSON.stringify(result.actualOutput ?? '')}</p>
                          {result.errorOutput && result.errorOutput.trim() !== '' && result.errorOutput !== result.actualOutput && (
                            <p><strong>Error:</strong> {JSON.stringify(result.errorOutput)}</p>
                          )}
                        </div>
                        {result.explanation && (
                          <p className="text-xs text-light-textSecondary dark:text-dark-muted mt-2">{result.explanation}</p>
                        )}
                      </div>
                    );
                  })
                )}

              {resultsToShow.passedTests !== undefined && (
                <div className="mt-2 text-center">
                  <span className={`text-sm font-semibold ${
                    summaryPassed ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {resultsToShow.passedTests} / {resultsToShow.totalTests} test cases passed
                  </span>
                  <p className="text-xs text-light-textMuted dark:text-dark-muted mt-1">
                    Executed {executedTestsCount} test{executedTestsCount === 1 ? '' : 's'} this run
                  </p>
                </div>
              )}

              {!isRunResult && hiddenFailures.length > 0 && (
                <div className="mt-4 pt-3 border-t border-dashed border-light-border dark:border-dark-border">
                  <p className="text-sm font-semibold text-light-text dark:text-dark-text mb-2">Hidden Test Cases (Failed)</p>
                  <p className="text-xs text-light-textSecondary dark:text-dark-muted mb-3">These hidden scenarios failed during submission. Review the input/output to debug.</p>
                  {hiddenFailures.map((result: any, index: number) => (
                    <div key={`hidden-${index}`} className="mb-3 p-3 border border-red-500/30 bg-red-500/5 rounded-lg">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-red-600">Hidden Test {result.testCase}: Failed</span>
                        <span className="text-light-textMuted dark:text-dark-muted text-xs">Status: {result.status || 'Failed'}</span>
                      </div>
                      <div className="text-xs text-light-textSecondary dark:text-dark-muted space-y-1 font-mono">
                        <p><strong>Input:</strong> {JSON.stringify(result.input)}</p>
                        <p><strong>Expected:</strong> {JSON.stringify(result.expectedOutput)}</p>
                        <p><strong>Executed:</strong> {JSON.stringify(result.actualOutput ?? result.executedOutput ?? '')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {complexityStatus !== 'idle' && (
                <div className="mt-4 pt-3 border-t border-dashed border-light-border dark:border-dark-border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-light-text dark:text-dark-text">AI Complexity Insights</p>
                    {complexityStatus === 'loading' && <FiLoader className="animate-spin text-light-textMuted dark:text-dark-muted" />}
                  </div>
                  {complexityStatus === 'failed' && (
                    <p className="text-xs text-red-500">Could not fetch complexity summary. Try again later.</p>
                  )}
                  {complexityStatus !== 'failed' && complexitySummary && (
                    <p className="text-sm text-light-textSecondary dark:text-dark-muted whitespace-pre-wrap">{complexitySummary}</p>
                  )}
                  {complexityStatus === 'succeeded' && !complexitySummary && (
                    <p className="text-xs text-light-textSecondary dark:text-dark-muted">No commentary returned.</p>
                  )}
                </div>
              )}
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProblemEditorPage;
