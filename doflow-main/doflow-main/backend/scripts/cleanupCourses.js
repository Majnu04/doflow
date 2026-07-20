// Script to cleanup old courses and ensure ULTRA EDITION is the primary course
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const cleanup = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Delete the old "Complete Edition" course
    const oldCourse = await Course.findOne({ 
      slug: 'zero-to-hero-python-course-complete-edition' 
    });
    
    if (oldCourse) {
      console.log(`🗑️  Deleting old course: "${oldCourse.title}"`);
      await Course.findByIdAndDelete(oldCourse._id);
      console.log('✅ Old course deleted!\n');
    }

    // Make sure ULTRA EDITION exists
    const ultraCourse = await Course.findOne({ 
      title: /ULTRA EDITION/i 
    });

    if (ultraCourse) {
      console.log(`✅ ULTRA EDITION course is active:`);
      console.log(`   Title: ${ultraCourse.title}`);
      console.log(`   Slug: ${ultraCourse.slug}`);
      console.log(`   Sections: ${ultraCourse.sections?.length}`);
      
      let totalLessons = 0;
      ultraCourse.sections?.forEach(s => {
        totalLessons += s.lessons?.length || 0;
      });
      console.log(`   Total Lessons: ${totalLessons}`);
    } else {
      console.log('⚠️  ULTRA EDITION course not found!');
    }

    console.log('\n🎉 Cleanup complete! Refresh your browser to see the updated course.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

cleanup();
