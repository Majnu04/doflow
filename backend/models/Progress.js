import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  watchTime: {
    type: Number, // in seconds
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  lastWatched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
progressSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
