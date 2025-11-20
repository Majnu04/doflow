import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

const markCourseComplete = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Find the DSA course enrollment
    const enrollment = await Enrollment.findOne({
      course: new mongoose.Types.ObjectId('691ecb7a6ee4a56d59c403a9')
    }).populate('course');

    if (!enrollment) {
      console.log('❌ No enrollment found for DSA course. Please enroll first.');
      process.exit(1);
    }

    // Mark all lessons as completed
    const totalLessons = enrollment.course.totalLessons || 15;
    const completedLessons = [];
    
    for (let i = 1; i <= totalLessons; i++) {
      completedLessons.push({
        lesson: `lesson_${i}`,
        completedAt: new Date()
      });
    }

    // Update enrollment to 100% complete
    enrollment.progress = 100;
    enrollment.completedLessons = completedLessons;
    enrollment.completedAt = new Date();
    
    await enrollment.save();

    console.log('✅ Course marked as 100% complete!');
    console.log(`Progress: ${enrollment.progress}%`);
    console.log(`Completed Lessons: ${enrollment.completedLessons.length}`);
    console.log('\nNow you can:');
    console.log('1. Go to your dashboard');
    console.log('2. Click "Get Certificate" button');
    console.log('3. View your certificate!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

markCourseComplete();
