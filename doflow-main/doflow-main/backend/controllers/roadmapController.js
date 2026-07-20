import Roadmap from '../models/Roadmap.js';
import UserProgress from '../models/UserProgress.js';

// @desc    Get all roadmaps for a course (or all roadmaps if no courseId)
// @route   GET /api/roadmaps/:courseId or GET /api/roadmaps
// @access  Public
export const getRoadmaps = async (req, res) => {
  try {
    const query = req.params.courseId ? { course: req.params.courseId } : {};
    const roadmaps = await Roadmap.find(query);
    res.json(roadmaps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single roadmap with progress
// @route   GET /api/roadmaps/:id/details
// @access  Private
export const getRoadmapDetails = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);
    
    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    // Get user progress if authenticated
    let progress = null;
    if (req.user) {
      progress = await UserProgress.findOne({
        user: req.user._id,
        roadmap: req.params.id
      });
    }

    res.json({ roadmap, progress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create roadmap (Admin)
// @route   POST /api/roadmaps
// @access  Private/Admin
export const createRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.create(req.body);
    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update roadmap (Admin)
// @route   PUT /api/roadmaps/:id
// @access  Private/Admin
export const updateRoadmap = async (req, res) => {
  try {
    const roadmap = await Roadmap.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add section to roadmap (Admin)
// @route   POST /api/roadmaps/:id/sections
// @access  Private/Admin
export const addSection = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    roadmap.sections.push(req.body);
    await roadmap.save();

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add problem to section (Admin)
// @route   POST /api/roadmaps/:id/sections/:sectionId/problems
// @access  Private/Admin
export const addProblem = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const section = roadmap.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    section.problems.push(req.body);
    await roadmap.save();

    res.status(201).json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update problem (Admin)
// @route   PUT /api/roadmaps/:id/sections/:sectionId/problems/:problemId
// @access  Private/Admin
export const updateProblem = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const section = roadmap.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    const problem = section.problems.id(req.params.problemId);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    Object.assign(problem, req.body);
    await roadmap.save();

    res.json(roadmap);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete problem (Admin)
// @route   DELETE /api/roadmaps/:id/sections/:sectionId/problems/:problemId
// @access  Private/Admin
export const deleteProblem = async (req, res) => {
  try {
    const roadmap = await Roadmap.findById(req.params.id);

    if (!roadmap) {
      return res.status(404).json({ message: 'Roadmap not found' });
    }

    const section = roadmap.sections.id(req.params.sectionId);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }

    section.problems.pull(req.params.problemId);
    await roadmap.save();

    res.json({ message: 'Problem deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
