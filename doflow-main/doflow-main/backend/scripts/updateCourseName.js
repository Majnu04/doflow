import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elite-academy';

async function updateCourseName() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Find and update the Python course
    const result = await db.collection('courses').updateOne(
      { title: /Zero to Hero Python Course/i },
      { 
        $set: { 
          title: 'Python Fundamentals: Complete Beginner Program',
          slug: 'python-fundamentals-complete-beginner-program'
        } 
      }
    );
    
    if (result.matchedCount > 0) {
      console.log('✅ Course title updated successfully!');
      console.log(`   Old: Zero to Hero Python Course — ULTRA EDITION`);
      console.log(`   New: Python Fundamentals: Complete Beginner Program`);
    } else {
      console.log('❌ Course not found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateCourseName();
