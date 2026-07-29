// Script to check and cleanup Python courses in MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const checkCourses = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all Python courses
    const pythonCourses = await Course.find({ 
      $or: [
        { slug: /python/i },
        { title: /python/i }
      ]
    });

    console.log(`📚 Found ${pythonCourses.length} Python-related courses:\n`);

    for (const course of pythonCourses) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${course._id}`);
      console.log(`Title: ${course.title}`);
      console.log(`Slug: ${course.slug}`);
      console.log(`Sections: ${course.sections?.length || 0}`);
      
      let totalLessons = 0;
      if (course.sections) {
        course.sections.forEach((section, i) => {
          const lessonCount = section.lessons?.length || 0;
          totalLessons += lessonCount;
          console.log(`  - Section ${i + 1}: ${section.title} (${lessonCount} lessons)`);
        });
      }
      console.log(`Total Lessons: ${totalLessons}`);
      console.log(`Created: ${course.createdAt}`);
      console.log(`Updated: ${course.updatedAt}`);
    }

    // Ask about keeping only the ULTRA EDITION
    const ultraCourse = pythonCourses.find(c => c.title.includes('ULTRA'));
    const oldCourses = pythonCourses.filter(c => !c.title.includes('ULTRA') && c.slug === 'python-zero-to-hero');

    if (ultraCourse && oldCourses.length > 0) {
      console.log(`\n⚠️  Found ${oldCourses.length} old course(s) to delete:`);
      for (const old of oldCourses) {
        console.log(`   - "${old.title}" (${old._id})`);
        await Course.findByIdAndDelete(old._id);
        console.log(`   ✅ Deleted!`);
      }
    }

    // If ULTRA course exists but has wrong slug, update it
    if (ultraCourse && ultraCourse.slug !== 'python-zero-to-hero') {
      console.log(`\n🔄 Updating ULTRA course slug...`);
      await Course.findByIdAndUpdate(ultraCourse._id, { slug: 'python-zero-to-hero' });
      console.log(`✅ Slug updated to 'python-zero-to-hero'`);
    }

    console.log('\n✅ Cleanup complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

checkCourses();
