import Bookmark from '../models/Bookmark.js';

// @desc    Get all bookmarks for user
// @route   GET /api/bookmarks
// @access  Private
export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id })
      .populate('roadmap', 'title')
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if problem is bookmarked
// @route   GET /api/bookmarks/check/:problemId
// @access  Private
export const checkBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findOne({
      user: req.user._id,
      problem: req.params.problemId
    });

    res.json({ isBookmarked: !!bookmark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle bookmark
// @route   POST /api/bookmarks/toggle
// @access  Private
export const toggleBookmark = async (req, res) => {
  try {
    const { problemId, problemTitle, section, roadmapId } = req.body;

    const existingBookmark = await Bookmark.findOne({
      user: req.user._id,
      problem: problemId
    });

    if (existingBookmark) {
      await existingBookmark.deleteOne();
      return res.json({ message: 'Bookmark removed', isBookmarked: false });
    }

    const bookmark = await Bookmark.create({
      user: req.user._id,
      problem: problemId,
      problemTitle,
      section,
      roadmap: roadmapId
    });

    res.status(201).json({ message: 'Bookmark added', isBookmarked: true, bookmark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
export const deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    if (bookmark.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await bookmark.deleteOne();

    res.json({ message: 'Bookmark deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
