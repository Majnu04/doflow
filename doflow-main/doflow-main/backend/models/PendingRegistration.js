import mongoose from 'mongoose';

// Temporary storage for registrations pending OTP verification
const pendingRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false // Optional for password reset flow
  },
  otp: {
    type: String,
    required: true
  },
  otpExpire: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document will be automatically deleted after 10 minutes
  }
});

// Index to ensure email uniqueness in pending registrations
pendingRegistrationSchema.index({ email: 1 });

const PendingRegistration = mongoose.model('PendingRegistration', pendingRegistrationSchema);

export default PendingRegistration;
