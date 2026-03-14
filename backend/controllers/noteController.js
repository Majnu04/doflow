import Note from '../models/Note.js';

// @desc    Get all notes for user
// @route   GET /api/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id })
      .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get note for specific problem
// @route   GET /api/notes/problem/:problemId
// @access  Private
export const getProblemNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      user: req.user._id,
      problem: req.params.problemId
    });

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update note
// @route   POST /api/notes
// @access  Private
export const createOrUpdateNote = async (req, res) => {
  try {
    const { problemId, problemTitle, content, code, isPrivate, tags } = req.body;

    let note = await Note.findOne({
      user: req.user._id,
      problem: problemId
    });

    if (note) {
      note.content = content;
      note.code = code || note.code;
      note.isPrivate = isPrivate !== undefined ? isPrivate : note.isPrivate;
      note.tags = tags || note.tags;
      await note.save();
    } else {
      note = await Note.create({
        user: req.user._id,
        problem: problemId,
        problemTitle,
        content,
        code,
        isPrivate: isPrivate !== undefined ? isPrivate : true,
        tags: tags || []
      });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await note.deleteOne();

    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
