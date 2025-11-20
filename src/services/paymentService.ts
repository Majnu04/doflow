import api from '../utils/api';

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  enrollmentId: string;
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  enrollmentId: string;
}

export const paymentService = {
  /**
   * Create Razorpay order for course enrollment
   */
  async createOrder(courseId: string): Promise<CreateOrderResponse> {
    const response = await api.post('/payment/create-order', { courseId });
    return response.data;
  },

  /**
   * Verify Razorpay payment signature and complete enrollment
   */
  async verifyPayment(paymentData: VerifyPaymentRequest): Promise<any> {
    const response = await api.post('/payment/verify', paymentData);
    return response.data;
  },

  /**
   * Enroll in a free course (no payment required)
   */
  async enrollInFreeCourse(courseId: string): Promise<any> {
    const response = await api.post('/payment/enroll-free', { courseId });
    return response.data;
  },

  /**
   * Get payment history for the current user
   */
  async getPaymentHistory(): Promise<any[]> {
    const response = await api.get('/payment/history');
    return response.data;
  }
};
