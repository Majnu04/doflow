import mongoose from 'mongoose';
import Course from '../models/Course.js';

const MONGODB_URI = 'mongodb+srv://jasurbekogabek785:VQc2NHHFp9eInZCK@cluster0.qcajvwa.mongodb.net/doflow?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('\n=== ALL COURSES IN DATABASE ===\n');
    
    const courses = await Course.find({}).select('_id title sections');
    
    console.log(`Total courses: ${courses.length}\n`);
    
    courses.forEach(course => {
      const lessonCount = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
      console.log(`ID: ${course._id}`);
      console.log(`Title: ${course.title}`);
      console.log(`Lessons: ${lessonCount}`);
      console.log('---');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
