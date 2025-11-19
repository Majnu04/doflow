import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../src/store';
import { clearCart } from '../src/store/slices/cartSlice';
import { FiCreditCard, FiLock, FiCheck, FiArrowLeft } from 'react-icons/fi';
import { Button, Card } from '../src/components/ui';
import axios from 'axios';
import toast from '../src/utils/toast';

const CheckoutPage: React.FC = () => {
  const dispatch = useDispatch();
  const { items } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
  });

  const total = items.reduce((sum, item) => sum + (item.discountPrice || item.price), 0);
  const originalTotal = items.reduce((sum, item) => sum + item.price, 0);
  const savings = originalTotal - total;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call payment API
      const response = await axios.post('/api/payments/process', {
        courseIds: items.map(item => item._id),
        amount: total,
        paymentMethod,
        paymentDetails: paymentMethod === 'card' 
          ? { last4: formData.cardNumber.slice(-4) }
          : { upiId: formData.upiId }
      });

      if (response.data.success) {
        toast.success('Payment successful! Courses added to your account.');
        dispatch(clearCart());
        window.location.hash = '/dashboard';
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Card variant="glass" className="text-center py-20">
            <h2 className="text-3xl font-bold mb-4">Your cart is empty</h2>
            <p className="text-gray-400 mb-8">Add some courses to checkout</p>
            <Button
              variant="primary"
              onClick={() => window.location.hash = '/courses'}
            >
              Browse Courses
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-elite-navy">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.hash = '/cart'}
            icon={<FiArrowLeft />}
            className="mb-4"
          >
            Back to Cart
          </Button>
          <h1 className="text-4xl font-display font-bold gradient-text mb-2">
            Checkout
          </h1>
          <p className="text-gray-400">Complete your purchase</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card variant="glass" className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <FiLock className="text-green-400" />
                <span className="text-sm text-gray-400">Secure Checkout</span>
              </div>

              {/* Payment Method Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'card'
                        ? 'border-elite-purple bg-elite-purple/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <FiCreditCard className="w-6 h-6 mx-auto mb-2" />
                    <div className="text-sm font-semibold">Credit/Debit Card</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-elite-purple bg-elite-purple/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="text-2xl mb-2">📱</div>
                    <div className="text-sm font-semibold">UPI</div>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit}>
                {paymentMethod === 'card' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Card Number</label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                        className="w-full px-4 py-3 bg-elite-navy border border-gray-700 rounded-lg focus:border-elite-purple focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                        className="w-full px-4 py-3 bg-elite-navy border border-gray-700 rounded-lg focus:border-elite-purple focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry Date</label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                          className="w-full px-4 py-3 bg-elite-navy border border-gray-700 rounded-lg focus:border-elite-purple focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={3}
                          required
                          className="w-full px-4 py-3 bg-elite-navy border border-gray-700 rounded-lg focus:border-elite-purple focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">UPI ID</label>
                      <input
                        type="text"
                        name="upiId"
                        value={formData.upiId}
                        onChange={handleInputChange}
                        placeholder="yourname@upi"
                        required
                        className="w-full px-4 py-3 bg-elite-navy border border-gray-700 rounded-lg focus:border-elite-purple focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-8"
                  disabled={isProcessing}
                  icon={isProcessing ? undefined : <FiCheck />}
                >
                  {isProcessing ? 'Processing...' : `Pay ₹${total}`}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <FiLock className="text-green-400 mt-1 flex-shrink-0" />
                  <div className="text-sm text-gray-300">
                    <strong className="text-white">Secure Payment:</strong> Your payment information is encrypted and secure. We never store your card details.
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card variant="gradient" className="p-6 sticky top-24">
              <h3 className="text-2xl font-bold mb-6">Order Summary</h3>
              
              <div className="space-y-3 mb-6">
                {items.map((course) => (
                  <div key={course._id} className="flex justify-between text-sm">
                    <span className="text-gray-300 flex-1 line-clamp-1">{course.title}</span>
                    <span className="text-white ml-2">
                      ₹{course.discountPrice || course.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                <div className="flex justify-between text-gray-300">
                  <span>Subtotal:</span>
                  <span>₹{originalTotal}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount:</span>
                    <span>-₹{savings}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-300">
                  <span>Tax:</span>
                  <span>₹0</span>
                </div>

                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span className="gradient-text">₹{total}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FiCheck className="text-green-400" />
                  <span>Lifetime access</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FiCheck className="text-green-400" />
                  <span>All future updates</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FiCheck className="text-green-400" />
                  <span>Certificate of completion</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <FiCheck className="text-green-400" />
                  <span>30-day money-back guarantee</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
