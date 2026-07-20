import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Problem title is required'],
    trim: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RoadmapSection',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  },
  description: {
    type: String,
    required: [true, 'Problem description is required'],
  },
  examples: [{
    input: String,
    output: String,
    explanation: String,
  }],
  constraints: [String],
  starterCode: [{
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c'],
      required: true,
    },
    visibleCode: {
      type: String,
      default: '',
    },
    adapterCode: {
      type: String,
      default: '',
    },
    code: {
      type: String,
    }
  }],
  hints: [String],
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: { type: Boolean, default: false },
  }],
  leetcodeLink: {
    type: String,
    trim: true,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Index for querying problems by course and section with order
problemSchema.index({ course: 1, section: 1, order: 1 });

// Index for filtering by difficulty and course
problemSchema.index({ course: 1, difficulty: 1 });

const Problem = mongoose.model('Problem', problemSchema);

export default Problem;
