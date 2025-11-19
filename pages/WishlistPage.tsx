import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../src/store';
import { removeFromWishlist, clearWishlist } from '../src/store/slices/wishlistSlice';
import { addToCart } from '../src/store/slices/cartSlice';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowRight } from 'react-icons/fi';
import { Button, Card, Badge } from '../src/components/ui';
import toast from '../src/utils/toast';

const WishlistPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.wishlist);
  const { items: cartItems } = useSelector((state: RootState) => state.cart);

  const handleRemoveFromWishlist = (courseId: string) => {
    dispatch(removeFromWishlist(courseId));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = (course: any) => {
    const isInCart = cartItems.some(item => item._id === course._id);
    if (isInCart) {
      toast.info('Course already in cart');
      window.location.hash = '/cart';
    } else {
      dispatch(addToCart(course));
      toast.success('Added to cart!');
    }
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      dispatch(clearWishlist());
      toast.success('Wishlist cleared');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card variant="glass" className="text-center py-20">
            <div className="max-w-md mx-auto">
              <FiHeart className="w-24 h-24 mx-auto mb-6 text-gray-500" />
              <h2 className="text-3xl font-bold mb-4">Your wishlist is empty</h2>
              <p className="text-gray-400 mb-8">
                Save courses you're interested in and come back to them later!
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={() => window.location.hash = '/courses'}
                icon={<FiArrowRight />}
              >
                Browse Courses
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold gradient-text mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-400">{items.length} course{items.length !== 1 ? 's' : ''} saved</p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearWishlist}
            >
              Clear Wishlist
            </Button>
          )}
        </div>

        {/* Wishlist Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((course) => {
            const isInCart = cartItems.some(item => item._id === course._id);
            
            return (
              <Card key={course._id} variant="glass" className="group hover:scale-105 transition-all duration-300">
                <div className="relative">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/400x225'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <button
                    onClick={() => handleRemoveFromWishlist(course._id)}
                    className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 rounded-full shadow-neon transition-all duration-300"
                  >
                    <FiHeart className="w-5 h-5 text-white fill-current" />
                  </button>
                  {course.discountPrice && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="gold">
                        {Math.round((1 - course.discountPrice / course.price) * 100)}% OFF
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 hover:text-elite-purple transition-colors cursor-pointer">
                    <a href={`/#/course/${course._id}`}>{course.title}</a>
                  </h3>
                  
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <span>{course.instructor}</span>
                    <span>•</span>
                    <Badge variant="primary">{course.level}</Badge>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    {course.discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-elite-gold">
                          ₹{course.discountPrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ₹{course.price}
                        </span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        ₹{course.price}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant={isInCart ? "outline" : "primary"}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleAddToCart(course)}
                      icon={<FiShoppingCart />}
                    >
                      {isInCart ? 'In Cart' : 'Add to Cart'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFromWishlist(course._id)}
                    >
                      <FiTrash2 />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
