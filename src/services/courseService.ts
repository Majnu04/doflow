import api from '../utils/api';

export interface CheckEnrollmentResponse {
  isEnrolled: boolean;
  enrollment?: any;
}

export const courseService = {
  /**
   * Get all courses with optional filters
   */
  async getCourses(params?: {
    search?: string;
    category?: string;
    level?: string;
    sortBy?: string;
  }): Promise<any[]> {
    const response = await api.get('/courses', { params });
    return response.data;
  },

  /**
   * Get single course details by ID
   */
  async getCourseById(courseId: string): Promise<any> {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  /**
   * Check if user is enrolled in a course
   */
  async checkEnrollment(courseId: string): Promise<CheckEnrollmentResponse> {
    const response = await api.get(`/courses/${courseId}/check-enrollment`);
    return response.data;
  },

  /**
   * Get user's enrolled courses with progress
   */
  async getEnrolledCourses(): Promise<any[]> {
    const response = await api.get('/progress/enrollments');
    return response.data;
  }
};
