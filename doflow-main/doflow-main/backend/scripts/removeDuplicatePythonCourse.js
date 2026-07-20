// Script to remove duplicate Python courses
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

async function removeDuplicates() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all Python courses
    const pythonCourses = await Course.find({
      $or: [
        { title: { $regex: /python/i } },
        { slug: { $regex: /python/i } }
      ]
    }).select('_id title slug createdAt version');

    console.log('📚 Found Python Courses:');
    console.log('═══════════════════════════════════════════════════════\n');
    
    pythonCourses.forEach((course, index) => {
      console.log(`${index + 1}. Title: ${course.title}`);
      console.log(`   Slug: ${course.slug}`);
      console.log(`   Version: ${course.version || 'N/A'}`);
      console.log(`   Created: ${course.createdAt}`);
      console.log(`   ID: ${course._id}\n`);
    });

    if (pythonCourses.length <= 1) {
      console.log('✅ No duplicates found!');
      return;
    }

    // Keep the one with version "2.0" or the newest one
    const courseToKeep = pythonCourses.find(c => c.version === "2.0") || pythonCourses[pythonCourses.length - 1];
    const coursesToDelete = pythonCourses.filter(c => c._id.toString() !== courseToKeep._id.toString());

    console.log(`✅ Keeping: ${courseToKeep.title} (Version: ${courseToKeep.version || 'N/A'})\n`);
    
    for (const course of coursesToDelete) {
      await Course.findByIdAndDelete(course._id);
      console.log(`🗑️  Deleted: ${course.title} (${course.slug})`);
    }

    console.log(`\n✅ Removed ${coursesToDelete.length} duplicate course(s)`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
  }
}

removeDuplicates();
