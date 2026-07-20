// List all courses in MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function listCourses() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');
    
    const courses = await Course.find({}, 'title slug sections level price isPublished isFeatured');
    
    console.log(`📚 Total Courses: ${courses.length}\n`);
    console.log('='.repeat(80));
    
    courses.forEach((c, i) => {
      const totalLessons = c.sections?.reduce((sum, s) => sum + (s.lessons?.length || 0), 0) || 0;
      console.log(`
${i + 1}. ${c.title}
   Slug: ${c.slug}
   Level: ${c.level}
   Price: ${c.price === 0 ? 'FREE' : '₹' + c.price}
   Modules: ${c.sections?.length || 0}
   Lessons: ${totalLessons}
   Published: ${c.isPublished}
   Featured: ${c.isFeatured}
`);
    });
    
    console.log('='.repeat(80));
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

listCourses();
