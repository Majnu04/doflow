import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkCourses() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('elite-digital-academy');
    const coursesCollection = db.collection('courses');

    const courses = await coursesCollection.find({}).toArray();
    
    console.log(`Found ${courses.length} courses:\n`);
    courses.forEach(course => {
      console.log(`- Title: "${course.title}"`);
      console.log(`  Slug: "${course.slug}"`);
      console.log(`  Modules: ${course.sections?.length || 0}`);
      console.log();
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkCourses();
