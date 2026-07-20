import mongoose from 'mongoose';
import Problem from '../models/Problem.js';
import RoadmapSection from '../models/RoadmapSection.js';
import dotenv from 'dotenv';

dotenv.config();

const COURSE_ID = '69221b7d34a1c735a4c255ba'; // Your DSA Course ID

async function linkProblemsToCourse() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all DSA problems to link to the course
    const result = await Problem.updateMany(
      {}, // Update all problems
      { $set: { course: COURSE_ID } }
    );

    console.log(`✅ Updated ${result.modifiedCount} problems with course ID`);

    // Update all DSA sections to link to the course
    const sectionResult = await RoadmapSection.updateMany(
      {}, // Update all sections
      { $set: { course: COURSE_ID } }
    );

    console.log(`✅ Updated ${sectionResult.modifiedCount} sections with course ID`);

    console.log(`\n🎯 All problems and sections are now linked to the DSA course!`);
    console.log(`   You can now access: http://localhost:5174/#/dsa/problems/${COURSE_ID}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

linkProblemsToCourse();
