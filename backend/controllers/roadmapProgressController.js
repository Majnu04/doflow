import UserProgress from '../models/UserProgress.js';
import Roadmap from '../models/Roadmap.js';

// @desc    Get user progress for a roadmap
// @route   GET /api/roadmap-progress/:roadmapId
// @access  Private
export const getUserProgress = async (req, res) => {
  try {
    let progress = await UserProgress.findOne({
      user: req.user._id,
      roadmap: req.params.roadmapId
    });

    if (!progress) {
      // Create initial progress if doesn't exist
      const roadmap = await Roadmap.findById(req.params.roadmapId);
      
      if (!roadmap) {
        return res.status(404).json({ message: 'Roadmap not found' });
      }

      const sections = roadmap.sections.map(section => ({
        sectionId: section._id,
        sectionTitle: section.title,
        problems: section.problems.map(problem => ({
          problemId: problem._id,
          completed: false,
          attempts: 0
        })),
        completedProblems: 0,
        totalProblems: section.problems.length
      }));

      progress = await UserProgress.create({
        user: req.user._id,
        roadmap: req.params.roadmapId,
        course: roadmap.course,
        sections,
        totalProblems: roadmap.totalProblems
      });
    }

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark problem as complete/incomplete
// @route   PUT /api/roadmap-progress/:roadmapId/problems/:problemId
// @access  Private
export const updateProblemStatus = async (req, res) => {
  try {
    const { completed } = req.body;
    
    let progress = await UserProgress.findOne({
      user: req.user._id,
      roadmap: req.params.roadmapId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }

    // Find problem in sections
    let problemFound = false;
    for (let section of progress.sections) {
      const problem = section.problems.find(
        p => p.problemId.toString() === req.params.problemId
      );
      
      if (problem) {
        const wasCompleted = problem.completed;
        problem.completed = completed;
        
        if (completed && !wasCompleted) {
          problem.completedAt = new Date();
          section.completedProblems += 1;
          progress.totalCompleted += 1;
        } else if (!completed && wasCompleted) {
          problem.completedAt = null;
          section.completedProblems -= 1;
          progress.totalCompleted -= 1;
        }
        
        problemFound = true;
        break;
      }
    }

    if (!problemFound) {
      return res.status(404).json({ message: 'Problem not found in progress' });
    }

    progress.calculateProgress();
    progress.lastActivity = new Date();
    await progress.save();

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all user progress (dashboard)
// @route   GET /api/roadmap-progress
// @access  Private
export const getAllProgress = async (req, res) => {
  try {
    const allProgress = await UserProgress.find({ user: req.user._id })
      .populate('roadmap', 'title')
      .populate('course', 'title thumbnail');

    res.json(allProgress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
