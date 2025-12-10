import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiCode, FiLock, FiExternalLink, FiShoppingCart, FiHeart, FiCheckCircle } from 'react-icons/fi';
import { Button, Badge } from '../src/components/ui';
import type { RootState, AppDispatch } from '../src/store';
import { addToCart, getCart } from '../src/store/slices/cartSlice';
import { addToWishlist, getWishlist, removeFromWishlist } from '../src/store/slices/wishlistSlice';
import { fetchDsaCourseData, fetchDsaProgress, Problem } from '../src/store/slices/dsaSlice';
import toast from 'react-hot-toast';
import { ErrorState, EmptyState } from '../src/components/common/StateIndicators';

const DSAPageSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="mb-8">
      <div className="h-10 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-2/3 mb-3"></div>
      <div className="h-4 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/3"></div>
    </div>
    <div className="flex space-x-1 overflow-x-auto pb-2 mb-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-10 bg-light-cardAlt dark:bg-dark-cardAlt rounded-lg w-32 flex-shrink-0"></div>
      ))}
    </div>
    <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-xl">
      <div className="p-4 border-b border-light-border dark:border-dark-border">
        <div className="h-6 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/4"></div>
      </div>
      <div className="divide-y divide-light-border dark:divide-dark-border">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 flex justify-between items-center">
            <div className="h-5 bg-light-cardAlt dark:bg-dark-cardAlt rounded w-1/2"></div>
            <div className="h-8 bg-light-cardAlt dark:bg-dark-cardAlt rounded-md w-24"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DSAProblemsPage: React.FC<{ courseId: string }> = ({ courseId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
  const { course, sections, problems, isEnrolled, status, error, progress, progressStatus } = useSelector((state: RootState) => state.dsa);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const isInWishlist = useMemo(() => wishlistItems.some((item: any) => item._id === courseId), [wishlistItems, courseId]);

  useEffect(() => {
    if (courseId) {
      dispatch(fetchDsaCourseData(courseId));
    }
    if (user) {
      dispatch(getWishlist());
    }
  }, [dispatch, courseId, user]);

  useEffect(() => {
    if (courseId && user) {
      dispatch(fetchDsaProgress(courseId));
    }
  }, [dispatch, courseId, user]);

  useEffect(() => {
    if (status === 'succeeded' && sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0]._id);
    }
  }, [status, sections, activeSectionId]);
  
  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error('Please login to manage your wishlist');
      window.location.hash = '/auth';
      return;
    }

    const action = isInWishlist
      ? dispatch(removeFromWishlist(courseId)).unwrap()
      : dispatch(addToWishlist(courseId)).unwrap();

    const promise = action.then(() => {
      dispatch(getWishlist()); // Refresh wishlist in the background
      return isInWishlist ? 'Removed from wishlist' : 'Added to wishlist!';
    });

    toast.promise(promise, {
      loading: 'Updating wishlist...',
      success: (message) => message,
      error: (err) => err.message || 'Failed to update wishlist',
    });
  };
  
  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add to cart');
      window.location.hash = '/auth';
      return;
    }

    // Check if token exists
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please login again.');
      window.location.hash = '/auth';
      return;
    }

    const promise = dispatch(addToCart(courseId)).unwrap();

    toast.promise(promise, {
      loading: 'Adding to cart...',
      success: () => {
        dispatch(getCart());
        return 'DSA Course added to cart!';
      },
      error: (err) => {
        if (err === 'Not authorized, token failed' || err === 'Not authorized, no token') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTimeout(() => {
            window.location.hash = '/auth';
          }, 1500);
          return 'Session expired. Redirecting to login...';
        }
        return err || 'Failed to add to cart';
      },
    });
  };

  const handleProblemClick = (problem: Problem) => {
    if (!problem.isFree && !isEnrolled) {
      toast.error('This problem is locked. Purchase the course to unlock all problems!');
      return;
    }
    window.location.hash = `/dsa/problem/${problem._id}`;
  };

  const getDifficultyClass = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Hard': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const filteredProblems = useMemo(() => {
    const problemsArray = Array.isArray(problems) ? problems : [];
    return problemsArray.filter(p => p.section === activeSectionId).sort((a, b) => a.order - b.order);
  }, [problems, activeSectionId]);
  
  const activeSection = useMemo(() => 
    sections.find(s => s._id === activeSectionId),
    [sections, activeSectionId]
  );

  const solvedProblemSet = useMemo(() => new Set(progress?.solvedProblemIds || []), [progress?.solvedProblemIds]);
  const solvedProblems = progress?.solvedProblems ?? 0;
  const problemsArray = Array.isArray(problems) ? problems : [];
  const totalProblems = progress?.totalProblems ?? problemsArray.length;
  const progressPercentage = totalProblems ? (progress?.percentage ?? Math.round((solvedProblems / totalProblems) * 100)) : 0;
  const isProgressLoading = progressStatus === 'loading';

  const renderContent = () => {
    if (status === 'loading' || status === 'idle') {
      return <DSAPageSkeleton />;
    }

    if (status === 'failed') {
      return <ErrorState message={error || "Couldn't load the DSA course."} onRetry={() => dispatch(fetchDsaCourseData(courseId))} />;
    }

    if (status === 'succeeded' && (!course || sections.length === 0)) {
        return <EmptyState title="Course Not Found" message="We couldn't find the details for this DSA course." />;
    }

    return (
      <div className="space-y-10">
        <div className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-light-textMuted dark:text-dark-muted">DSA Course Workspace</p>
              <h1 className="text-4xl font-semibold text-light-text dark:text-dark-text mt-2">
                {course?.title || 'DSA Mastery Course'}
              </h1>
              <p className="text-light-textSecondary dark:text-dark-muted mt-2">
                {sections.length} sections • {problemsArray.length}+ curated coding challenges
              </p>
            </div>
            {!isEnrolled && course ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  icon={<FiHeart className={isInWishlist ? 'fill-current text-red-500' : ''} />}
                >
                  {isInWishlist ? 'In Wishlist' : 'Wishlist'}
                </Button>
                <Button variant="primary" onClick={handleAddToCart} icon={<FiShoppingCart />}>
                  Unlock Course – ₹{course.price}
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm w-full">
                <div className="p-4 rounded-2xl bg-light-cardAlt dark:bg-dark-cardAlt border border-border-subtle/40 dark:border-dark-border/50">
                  <p className="text-light-textMuted dark:text-dark-muted uppercase text-[0.65rem] tracking-[0.3em]">Course Progress</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-light-text dark:text-dark-text">
                      {isProgressLoading ? '—' : `${progressPercentage}%`}
                    </span>
                    <span className="text-xs text-light-textSecondary dark:text-dark-muted">
                      {isProgressLoading ? 'Syncing...' : `${solvedProblems}/${totalProblems || problemsArray.length} problems`}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-light-bg dark:bg-dark-bg overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-primary transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-light-textMuted dark:text-dark-muted mt-2">
                    Every accepted submission instantly pushes this bar forward.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-light-cardAlt dark:bg-dark-cardAlt border border-border-subtle/40 dark:border-dark-border/50">
                  <p className="text-light-textMuted dark:text-dark-muted uppercase text-[0.65rem] tracking-[0.3em]">Workspace Access</p>
                  <p className="text-2xl font-semibold text-light-text dark:text-dark-text mt-2">
                    {isEnrolled ? 'Unlocked' : 'Preview Mode'}
                  </p>
                  <p className="text-xs text-light-textSecondary dark:text-dark-muted mt-2">
                    {isEnrolled ? 'Jump back into any problem at any time.' : 'Purchase to unlock every challenge and code runner.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <aside className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-6 h-fit sticky top-28">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-light-textMuted dark:text-dark-muted">Sections</p>
                <p className="text-light-text dark:text-dark-text font-semibold">Choose a track</p>
              </div>
              <span className="text-sm text-light-textMuted dark:text-dark-muted">{sections.length}</span>
            </div>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section._id}
                  onClick={() => setActiveSectionId(section._id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl border transition-all font-semibold text-sm ${
                    activeSectionId === section._id
                      ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20'
                      : 'bg-light-cardAlt dark:bg-dark-cardAlt border-transparent text-light-text dark:text-dark-text hover:border-brand-primary/30'
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </div>
          </aside>

          <section className="bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-light-border dark:border-dark-border">
              <p className="text-xs uppercase tracking-[0.3em] text-light-textMuted dark:text-dark-muted">Selected Section</p>
              <h2 className="text-2xl font-semibold text-light-text dark:text-dark-text mt-1">
                {activeSection?.title || 'Pick a section to get started'}
              </h2>
              <p className="text-sm text-light-textSecondary dark:text-dark-muted">
                {activeSection ? 'Work through the problems below in order, or jump straight to any challenge.' : 'Choose any section from the left to load its curated problems.'}
              </p>
            </div>

            {!isEnrolled && course ? (
              <div className="p-10 text-center space-y-4">
                <p className="text-lg font-semibold text-light-text dark:text-dark-text">Purchase required to unlock the workspace</p>
                <p className="text-light-textSecondary dark:text-dark-muted max-w-xl mx-auto">
                  Access to the interactive question bank and compiler is reserved for enrolled learners. Add the course to your cart to unlock every section instantly.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button variant="outline" onClick={handleWishlistToggle} icon={<FiHeart className={isInWishlist ? 'fill-current text-red-500' : ''} />}>
                    {isInWishlist ? 'In Wishlist' : 'Wishlist'}
                  </Button>
                  <Button variant="primary" onClick={handleAddToCart} icon={<FiShoppingCart />}>
                    Unlock Course – ₹{course.price}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="hidden md:grid grid-cols-[80px,1fr,140px,140px,140px] text-xs font-semibold uppercase tracking-widest text-light-textMuted dark:text-dark-muted border-b border-light-border dark:border-dark-border px-6 py-3">
                  <span>#</span>
                  <span>Title</span>
                  <span>Difficulty</span>
                  <span>Source Link</span>
                  <span>Compiler</span>
                </div>

                {filteredProblems.length > 0 ? (
                  <div className="divide-y divide-light-border dark:divide-dark-border">
                    {filteredProblems.map((problem, index) => (
                      <div key={problem._id} className="px-6 py-4 flex flex-col gap-4 md:grid md:grid-cols-[80px,1fr,140px,140px,140px] md:items-center md:gap-0 hover:bg-light-cardAlt dark:hover:bg-dark-cardAlt transition-colors">
                        <div className="text-sm font-semibold text-light-textMuted dark:text-dark-muted">{index + 1}</div>
                        <div>
                          <p className="font-semibold text-light-text dark:text-dark-text">{problem.title}</p>
                          <p className="text-xs text-light-textSecondary dark:text-dark-muted mt-1">
                            {(problem.description && problem.description.replace(/<[^>]+>/g, '').slice(0, 140)) || 'Structured coding challenge with in-depth explanation.'}
                          </p>
                        </div>
                        <div className="flex md:justify-center">
                          <Badge className={getDifficultyClass(problem.difficulty)}>{problem.difficulty}</Badge>
                        </div>
                        <div className="flex md:justify-center">
                          {problem.leetcodeLink ? (
                            <a
                              href={problem.leetcodeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-brand-primary hover:underline text-sm"
                            >
                              View
                              <FiExternalLink />
                            </a>
                          ) : (
                            <span className="text-xs text-light-textMuted dark:text-dark-muted">—</span>
                          )}
                        </div>
                        <div className="flex md:justify-center">
                          <Button size="sm" variant="primary" onClick={() => handleProblemClick(problem)} icon={<FiCode />}>
                            Open Compiler
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-light-textSecondary dark:text-dark-muted">
                    <p>No problems found in this section.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default DSAProblemsPage;