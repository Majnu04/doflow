import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../src/store';
import { FiCheck, FiBookmark, FiMessageSquare, FiCode, FiStar, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { Card, Badge, Button } from '../src/components/ui';
import api from '../src/utils/api';

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  link?: string;
}

interface Section {
  _id: string;
  title: string;
  description: string;
  problems: Problem[];
  order: number;
}

interface Roadmap {
  _id: string;
  title: string;
  description: string;
  sections: Section[];
  totalProblems: number;
}

const DSARoadmapPage: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [completedProblems, setCompletedProblems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      // Fetch all roadmaps and use the first one (DSA roadmap)
      const response = await api.get('/roadmaps');
      
      if (response.data.length > 0) {
        setRoadmap(response.data[0]);
        
        // Expand first section by default
        if (response.data[0].sections.length > 0) {
          setExpandedSections({ [response.data[0].sections[0]._id]: true });
        }

        if (isAuthenticated) {
          fetchProgress(response.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch roadmap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProgress = async (roadmapId: string) => {
    try {
      const response = await api.get(`/roadmap-progress/${roadmapId}`);
      setProgress(response.data);
      
      // Build completed problems set
      const completed = new Set<string>();
      response.data.sections.forEach((section: any) => {
        section.problems.forEach((problem: any) => {
          if (problem.completed) {
            completed.add(problem.problemId);
          }
        });
      });
      setCompletedProblems(completed);
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleCheckProblem = async (problemId: string, currentStatus: boolean) => {
    if (!isAuthenticated) {
      window.location.hash = '/auth';
      return;
    }

    try {
      await api.put(`/roadmap-progress/${roadmap?._id}/problems/${problemId}`, {
        completed: !currentStatus
      });

      // Update local state
      const newCompleted = new Set(completedProblems);
      if (!currentStatus) {
        newCompleted.add(problemId);
      } else {
        newCompleted.delete(problemId);
      }
      setCompletedProblems(newCompleted);

      // Refresh progress
      fetchProgress(roadmap!._id);
    } catch (error) {
      console.error('Failed to update progress:', error);
    }
  };

  const difficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600';
      case 'medium': return 'text-brand-accent';
      case 'hard': return 'text-red-600';
      default: return 'text-light-textMuted';
    }
  };

  const difficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary mx-auto mb-4"></div>
          <p className="text-light-textSecondary">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="min-h-screen bg-light-bg flex items-center justify-center">
        <div className="bg-light-card border border-light-border rounded-lg p-12 text-center shadow-sm">
          <h2 className="text-2xl font-bold text-light-text mb-4">Roadmap not found</h2>
          <Button variant="primary" onClick={() => window.location.hash = '/'}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-light-text mb-4">
            {roadmap.title}
          </h1>
          <p className="text-light-textSecondary text-lg mb-6">{roadmap.description}</p>
          
          {/* Progress Bar */}
          {progress && (
            <div className="bg-light-card border border-light-border rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-light-textSecondary font-medium">Your Progress</span>
                <span className="text-brand-primary font-bold">{progress.progressPercentage}%</span>
              </div>
              <div className="w-full bg-light-cardAlt rounded-full h-3">
                <div
                  className="bg-brand-primary h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress.progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-sm text-light-textMuted">
                <span>{progress.totalCompleted} / {progress.totalProblems} problems completed</span>
                <span>🔥 {progress.streak} day streak</span>
              </div>
            </div>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {roadmap.sections.map((section, sectionIndex) => {
            const sectionProgress = progress?.sections?.find((s: any) => s.sectionId === section._id);
            const isExpanded = expandedSections[section._id];

            return (
              <div key={section._id} className="bg-light-card border border-light-border rounded-lg overflow-hidden shadow-sm">
                {/* Section Header */}
                <div
                  className="p-6 cursor-pointer hover:bg-light-cardAlt transition-colors"
                  onClick={() => toggleSection(section._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                        sectionIndex === 0 ? 'from-cyan-500 to-blue-500' :
                        sectionIndex === 1 ? 'from-blue-500 to-purple-500' :
                        sectionIndex === 2 ? 'from-purple-500 to-pink-500' :
                        'from-pink-500 to-red-500'
                      } flex items-center justify-center text-white font-bold text-xl shadow-sm`}>
                        {sectionIndex + 1}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-light-text">{section.title}</h3>
                        <p className="text-light-textMuted">{section.problems.length} problems</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {sectionProgress && (
                        <div className="text-right mr-4">
                          <div className="text-brand-primary font-bold">
                            {sectionProgress.completedProblems}/{sectionProgress.totalProblems}
                          </div>
                          <div className="text-light-textMuted text-sm">Completed</div>
                        </div>
                      )}
                      {isExpanded ? (
                        <FiChevronUp className="w-6 h-6 text-light-textMuted" />
                      ) : (
                        <FiChevronDown className="w-6 h-6 text-light-textMuted" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Problems List */}
                {isExpanded && (
                  <div className="border-t border-light-border bg-light-bg">
                    {section.problems.map((problem, problemIndex) => {
                      const isCompleted = completedProblems.has(problem._id);
                      
                      return (
                        <div
                          key={problem._id}
                          className="p-4 border-b border-light-border last:border-b-0 hover:bg-light-cardAlt transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {/* Checkbox */}
                            <button
                              onClick={() => handleCheckProblem(problem._id, isCompleted)}
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                isCompleted
                                  ? 'bg-brand-primary border-brand-primary'
                                  : 'border-light-border hover:border-brand-primary'
                              }`}
                            >
                              {isCompleted && <FiCheck className="w-4 h-4 text-white" />}
                            </button>

                            {/* Problem Number */}
                            <div className="w-8 text-light-textMuted text-sm font-medium flex-shrink-0">
                              {problemIndex + 1}
                            </div>

                            {/* Problem Title */}
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold ${isCompleted ? 'text-light-textMuted line-through' : 'text-light-text'}`}>
                                {problem.title}
                              </h4>
                            </div>

                            {/* Difficulty Badge */}
                            <Badge variant={difficultyBadge(problem.difficulty) as any} className="flex-shrink-0">
                              {problem.difficulty}
                            </Badge>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={() => window.location.hash = `/problem/${problem._id}`}
                                className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                title="Solve Problem"
                              >
                                <FiCode className="w-5 h-5" />
                              </button>
                              <button
                                className="p-2 text-light-textMuted hover:text-brand-primary hover:bg-brand-primary/10 rounded-lg transition-colors"
                                title="Discussions"
                              >
                                <FiMessageSquare className="w-5 h-5" />
                              </button>
                              <button
                                className="p-2 text-light-textMuted hover:text-brand-gold hover:bg-brand-gold/10 rounded-lg transition-colors"
                                title="Bookmark"
                              >
                                <FiBookmark className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DSARoadmapPage;
