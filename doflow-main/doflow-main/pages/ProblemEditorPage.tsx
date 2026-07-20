import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import Editor from '@monaco-editor/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../src/store';
import { FiPlay, FiCheck, FiBookmark, FiStar, FiChevronLeft, FiLoader, FiExternalLink, FiCpu, FiX, FiTerminal, FiZap, FiMaximize2 } from 'react-icons/fi';
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
import { explainSolutionComplexity, reviewCode, explainTopic } from '../services/geminiService';
import {
  setEditorFontSize,
  setEditorTheme,
  setKeybindMode,
  toggleWordWrap,
  toggleMinimap,
  setSearchQuery,
  setDifficultyFilter,
} from '../src/store/slices/workspaceSlice';
import { ExecutionPanel, ProblemDescription, EditorToolbar, AIActions, ConfettiOverlay, WorkspaceLayout, ProblemListPanel } from '../src/components/dsa';
import type { SubmissionPhase } from '../src/components/dsa';
import { fetchDsaCourseData, fetchDsaProgress } from '../src/store/slices/dsaSlice';

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
  return '';
}
`,
  python: `def solve(*args):
    return ''
`,
  cpp: `std::string solve(const std::vector<std::string>& args) {
    return "";
}
`,
  java: `class Solution {
    public static Object solve(String[] args) {
        return "";
    }
}
`,
  c: `const char* solve(int argc, const char* argv[]) {
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
    if (char === '{') depth += 1;
    else if (char === '}') {
      depth -= 1;
      if (depth === 0) return snippet.slice(signatureIndex, i + 1).trim();
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
    if (!line.trim()) { collected.push(line); continue; }
    const lineIndent = line.match(/^\s*/)?.[0].length ?? 0;
    if (lineIndent <= baseIndent) break;
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
  if (language === 'python') return extractPythonBlock(snippet, signatureIndex);
  if (BRACE_LANGUAGES.has(language)) return extractBraceBlock(snippet, signatureIndex);
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
  if (!snippet) return LANGUAGE_SIGNATURES[language] || 'solve(...)';
  const lines = snippet.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!lines.length) return LANGUAGE_SIGNATURES[language] || 'solve(...)';
  if (language === 'python') {
    const methodLine = lines.find((line) => line.startsWith('def '));
    if (methodLine) return methodLine.replace(/:\s*$/, '');
  }
  if (language === 'java') {
    const methodLine = lines.find((line) => line.includes('(') && line.includes(')'));
    if (methodLine) return methodLine.replace(/\{\s*$/, '').trim();
  }
  if (language === 'javascript' || language === 'cpp' || language === 'c') {
    const signatureLine = lines.find((line) => /function\s+|solve\s*\(/.test(line));
    if (signatureLine) return signatureLine.replace(/\{\s*$/, '').trim();
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
  if (value >= 1000) return `${(value / 1000).toFixed(2)} s`;
  if (value >= 10) return `${value.toFixed(1)} ms`;
  return `${value.toFixed(3)} ms`;
};

const formatMemory = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (value >= 1024) return `${(value / 1024).toFixed(2)} MB`;
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
    case 'accepted': return 'bg-green-100 text-green-700';
    case 'wrong-answer': return 'bg-red-100 text-red-700';
    case 'runtime-error': return 'bg-orange-100 text-orange-700';
    case 'time-limit-exceeded': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const generateMentorResponse = async (instructions: string, code?: string, language?: string): Promise<string> => {
  const response = await fetch('/api/ai/mentor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instructions, code, language }),
  });
  if (!response.ok) throw new Error('AI service unavailable');
  const data = await response.json();
  return data.response || 'No response generated.';
};

interface ProblemEditorPageProps {
  problemId: string;
}

const ProblemEditorPage: React.FC<ProblemEditorPageProps> = ({ problemId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
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

  const workspace = useSelector((state: RootState) => state.workspace);
  const { sections, problems: courseProblems, progress } = useSelector((state: RootState) => state.dsa);

  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<typeof SUPPORTED_LANGUAGES[number]>('javascript');
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'discussions' | 'notes'>('description');
  const [showResults, setShowResults] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [activeAiAction, setActiveAiAction] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [noteStatus, setNoteStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [submitPhase, setSubmitPhase] = useState<SubmissionPhase | null>(null);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const editorRef = useRef<any>(null);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (problemId) {
      dispatch(fetchProblemData(problemId));
    }
    return () => {
      dispatch(clearRunResults());
      dispatch(clearSubmitResults());
    }
  }, [problemId, dispatch]);

  const courseId = problem?.course;
  useEffect(() => {
    if (courseId) {
      dispatch(fetchDsaCourseData(courseId));
      if (user) dispatch(fetchDsaProgress(courseId));
    }
  }, [dispatch, courseId, user]);

  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0]._id);
    }
  }, [sections, activeSectionId]);

  const hasAutoSelectedLanguage = useRef(false);

  useEffect(() => {
    if (!problem?.starterCode?.length || hasAutoSelectedLanguage.current) return;
    if (!problem.starterCode.some((sc: any) => sc.language === language)) {
      const fallbackLanguage = problem.starterCode[0]?.language;
      if (fallbackLanguage) setLanguage(fallbackLanguage as typeof SUPPORTED_LANGUAGES[number]);
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

  useEffect(() => {
    if (runStatus === 'failed' && runError) toast.error(`Run failed: ${runError}`);
  }, [runStatus, runError]);

  useEffect(() => {
    if (submitStatus === 'failed' && submitError) toast.error(`Submit failed: ${submitError}`);
    if (submitStatus === 'succeeded' && submitResults) {
      if (submitResults.submission.status === 'accepted') {
        toast.success('All test cases passed! Problem solved successfully!');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      } else {
        toast.error('Some test cases failed. Keep trying!');
      }
    }
  }, [submitStatus, submitError, submitResults]);

  useEffect(() => {
    if (submitStatus === 'running') {
      setSubmitPhase('queued');
      const phases: SubmissionPhase[] = ['queued', 'compiling', 'running', 'checking', 'generating'];
      phases.forEach((p, i) => {
        setTimeout(() => setSubmitPhase(p), (i + 1) * 800);
      });
    }
    if (submitStatus === 'succeeded') {
      const finalPhase: SubmissionPhase = submitResults?.submission?.status === 'accepted' ? 'accepted' : 'rejected';
      setTimeout(() => setSubmitPhase(finalPhase), 5000);
    }
    if (submitStatus === 'failed') {
      setSubmitPhase('rejected');
    }
  }, [submitStatus, submitResults]);

  useEffect(() => {
    if (runStatus === 'running' || submitStatus === 'running') {
      setAiResponse(null);
      setActiveAiAction(null);
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
    setShowConsole(true);
    setSubmitPhase(null);
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
    setShowConsole(true);
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

  const handleAiAction = useCallback(async (action: string) => {
    if (!code || !code.trim()) {
      toast.error('Write some code first.');
      return;
    }
    setActiveAiAction(action);
    setAiLoading(true);
    setAiResponse(null);
    try {
      let response = '';
      switch (action) {
        case 'explain':
          response = await explainTopic(problem?.title || 'this coding problem');
          break;
        case 'approach': {
          const approachPrompt = `You are a DSA mentor. Given this ${language} problem "${problem?.title}", provide a step-by-step solution approach. Include: 1) Problem analysis, 2) Optimal algorithm choice, 3) Step-by-step approach, 4) Complexity analysis. Keep it under 200 words.`;
          response = await generateMentorResponse(approachPrompt, code, language);
          break;
        }
        case 'review':
          response = await reviewCode(code);
          break;
        case 'optimize': {
          const optimizePrompt = `You are a performance optimization expert. Review this ${language} code and suggest specific optimizations to improve time and space complexity. Show the optimized version. Code:\n${code.slice(0, 4000)}`;
          response = await generateMentorResponse(optimizePrompt, code, language);
          break;
        }
        case 'complexity':
          response = await explainSolutionComplexity({ language, code, problemTitle: problem?.title });
          break;
        case 'edge-cases': {
          const edgePrompt = `You are a testing expert. Given this problem "${problem?.title}" and the following ${language} solution, generate 5 important edge cases with inputs and expected outputs. Focus on boundary conditions, empty inputs, large values, and tricky scenarios.\n\nCode:\n${code.slice(0, 3000)}`;
          response = await generateMentorResponse(edgePrompt, code, language);
          break;
        }
        case 'dry-run': {
          const dryRunPrompt = `You are a teaching assistant. Perform a detailed dry run of this ${language} code on a small example input. Show the state at each step (variable values, loop iterations, recursive calls). Keep it educational.\n\nCode:\n${code.slice(0, 3000)}`;
          response = await generateMentorResponse(dryRunPrompt, code, language);
          break;
        }
        case 'similar': {
          const similarPrompt = `Based on the problem "${problem?.title}" (difficulty: ${problem?.difficulty}), suggest 5 similar LeetCode problems with their difficulty levels and what concept they share with this problem. Format as a list.`;
          response = await generateMentorResponse(similarPrompt, code, language);
          break;
        }
      }
      setAiResponse(response || 'No response generated.');
    } catch (err: any) {
      toast.error(err?.message || 'AI action failed. Please try again.');
      setAiResponse(null);
    } finally {
      setAiLoading(false);
    }
  }, [code, language, problem]);

  const toggleSubmissionCode = (submissionId: string) => {
    setExpandedSubmissionId(prev => (prev === submissionId ? null : submissionId));
  };

  const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(event.target.value);
    if (noteStatus === 'saved' || noteStatus === 'error') setNoteStatus('idle');
  };

  const handleSaveNote = async () => {
    if (!isAuthenticated) { toast.error('Login to save notes.'); window.location.hash = '/auth'; return; }
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
      setNoteStatus('error');
      toast.error(error?.message || 'Unable to save note');
    }
  };

  const handleFormatCode = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  }, []);

  const handleResetCode = useCallback(() => {
    if (!starterEntry) return;
    const rawSnippet = starterEntry?.visibleCode ?? starterEntry?.code ?? DEFAULT_SNIPPETS[language] ?? '';
    const visibleSnippet = starterEntry?.visibleCode ? rawSnippet : (extractSolveSection(language, rawSnippet) || rawSnippet);
    setCode(visibleSnippet);
    toast.success('Code reset to starter template');
  }, [starterEntry, language]);

  const handleDownloadCode = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [code, language]);

  const handleUploadCode = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.js,.py,.cpp,.java,.c';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const content = ev.target?.result as string;
        if (content) setCode(content);
      };
      reader.readAsText(file);
    };
    input.click();
  }, []);

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
    if (Array.isArray((resultsToShow as any).results)) return (resultsToShow as any).results;
    if (Array.isArray((resultsToShow as any).testResults)) return (resultsToShow as any).testResults;
    return [];
  }, [resultsToShow]);
  const publicResults = useMemo(() => displayedResults.filter((result: any) => !result.isHidden), [displayedResults]);
  const hiddenFailedResults = useMemo(() => displayedResults.filter((result: any) => result.isHidden && result.passed === false), [displayedResults]);
  const hiddenFailures = useMemo(() => {
    if (hiddenFailedResults.length > 0) return hiddenFailedResults;
    if (submitResults?.hiddenFailures) return submitResults.hiddenFailures.map((failure: any) => ({ ...failure, isHidden: true, passed: false, actualOutput: failure.actualOutput ?? failure.executedOutput }));
    return [];
  }, [hiddenFailedResults, submitResults]);
  const summaryPassed = useMemo(() => {
    if (isRunResult) return Boolean((resultsToShow as any)?.allPassed);
    if (submitResults?.submission) return submitResults.submission.status === 'accepted';
    if (runResults && typeof runResults.allPassed === 'boolean') return runResults.allPassed;
    return false;
  }, [isRunResult, resultsToShow, submitResults]);
  const performanceSummary = useMemo<PerformanceSummary | null>(() => {
    if (isRunResult) return (runResults as any)?.performanceSummary ?? null;
    if (submitResults?.performanceSummary) return submitResults.performanceSummary as PerformanceSummary;
    if (submitResults?.submission?.performanceSummary) return submitResults.submission.performanceSummary as PerformanceSummary;
    if ((resultsToShow as any)?.performanceSummary) return (resultsToShow as any).performanceSummary as PerformanceSummary;
    return null;
  }, [isRunResult, runResults, submitResults, resultsToShow]);
  const visibleTestCases = useMemo(() => problem?.testCases?.filter((tc: any) => !tc.isHidden) || [], [problem]);
  const publicResultsToShow = useMemo(() => {
    if (visibleTestCases.length === 0) return publicResults.length > 0 ? publicResults : displayedResults;
    const resultsByIndex = new Map<number, any>();
    publicResults.forEach((result: any) => {
      const idx = typeof result.originalIndex === 'number' ? result.originalIndex : typeof result.testCase === 'number' ? result.testCase - 1 : null;
      if (idx !== null && idx >= 0) resultsByIndex.set(idx, result);
    });
    const merged = visibleTestCases.map((testCase: any, idx: number) => {
      const matched = resultsByIndex.get(idx);
      if (matched) return { ...matched, testCase: idx + 1, input: matched.input ?? testCase.input, expectedOutput: matched.expectedOutput ?? testCase.expectedOutput, status: matched.status || (matched.passed ? 'Accepted' : matched.passed === false ? 'Failed' : 'Executed'), actualOutput: matched.actualOutput ?? '' };
      return { testCase: idx + 1, input: testCase.input, expectedOutput: testCase.expectedOutput, actualOutput: 'Not executed', status: 'Not executed', passed: null, isHidden: false };
    });
    publicResults.forEach((result: any) => {
      const idx = typeof result.originalIndex === 'number' ? result.originalIndex : typeof result.testCase === 'number' ? result.testCase - 1 : -1;
      if (idx < 0 || idx >= merged.length) merged.push(result);
    });
    return merged;
  }, [visibleTestCases, publicResults, displayedResults]);
  const sanitizedDescription = useMemo(() => {
    if (!problem?.description) return null;
    return /<[^>]+>/.test(problem.description) ? { __html: problem.description } : null;
  }, [problem]);

  const executionResults = useMemo(() => {
    return publicResultsToShow.map((r: any) => ({
      passed: r.passed === true,
      input: typeof r.input === 'string' ? r.input : JSON.stringify(r.input),
      expectedOutput: typeof r.expectedOutput === 'string' ? r.expectedOutput : JSON.stringify(r.expectedOutput),
      actualOutput: typeof r.actualOutput === 'string' ? r.actualOutput : JSON.stringify(r.actualOutput ?? ''),
      executionTime: r.executionTime,
      memoryUsed: r.memory,
      error: r.errorOutput,
      isHidden: r.isHidden,
    }));
  }, [publicResultsToShow]);

  const execTime = useMemo(() => {
    if (performanceSummary?.slowestMs) return performanceSummary.slowestMs;
    return null;
  }, [performanceSummary]);

  const activeSignature = useMemo(() => {
    const snippetSource = starterEntry?.visibleCode ?? starterEntry?.code ?? '';
    return deriveSignature(language, snippetSource) || (LANGUAGE_SIGNATURES[language] || 'solve(...)');
  }, [language, starterEntry]);
  const lastNoteUpdated = useMemo(() => {
    if (!notes?.updatedAt) return null;
    try { return new Date(notes.updatedAt).toLocaleString(); } catch { return notes.updatedAt; }
  }, [notes?.updatedAt]);

  const submissionList = useMemo(() => {
    if (Array.isArray(submissions)) return submissions;
    if (submissions && Array.isArray((submissions as any).submissions)) return (submissions as any).submissions;
    if (submissions && Array.isArray((submissions as any).data)) return (submissions as any).data;
    return [];
  }, [submissions]);

  const courseProblemsArray = useMemo(() => Array.isArray(courseProblems) ? courseProblems : [], [courseProblems]);
  const solvedProblemSet = useMemo(() => new Set(progress?.solvedProblemIds || []), [progress?.solvedProblemIds]);
  const solvedCount = progress?.solvedProblems ?? solvedProblemSet.size;
  const totalCount = progress?.totalProblems ?? courseProblemsArray.length;
  const progressPercentage = totalCount ? Math.round((solvedCount / totalCount) * 100) : 0;
  const currentStreak = (progress as any)?.currentStreak ?? 0;

  const sectionSolvedCounts = useMemo(() => {
    const counts: Record<string, { solved: number; total: number }> = {};
    sections.forEach(s => {
      const sectionProblems = courseProblemsArray.filter(p => p.section === s._id);
      const solved = sectionProblems.filter(p => solvedProblemSet.has(p._id)).length;
      counts[s._id] = { solved, total: sectionProblems.length };
    });
    return counts;
  }, [sections, courseProblemsArray, solvedProblemSet]);

  const handleProblemSelect = useCallback((problem: any) => {
    if (problem._id === problemId) return;
    window.location.hash = `/dsa/problem/${problem._id}`;
  }, [problemId]);

  const handleSectionChange = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    dispatch(setSearchQuery(''));
    dispatch(setDifficultyFilter(null));
  }, [dispatch]);

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  if (status === 'loading' || status === 'idle') {
    return (
      <div className="h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-14 h-14 border-[3px] border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 bg-brand-primary rounded-full animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-semibold text-light-text dark:text-dark-text">Loading workspace</p>
          <p className="text-xs text-light-textMuted dark:text-dark-muted">Preparing problem, editor, and test cases...</p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return <ErrorState message={error || "Failed to load problem."} onRetry={() => dispatch(fetchProblemData(problemId))} />;
  }

  if (!problem) {
    return <EmptyState title="Problem Not Found" message="The requested problem could not be loaded." />;
  }

  return (
    <div className="h-screen bg-light-bg dark:bg-dark-bg flex flex-col overflow-hidden">
      <ConfettiOverlay active={showConfetti} duration={3000} />

      {/* Compact Header */}
      <div className="flex-shrink-0 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => window.location.hash = `/dsa/problems/${problem.course}`}
              className="p-1 text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt rounded-md transition-colors flex-shrink-0"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-bold text-light-text dark:text-dark-text truncate">{problem.title}</h1>
            <Badge className={getDifficultyClass(problem.difficulty)}>{problem.difficulty}</Badge>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {problem.leetcodeLink && (
              <a href={problem.leetcodeLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-light-border dark:border-dark-border text-[11px] text-light-text dark:text-dark-text hover:border-brand-primary hover:bg-brand-primary/5 transition-all"
              >
                <FiExternalLink className="w-3 h-3" /> View
              </a>
            )}
            <Button variant="ghost" size="icon" className="text-light-textMuted dark:text-dark-muted hover:text-brand-gold !w-7 !h-7">
              <FiBookmark className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-light-textMuted dark:text-dark-muted hover:text-brand-primary !w-7 !h-7">
              <FiStar className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Three Panel Layout */}
      <div className="flex-1 overflow-hidden min-h-0 bg-light-bg dark:bg-dark-bg">
        <WorkspaceLayout
          leftPanel={
            <ProblemListPanel
              sections={sections}
              problems={courseProblemsArray.filter(p => !activeSectionId || p.section === activeSectionId)}
              activeProblemId={problemId}
              solvedProblemIds={solvedProblemSet}
              sectionSolvedCounts={sectionSolvedCounts}
              solvedCount={solvedCount}
              totalCount={totalCount}
              progressPercentage={progressPercentage}
              currentStreak={currentStreak}
              onProblemSelect={handleProblemSelect}
              onSectionChange={handleSectionChange}
              activeSectionId={activeSectionId}
              isEnrolled={false}
            />
          }
          centerPanel={
            <div className="h-full flex flex-col min-h-0">
              <div className="sticky top-0 z-10 flex-shrink-0 flex border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
                {(['description', 'submissions', 'discussions', 'notes'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2 text-[11px] font-semibold capitalize tracking-wide ${
                      activeTab === tab
                        ? 'text-brand-primary border-b-2 border-brand-primary bg-brand-primary/5'
                        : 'text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt'
                    } transition-all`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto bg-light-bg dark:bg-dark-bg scrollbar-thin">
                {activeTab === 'description' && (
                  <ProblemDescription
                    title={problem.title}
                    difficulty={problem.difficulty}
                    description={sanitizedDescription?.__html || problem.description}
                    examples={problem.examples || []}
                    constraints={problem.constraints || []}
                    hints={problem.hints || []}
                    tags={problem.tags}
                    acceptanceRate={problem.acceptanceRate}
                    timeLimit={problem.timeLimit}
                    memoryLimit={problem.memoryLimit}
                  />
                )}
                {activeTab === 'submissions' && (
                  !isAuthenticated ? (
                    <EmptyState title="Login Required" message="Sign in to track your submissions." />
                  ) : submissionList.length === 0 ? (
                    <EmptyState title="No Submissions Yet" message="Submit a solution to see your history here." />
                  ) : (
                    <div className="h-full">
                      <Virtuoso
                        className="h-full"
                        totalCount={submissionList.length}
                        overscan={200}
                        itemContent={(index) => {
                          const submission = submissionList[index];
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
                            <div className="px-6 py-2">
                              <div className="border border-light-border dark:border-dark-border rounded-2xl p-4 bg-white/80 dark:bg-dark-card">
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
                                  <Button variant="outline" size="sm" onClick={() => toggleSubmissionCode(submissionId)}>
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
                            </div>
                          );
                        }}
                      />
                    </div>
                  )
                )}
                {activeTab === 'discussions' && <EmptyState title="No Discussions" message="Start a conversation with the community about this problem." />}
                {activeTab === 'notes' && (
                  !isAuthenticated ? (
                    <EmptyState title="Login Required" message="Sign in to jot down personal notes." />
                  ) : (
                    <div className="p-6 flex flex-col gap-4">
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
                        {noteStatus === 'error' && <span className="text-xs text-red-500">Failed to save note. Try again.</span>}
                        <Button variant="primary" size="sm" onClick={handleSaveNote} disabled={noteStatus === 'saving' || !problem}>
                          {noteStatus === 'saving' ? 'Saving...' : noteStatus === 'saved' ? 'Saved' : 'Save Note'}
                        </Button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          }
          rightPanel={
            <div className="h-full flex flex-col min-h-0">
              <EditorToolbar
                fontSize={workspace.editorFontSize}
                onFontSizeChange={(size) => dispatch(setEditorFontSize(size))}
                theme={workspace.editorTheme}
                onThemeChange={(theme) => dispatch(setEditorTheme(theme as any))}
                wordWrap={workspace.wordWrap}
                onWordWrapToggle={() => dispatch(toggleWordWrap())}
                minimap={workspace.minimap}
                onMinimapToggle={() => dispatch(toggleMinimap())}
                keybindMode={workspace.keybindMode}
                onKeybindModeChange={(mode) => dispatch(setKeybindMode(mode as any))}
                onFormatCode={handleFormatCode}
                onResetCode={handleResetCode}
                onDownloadCode={handleDownloadCode}
                onUploadCode={handleUploadCode}
              />
              <div className="flex items-center justify-between px-2 py-1 border-b border-light-border dark:border-dark-border bg-light-card dark:bg-dark-card">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-light-bg dark:bg-dark-bg border border-border-subtle dark:border-dark-border text-light-text dark:text-dark-text px-1.5 py-0.5 rounded text-[11px] font-medium focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/30"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>{LANGUAGE_LABELS[lang]}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowAiDrawer(prev => !prev)}
                    className={`px-2 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-all ${
                      showAiDrawer
                        ? 'bg-brand-primary text-white'
                        : 'text-light-textMuted dark:text-dark-muted hover:text-brand-primary hover:bg-brand-primary/5'
                    }`}
                    title="AI Assistant"
                  >
                    <FiZap className="w-3 h-3" />
                    AI
                  </button>
                  <div className="w-px h-3.5 bg-border-subtle dark:border-dark-border" />
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
                  >
                    {isRunning ? (
                      <FiLoader className="animate-spin w-3 h-3" />
                    ) : (
                      <FiPlay className="w-3 h-3 fill-current" />
                    )}
                    {runStatus === 'running' ? 'Run...' : 'Run'}
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isRunning}
                    className="px-2.5 py-1 rounded text-[11px] font-bold bg-brand-primary hover:bg-brand-primaryHover text-white flex items-center gap-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]"
                  >
                    {isRunning ? (
                      <FiLoader className="animate-spin w-3 h-3" />
                    ) : (
                      <FiCheck className="w-3 h-3" />
                    )}
                    {submitStatus === 'running' ? 'Sub...' : 'Submit'}
                  </button>
                </div>
              </div>
              <div className="flex-1 relative min-h-0">
                <Editor
                  height="100%"
                  language={MONACO_LANGUAGE_MAP[language] || 'javascript'}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  theme={workspace.editorTheme}
                  options={{
                    fontSize: workspace.editorFontSize,
                    minimap: { enabled: workspace.minimap },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: workspace.tabSize,
                    wordWrap: workspace.wordWrap ? 'on' : 'off',
                    padding: { top: 12 },
                  }}
                  onMount={handleEditorDidMount}
                />
              </div>
            </div>
          }
          consoleDrawer={
            showResults && resultsToShow ? (
              <ExecutionPanel
                results={executionResults}
                isRunning={isRunning}
                submitPhase={submitPhase}
                performanceSummary={performanceSummary ? {
                  averageMs: performanceSummary.averageMs ?? null,
                  fastestMs: performanceSummary.fastestMs ?? null,
                  slowestMs: performanceSummary.slowestMs ?? null,
                  peakMemoryKb: performanceSummary.peakMemoryKb ?? null,
                } : null}
                executionTime={execTime}
                memoryUsed={performanceSummary?.peakMemoryKb ?? null}
                error={runError || submitError}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FiTerminal className="w-6 h-6 mx-auto text-light-textMuted/20 dark:text-dark-muted/20 mb-2" />
                  <p className="text-[11px] text-light-textMuted dark:text-dark-muted">Run or Submit to see results</p>
                </div>
              </div>
            )
          }
          consoleDrawerOpen={showConsole}
          onConsoleDrawerToggle={() => setShowConsole(prev => !prev)}
          aiDrawer={
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border-subtle dark:border-dark-border bg-light-card dark:bg-dark-card">
                <div className="flex items-center gap-1.5">
                  <FiCpu className="w-3.5 h-3.5 text-brand-primary" />
                  <span className="text-xs font-bold text-light-text dark:text-dark-text">AI Assistant</span>
                </div>
                <button
                  onClick={() => setShowAiDrawer(false)}
                  className="p-1 rounded text-light-textMuted dark:text-dark-muted hover:text-light-text dark:hover:text-dark-text hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt transition-colors"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2.5 scrollbar-thin">
                {aiResponse ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary capitalize">
                      <FiCpu className="w-3.5 h-3.5" /> {activeAiAction?.replace('-', ' ')}
                    </div>
                    <div className="text-xs text-light-textSecondary dark:text-dark-muted whitespace-pre-wrap leading-relaxed">
                      {aiResponse}
                    </div>
                    <button
                      onClick={() => { setAiResponse(null); setActiveAiAction(null); }}
                      className="text-[10px] text-brand-primary hover:underline"
                    >
                      Clear & try another action
                    </button>
                  </div>
                ) : (
                  <AIActions onAction={handleAiAction} loadingAction={activeAiAction} />
                )}
              </div>
            </div>
          }
          aiDrawerOpen={showAiDrawer}
        />

        {/* Floating AI Button */}
        {!showAiDrawer && (
          <button
            onClick={() => setShowAiDrawer(true)}
            className="floating-ai-btn"
            title="Open AI Assistant"
          >
            <FiZap className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProblemEditorPage;
