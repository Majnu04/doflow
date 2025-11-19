import mongoose from 'mongoose';

const codeSubmissionSchema = new mongoose.Schema({
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
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    enum: ['javascript', 'python', 'java'],
    default: 'javascript'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong-answer', 'runtime-error', 'time-limit-exceeded'],
    default: 'pending'
  },
  testResults: [{
    testCase: Number,
    passed: Boolean,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    executionTime: Number
  }],
  passedTests: {
    type: Number,
    default: 0
  },
  totalTests: {
    type: Number,
    default: 0
  },
  executionTime: Number,
  memory: Number
}, {
  timestamps: true
});

const CodeSubmission = mongoose.model('CodeSubmission', codeSubmissionSchema);

export default CodeSubmission;
