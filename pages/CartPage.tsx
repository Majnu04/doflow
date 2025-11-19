import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../src/store';
import { removeFromCart, clearCart } from '../src/store/slices/cartSlice';
import { FiTrash2, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { Button, Card } from '../src/components/ui';

const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleRemoveFromCart = (courseId: string) => {
    dispatch(removeFromCart(courseId));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart());
    }
  };

  const total = items.reduce((sum, item) => sum + (item.discountPrice || item.price), 0);
  const originalTotal = items.reduce((sum, item) => sum + item.price, 0);
  const savings = originalTotal - total;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card variant="glass" className="text-center py-20">
            <div className="max-w-md mx-auto">
              <FiShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-500" />
              <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
              <p className="text-gray-400 mb-8">
                Looks like you haven't added any courses yet. Start exploring our amazing courses!
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
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-400">{items.length} course{items.length !== 1 ? 's' : ''} in cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((course) => (
              <Card key={course._id} variant="glass" className="p-6">
                <div className="flex gap-6">
                  <img
                    src={course.thumbnail || 'https://via.placeholder.com/200x120'}
                    alt={course.title}
                    className="w-48 h-28 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 hover:text-elite-purple transition-colors cursor-pointer">
                      <a href={`/#/course/${course._id}`}>{course.title}</a>
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {course.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>By {course.instructor}</span>
                      <span>•</span>
                      <span>{course.level}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => handleRemoveFromCart(course._id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                    
                    <div className="text-right">
                      {course.discountPrice ? (
                        <>
                          <div className="text-2xl font-bold text-elite-gold">
                            ₹{course.discountPrice}
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            ₹{course.price}
                          </div>
                        </>
                      ) : (
                        <div className="text-2xl font-bold text-white">
                          ₹{course.price}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCart}
              className="mt-4"
            >
              Clear Cart
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="gradient" className="p-6 sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Original Price:</span>
                  <span>₹{originalTotal}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount:</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="gradient-text">₹{total}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mb-3"
                onClick={() => {
                  if (!isAuthenticated) {
                    window.location.hash = '/auth';
                  } else {
                    window.location.hash = '/checkout';
                  }
                }}
                icon={<FiArrowRight />}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="ghost"
                size="md"
                className="w-full"
                onClick={() => window.location.hash = '/courses'}
              >
                Continue Shopping
              </Button>

              <div className="mt-6 p-4 bg-elite-purple/10 border border-elite-purple/20 rounded-lg">
                <p className="text-sm text-gray-300">
                  💡 <strong>Pro Tip:</strong> Courses are updated regularly with new content at no extra cost!
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
