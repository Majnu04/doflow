import mongoose from 'mongoose';

const problemProgressSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  lastAttempt: Date,
  completedAt: Date,
  bestSubmission: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodeSubmission'
  }
});

const sectionProgressSchema = new mongoose.Schema({
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sectionTitle: String,
  problems: [problemProgressSchema],
  completedProblems: {
    type: Number,
    default: 0
  },
  totalProblems: {
    type: Number,
    default: 0
  }
});

const userProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roadmap: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  sections: [sectionProgressSchema],
  totalCompleted: {
    type: Number,
    default: 0
  },
  totalProblems: {
    type: Number,
    default: 0
  },
  progressPercentage: {
    type: Number,
    default: 0
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActivity: Date
}, {
  timestamps: true
});

// Calculate progress percentage
userProgressSchema.methods.calculateProgress = function() {
  if (this.totalProblems === 0) return 0;
  this.progressPercentage = Math.round((this.totalCompleted / this.totalProblems) * 100);
  return this.progressPercentage;
};

userProgressSchema.index({ user: 1, roadmap: 1 }, { unique: true });

// Index for querying by course
userProgressSchema.index({ user: 1, course: 1 });

const UserProgress = mongoose.model('UserProgress', userProgressSchema);

export default UserProgress;
