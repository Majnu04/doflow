import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: [true, 'Please provide a review title'],
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [1000, 'Comment cannot be more than 1000 characters']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isApproved: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure one review per user per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });

// Update course ratings after review
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const result = await Review.aggregate([
    { $match: { course: this.course, isApproved: true } },
    { $group: {
      _id: null,
      averageRating: { $avg: '$rating' },
      count: { $sum: 1 }
    }}
  ]);

  if (result.length > 0) {
    await mongoose.model('Course').findByIdAndUpdate(this.course, {
      'ratings.average': Math.round(result[0].averageRating * 10) / 10,
      'ratings.count': result[0].count
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
