import RoadmapSection from '../models/RoadmapSection.js';
import Problem from '../models/Problem.js';
import Course from '../models/Course.js';
import { buildDsaProgressSnapshot } from '../utils/dsaProgress.js';

// @desc    Create a new DSA section
// @route   POST /api/dsa/sections
// @access  Private/Admin
export const createSection = async (req, res) => {
  const { title, courseId, order, description } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const section = await RoadmapSection.create({
      title,
      course: courseId,
      order,
      description,
    });

    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all sections for a course
// @route   GET /api/dsa/sections?courseId=...
// @access  Public
export const getSections = async (req, res) => {
  const { courseId } = req.query;
  try {
    const sections = await RoadmapSection.find({ course: courseId }).sort('order');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a section
// @route   PUT /api/dsa/sections/:id
// @access  Private/Admin
export const updateSection = async (req, res) => {
  const { title, order, description } = req.body;
  try {
    const section = await RoadmapSection.findByIdAndUpdate(
      req.params.id,
      { title, order, description },
      { new: true, runValidators: true }
    );
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a section
// @route   DELETE /api/dsa/sections/:id
// @access  Private/Admin
export const deleteSection = async (req, res) => {
  try {
    const section = await RoadmapSection.findById(req.params.id);
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    await Problem.deleteMany({ section: section._id });
    await RoadmapSection.deleteOne({ _id: section._id });
    res.json({ message: 'Section and associated problems removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new problem
// @route   POST /api/dsa/problems
// @access  Private/Admin
export const createProblem = async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json(problem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all problems for a section
// @route   GET /api/dsa/problems?sectionId=...&page=1&limit=50
// @access  Public
export const getProblems = async (req, res) => {
  const { sectionId, courseId, page = 1, limit = 50 } = req.query;
  let query = {};
  if (sectionId) query.section = sectionId;
  if (courseId) query.course = courseId;

  try {
    const problems = await Problem.find(query)
      .sort('order')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Problem.countDocuments(query);
    
    res.json({
      problems,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single problem
// @route   GET /api/dsa/problems/:id
// @access  Public
export const getProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a problem
// @route   PUT /api/dsa/problems/:id
// @access  Private/Admin
export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a problem
// @route   DELETE /api/dsa/problems/:id
// @access  Private/Admin
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    await Problem.deleteOne({ _id: problem._id });
    res.json({ message: 'Problem removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get DSA course progress for the authenticated user
// @route   GET /api/dsa/progress/:courseId
// @access  Private
export const getCourseProgress = async (req, res) => {
  try {
    const progressSnapshot = await buildDsaProgressSnapshot(req.user._id, req.params.courseId);

    if (!progressSnapshot) {
      return res.status(404).json({ message: 'No progress available for this course' });
    }

    res.json(progressSnapshot);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
