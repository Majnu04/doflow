import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  link: String,
  hints: [String],
  testCases: [{
    input: String,
    expectedOutput: String,
    explanation: String
  }],
  solution: {
    javascript: String,
    python: String,
    java: String
  },
  order: {
    type: Number,
    default: 0
  }
});

const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  problems: [problemSchema],
  order: {
    type: Number,
    default: 0
  }
});

const roadmapSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  sections: [sectionSchema],
  totalProblems: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total problems before saving
roadmapSchema.pre('save', function(next) {
  this.totalProblems = this.sections.reduce((total, section) => 
    total + section.problems.length, 0
  );
  next();
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);

export default Roadmap;
