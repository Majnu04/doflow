import Review from '../models/Review.js';
import Enrollment from '../models/Enrollment.js';

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
export const createReview = async (req, res) => {
  try {
    const { courseId, rating, title, comment } = req.body;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId,
      'paymentInfo.status': 'completed'
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled to review this course' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this course' });
    }

    const review = await Review.create({
      user: req.user._id,
      course: courseId,
      rating,
      title,
      comment
    });

    const populatedReview = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get course reviews
// @route   GET /api/reviews/course/:courseId
// @access  Public
export const getCourseReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const reviews = await Review.find({
      course: req.params.courseId,
      isApproved: true
    })
      .populate('user', 'name avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments({
      course: req.params.courseId,
      isApproved: true
    });

    res.json({
      reviews,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this review' });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { ...req.body, isApproved: true },
      { new: true, runValidators: true }
    ).populate('user', 'name avatar');

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    await review.deleteOne();

    res.json({ message: 'Review removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Like a review
// @route   POST /api/reviews/:id/like
// @access  Private
export const likeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const alreadyLiked = review.likes.includes(req.user._id);

    if (alreadyLiked) {
      review.likes = review.likes.filter(id => id.toString() !== req.user._id.toString());
    } else {
      review.likes.push(req.user._id);
    }

    await review.save();

    res.json({ likes: review.likes.length, liked: !alreadyLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
