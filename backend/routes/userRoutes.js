import express from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  addToCart,
  removeFromCart,
  getCart
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Wishlist routes
router.route('/wishlist')
  .get(protect, getWishlist);

router.route('/wishlist/:courseId')
  .post(protect, addToWishlist)
  .delete(protect, removeFromWishlist);

// Cart routes
router.route('/cart')
  .get(protect, getCart);

router.route('/cart/:courseId')
  .post(protect, addToCart)
  .delete(protect, removeFromCart);

export default router;
