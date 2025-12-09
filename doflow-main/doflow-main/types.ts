export interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  title: string;
  duration: number; // in minutes
  videoUrl: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  totalDuration: number; // in minutes
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  instructorBio: string;
  instructorAvatar: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  studentCount: number;
  thumbnailUrl: string;
  previewVideoUrl?: string;
  tags: string[];
  modules: Module[];
  reviews: Review[];
  whatYoullLearn: string[];
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  totalDuration: number; // in hours
  totalLessons: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatarUrl: string;
  enrolledCourses: string[]; // array of course IDs
  wishlist: string[]; // array of course IDs
  progress: {
    [courseId: string]: {
      completedLessons: string[]; // array of lesson IDs
    }
  };
}

export enum AuthState {
  Login = 'Login',
  Register = 'Register',
}