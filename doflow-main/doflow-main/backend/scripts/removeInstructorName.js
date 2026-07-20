import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elite-academy';

async function removeInstructorName() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Check courses collection for instructor references
    console.log('=== Checking Courses ===');
    const courses = await db.collection('courses').find({}).toArray();
    console.log(`Found ${courses.length} courses`);
    
    for (const course of courses) {
      console.log(`\nCourse: ${course.title}`);
      if (course.instructor) {
        console.log(`  Instructor ID: ${course.instructor}`);
        
        // Fetch instructor details
        const instructor = await db.collection('users').findOne({ _id: course.instructor });
        if (instructor) {
          console.log(`  Instructor Name: ${instructor.name}`);
          console.log(`  Instructor Email: ${instructor.email}`);
        }
      }
    }
    
    // Check users collection for instructors
    console.log('\n=== Checking Users with Instructor Role ===');
    const instructors = await db.collection('users').find({ 
      $or: [
        { role: 'instructor' },
        { role: 'admin' }
      ]
    }).toArray();
    
    for (const instructor of instructors) {
      console.log(`\nUser: ${instructor.name}`);
      console.log(`  Email: ${instructor.email}`);
      console.log(`  Role: ${instructor.role}`);
      
      // Update if name contains "Chiru"
      if (instructor.name && instructor.name.toLowerCase().includes('chiru')) {
        console.log(`  ⚠️ Found "Chiru" in name - updating to "DoFlow Academy"`);
        await db.collection('users').updateOne(
          { _id: instructor._id },
          { $set: { name: 'DoFlow Academy' } }
        );
        console.log('  ✅ Updated successfully');
      }
    }
    
    console.log('\n✅ Scan complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

removeInstructorName();
