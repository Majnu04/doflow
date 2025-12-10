import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkLesson() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db('test');
    const coursesCollection = db.collection('courses');

    const course = await coursesCollection.findOne({ 
      slug: 'python-fundamentals-complete-beginner-program' 
    });

    if (course && course.sections?.[0]?.lessons) {
      console.log('First 3 lessons:');
      course.sections[0].lessons.slice(0, 3).forEach(lesson => {
        console.log(`\n- ID: ${lesson.id}`);
        console.log(`  Title: ${lesson.title}`);
        console.log(`  Type: ${lesson.lessonType}`);
        console.log(`  Has resources: ${!!lesson.resources}`);
        if (lesson.resources?.[0]) {
          const content = JSON.parse(lesson.resources[0].url);
          console.log(`  Content keys: ${Object.keys(content).join(', ')}`);
        }
      });

      // Find a coding task
      for (const section of course.sections) {
        const codingTask = section.lessons.find(l => 
          l.title.toLowerCase().includes('coding') || 
          l.lessonType === 'coding' ||
          l.lessonType === 'codingTask'
        );
        if (codingTask) {
          console.log(`\n\n🔍 Found coding task:`);
          console.log(`  ID: ${codingTask.id}`);
          console.log(`  Title: ${codingTask.title}`);
          console.log(`  Type: ${codingTask.lessonType}`);
          if (codingTask.resources?.[0]) {
            const content = JSON.parse(codingTask.resources[0].url);
            console.log(`  Content keys: ${Object.keys(content).join(', ')}`);
            console.log(`  Has testCases: ${!!content.testCases}`);
          }
          break;
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkLesson();
