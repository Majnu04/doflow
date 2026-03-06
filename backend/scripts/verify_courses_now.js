import mongoose from 'mongoose';
import Course from '../models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('\n=== ACTUAL COURSES IN DATABASE ===\n');
    
    const courses = await Course.find({}).select('_id title tags sections').sort('_id');
    
    for (const course of courses) {
      const lessonCount = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
      const firstLesson = course.sections[0]?.lessons[0]?.title || 'None';
      
      console.log(`ID: ${course._id}`);
      console.log(`Title: ${course.title}`);
      console.log(`Tags: ${course.tags.join(', ')}`);
      console.log(`Lessons: ${lessonCount}`);
      console.log(`First lesson: ${firstLesson}`);
      console.log('---\n');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
