import User from '../models/User.js';
import Course from '../models/Course.js';

// @desc    Add to wishlist
// @route   POST /api/wishlist/:courseId
// @access  Private
export const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const alreadyInWishlist = user.wishlist.includes(req.params.courseId);

    if (alreadyInWishlist) {
      return res.status(400).json({ message: 'Course already in wishlist' });
    }

    user.wishlist.push(req.params.courseId);
    await user.save();

    res.json({ message: 'Course added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:courseId
// @access  Private
export const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
      id => id.toString() !== req.params.courseId
    );

    await user.save();

    res.json({ message: 'Course removed from wishlist' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'instructor', select: 'name' }
    });

    res.json(user.wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to cart
// @route   POST /api/cart/:courseId
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const alreadyInCart = user.cart.includes(req.params.courseId);

    if (alreadyInCart) {
      return res.status(400).json({ message: 'Course already in cart' });
    }

    user.cart.push(req.params.courseId);
    await user.save();

    res.json({ message: 'Course added to cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove from cart
// @route   DELETE /api/cart/:courseId
// @access  Private
export const removeFromCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    user.cart = user.cart.filter(
      id => id.toString() !== req.params.courseId
    );

    await user.save();

    res.json({ message: 'Course removed from cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'cart',
      populate: { path: 'instructor', select: 'name' }
    });

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
