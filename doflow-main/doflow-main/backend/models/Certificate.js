import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  certificateId: {
    type: String,
    required: true,
    unique: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  completionDate: {
    type: Date,
    default: Date.now,
  },
  verificationUrl: {
    type: String,
    required: true,
  },
  pdfUrl: {
    type: String,
    default: null,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for faster lookups (certificateId already indexed via unique:true)
certificateSchema.index({ userId: 1, courseId: 1 });

const Certificate = mongoose.model('Certificate', certificateSchema);

export default Certificate;
