import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { FiPlay, FiCheck, FiBookmark, FiMessageSquare, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Button, Card, Badge } from '../src/components/ui';
import api from '../src/utils/api';

interface ProblemEditorPageProps {
  problemId: string;
}

const ProblemEditorPage: React.FC<ProblemEditorPageProps> = ({ problemId }) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [problem, setProblem] = useState<any>(null);
  const [code, setCode] = useState(`// Write your solution here
function solution(input) {
  // input is the array, e.g., [1, 2, 3, 4, 5]
  
  // Your code here
  return -1; // Return the second largest element
}`);
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'discussions' | 'notes'>('description');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    // fetchProblem();
  }, [problemId]);

  useEffect(() => {
    console.log('testResults state changed:', testResults);
    console.log('showResults state:', showResults);
  }, [testResults, showResults]);

  const handleRunCode = async () => {
    console.log('=== RUN CODE STARTED ===');
    console.log('Current code:', code);
    
    setIsRunning(true);
    setShowResults(true);

    try {
      // Default test cases for Second Largest Element problem
      const defaultTestCases = [
        {
          input: '[1, 2, 3, 4, 5]',
          expectedOutput: '4',
          isHidden: false
        },
        {
          input: '[5, 5, 5]',
          expectedOutput: '-1',
          isHidden: false
        },
        {
          input: '[10, 20]',
          expectedOutput: '10',
          isHidden: false
        }
      ];

      const payload = {
        code,
        language,
        testCases: problem?.testCases || defaultTestCases
      };

      console.log('API Endpoint:', 'http://localhost:5000/api/submissions/run');
      console.log('Payload:', JSON.stringify(payload, null, 2));

      const response = await api.post('/submissions/run', payload);

      console.log('✅ API Response:', response.data);
      console.log('Setting test results to state...');
      setTestResults(response.data);
      console.log('Test results set, showResults:', true);
    } catch (error: any) {
      console.error('❌ Failed to run code');
      console.error('Error object:', error);
      console.error('Error response:', error.response);
      console.error('Error message:', error.message);
      
      setTestResults({
        results: [{
          testCase: 1,
          passed: false,
          input: 'Error',
          expectedOutput: '',
          actualOutput: error.response?.data?.message || error.message || 'Network error - check if backend is running on port 5000',
          executionTime: 0
        }],
        passedTests: 0,
        totalTests: 1,
        allPassed: false
      });
    } finally {
      setIsRunning(false);
      console.log('=== RUN CODE COMPLETED ===');
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      window.location.hash = '/auth';
      return;
    }

    setIsRunning(true);

    try {
      const response = await api.post('/submissions/submit', {
        code,
        language,
        problemId,
        problemTitle: problem?.title || 'Unknown Problem',
        testCases: problem?.testCases || [],
        roadmapId: problem?.roadmapId
      });

      setTestResults(response.data.submission);
      setShowResults(true);

      if (response.data.submission.status === 'accepted') {
        alert('✅ All test cases passed! Problem solved successfully!');
      }
    } catch (error) {
      console.error('Failed to submit code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen bg-light-bg flex flex-col pt-20">
      {/* Header */}
      <div className="border-b border-light-border bg-light-card">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <button
              onClick={() => window.history.back()}
              className="p-2 text-light-textMuted hover:text-light-text hover:bg-light-cardAlt rounded-lg transition-colors flex-shrink-0"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-light-text truncate">Second Largest Element</h1>
            <Badge variant="warning" className="flex-shrink-0">Medium</Badge>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="p-2 text-light-textMuted hover:text-brand-gold hover:bg-yellow-50 rounded-lg transition-colors">
              <FiBookmark className="w-5 h-5" />
            </button>
            <button className="p-2 text-light-textMuted hover:text-brand-primary hover:bg-indigo-50 rounded-lg transition-colors">
              <FiStar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 border-r border-light-border flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-light-border bg-light-card">
            {(['description', 'submissions', 'discussions', 'notes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 capitalize ${
                  activeTab === tab
                    ? 'text-brand-primary border-b-2 border-brand-primary bg-indigo-50'
                    : 'text-light-textMuted hover:text-light-text hover:bg-light-cardAlt'
                } transition-colors`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-light-bg">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-light-text mb-4">Problem Statement</h2>
                  <p className="text-light-textSecondary leading-relaxed">
                    Given an array of integers, find the second largest element in the array.
                    If there is no second largest element, return -1.
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-light-text mb-3">Examples</h3>
                  <div className="bg-light-card border border-light-border rounded-lg p-4 mb-4">
                    <div className="text-light-textSecondary">
                      <strong className="text-brand-primary">Input:</strong> [1, 2, 3, 4, 5]<br/>
                      <strong className="text-brand-primary">Output:</strong> 4<br/>
                      <strong className="text-brand-primary">Explanation:</strong> The second largest element is 4
                    </div>
                  </div>
                  <div className="bg-light-card border border-light-border rounded-lg p-4">
                    <div className="text-light-textSecondary">
                      <strong className="text-brand-primary">Input:</strong> [5, 5, 5]<br/>
                      <strong className="text-brand-primary">Output:</strong> -1<br/>
                      <strong className="text-brand-primary">Explanation:</strong> All elements are same
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-light-text mb-3">Constraints</h3>
                  <ul className="list-disc list-inside text-light-textSecondary space-y-2">
                    <li>1 ≤ array length ≤ 10<sup>5</sup></li>
                    <li>-10<sup>9</sup> ≤ array[i] ≤ 10<sup>9</sup></li>
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-light-text mb-3">💡 Hints</h3>
                  <details className="bg-light-card border border-light-border rounded-lg p-4 cursor-pointer">
                    <summary className="text-brand-primary font-semibold">Click to reveal hint 1</summary>
                    <p className="text-light-textSecondary mt-2">Think about sorting the array first</p>
                  </details>
                </div>
              </div>
            )}

            {activeTab === 'submissions' && (
              <div>
                <h2 className="text-2xl font-bold text-light-text mb-4">Your Submissions</h2>
                <p className="text-light-textMuted">No submissions yet. Run your code to see results!</p>
              </div>
            )}

            {activeTab === 'discussions' && (
              <div>
                <h2 className="text-2xl font-bold text-light-text mb-4">Discussions</h2>
                <Button variant="primary" size="sm" className="mb-4">
                  <FiMessageSquare className="mr-2" />
                  New Discussion
                </Button>
                <p className="text-light-textMuted">No discussions yet. Be the first to start one!</p>
              </div>
            )}

            {activeTab === 'notes' && (
              <div>
                <h2 className="text-2xl font-bold text-light-text mb-4">Your Notes</h2>
                <textarea
                  placeholder="Write your notes here..."
                  className="w-full h-64 bg-light-card border border-light-border rounded-lg p-4 text-light-text placeholder-light-textMuted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
                />
                <Button variant="primary" size="sm" className="mt-4">
                  Save Notes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-light-border bg-light-card">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-light-card border border-light-border text-light-text px-4 py-2 rounded-lg focus:outline-none focus:border-brand-primary"
            >
              <option value="javascript">JavaScript</option>
              <option value="python" disabled>Python (Coming Soon)</option>
              <option value="java" disabled>Java (Coming Soon)</option>
            </select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunCode}
                disabled={isRunning}
              >
                <FiPlay className="mr-2" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmit}
                disabled={isRunning}
              >
                <FiCheck className="mr-2" />
                Submit
              </Button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(value) => setCode(value || '')}
              theme="light"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on'
              }}
            />
          </div>

          {/* Test Results */}
          {(() => {
            console.log('Rendering check - showResults:', showResults, 'testResults:', testResults);
            return showResults && testResults ? (
              <div className="border-t border-light-border bg-light-card p-6 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-light-text">Test Results</h3>
                  <button
                    onClick={() => setShowResults(false)}
                    className="text-light-textMuted hover:text-light-text"
                  >
                    ✕
                  </button>
                </div>

                {testResults.results?.map((result: any, index: number) => (
                <div key={index} className={`mb-3 p-4 border rounded-lg ${
                  result.passed ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold ${
                      result.passed ? 'text-green-700' : 'text-red-700'
                    }`}>
                      Test Case {result.testCase}: {result.passed ? 'PASSED ✓' : 'FAILED ✗'}
                    </span>
                    <span className="text-light-textMuted text-sm">{result.executionTime}ms</span>
                  </div>
                  <div className="text-sm text-light-textSecondary space-y-1">
                    <div><strong>Input:</strong> {result.input}</div>
                    <div><strong>Expected:</strong> {result.expectedOutput}</div>
                    <div><strong>Output:</strong> {result.actualOutput}</div>
                  </div>
                </div>
              ))}

              {testResults.passedTests !== undefined && (
                <div className="mt-4 text-center">
                  <span className={`text-lg font-bold ${
                    testResults.allPassed ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    Passed: {testResults.passedTests}/{testResults.totalTests}
                  </span>
                </div>
              )}
            </div>
            ) : null;
          })()}
        </div>
      </div>
    </div>
  );
};

export default ProblemEditorPage;
