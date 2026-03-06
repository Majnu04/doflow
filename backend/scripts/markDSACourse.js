import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const markDSACourse = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is undefined');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all courses with DSA-related titles
    const dsaCourse = await Course.findOne({ 
      $or: [
        { title: /Data Structures/i },
        { title: /DSA/i },
        { title: /Algorithms/i }
      ]
    });

    if (!dsaCourse) {
      console.log('❌ No DSA course found. Courses available:');
      const allCourses = await Course.find({}).select('title category').limit(5);
      allCourses.forEach(c => console.log(`  - ${c.title} (${c.category})`));
      process.exit(1);
    }

    console.log(`Found DSA course: "${dsaCourse.title}" (${dsaCourse._id})`);

    const result = await Course.updateOne(
      { _id: dsaCourse._id },
      { $set: { isDSA: true } }
    );

    console.log(`✨ Updated ${result.modifiedCount} course(s) with isDSA flag`);

    // Show the updated course
    const updatedCourse = await Course.findById(dsaCourse._id).select('_id title category isDSA');
    console.log('\nUpdated DSA Course:');
    console.log(`  - ${updatedCourse.title} (ID: ${updatedCourse._id})`);
    console.log(`  - isDSA: ${updatedCourse.isDSA}`);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

markDSACourse();
