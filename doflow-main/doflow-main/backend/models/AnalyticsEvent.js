import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'course_view',
      'premium_lock_view',
      'upgrade_cta_click',
      'checkout_start',
      'purchase_completed'
    ]
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: String,
  metadata: {
    type: Object,
    default: {}
  }
}, {
  timestamps: true
});

analyticsEventSchema.index({ eventType: 1, course: 1, createdAt: -1 });
analyticsEventSchema.index({ user: 1, createdAt: -1 });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);

export default AnalyticsEvent;
