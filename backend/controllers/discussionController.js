import Discussion from '../models/Discussion.js';

// @desc    Get discussions for a problem
// @route   GET /api/discussions/problem/:problemId
// @access  Public
export const getProblemDiscussions = async (req, res) => {
  try {
    const discussions = await Discussion.find({ problem: req.params.problemId })
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(discussions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create discussion
// @route   POST /api/discussions
// @access  Private
export const createDiscussion = async (req, res) => {
  try {
    const { problemId, title, content, tags } = req.body;

    const discussion = await Discussion.create({
      problem: problemId,
      user: req.user._id,
      title,
      content,
      tags: tags || []
    });

    await discussion.populate('user', 'name avatar');

    res.status(201).json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add reply to discussion
// @route   POST /api/discussions/:id/replies
// @access  Private
export const addReply = async (req, res) => {
  try {
    const { content } = req.body;

    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    discussion.replies.push({
      user: req.user._id,
      content
    });

    await discussion.save();
    await discussion.populate('replies.user', 'name avatar');

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like discussion
// @route   PUT /api/discussions/:id/like
// @access  Private
export const likeDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    const index = discussion.likes.indexOf(req.user._id);

    if (index > -1) {
      discussion.likes.splice(index, 1);
    } else {
      discussion.likes.push(req.user._id);
    }

    await discussion.save();

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark discussion as solved
// @route   PUT /api/discussions/:id/solve
// @access  Private
export const markAsSolved = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    discussion.isSolved = !discussion.isSolved;
    await discussion.save();

    res.json(discussion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete discussion
// @route   DELETE /api/discussions/:id
// @access  Private
export const deleteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);

    if (!discussion) {
      return res.status(404).json({ message: 'Discussion not found' });
    }

    if (discussion.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await discussion.deleteOne();

    res.json({ message: 'Discussion deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
