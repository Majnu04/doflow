// Delete old Python course
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function deleteOldCourse() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    // Delete the old course
    const result = await Course.findOneAndDelete({ slug: 'zero-to-hero-python-course' });
    
    if (result) {
      console.log('✅ Deleted old course: "Zero to Hero Python Course"');
    } else {
      console.log('⚠️ Course not found');
    }
    
    await mongoose.connection.close();
    console.log('✅ Done');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

deleteOldCourse();
