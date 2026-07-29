import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  problemTitle: String,
  content: {
    type: String,
    required: true
  },
  code: String,
  isPrivate: {
    type: Boolean,
    default: true
  },
  tags: [String]
}, {
  timestamps: true
});

noteSchema.index({ user: 1, problem: 1 });

const Note = mongoose.model('Note', noteSchema);

export default Note;
