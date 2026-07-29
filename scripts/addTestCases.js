import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

// Test cases for each coding task
const testCasesByTitle = {
  "sum of two numbers": [
    { input: "5\n7", output: "12" },
    { input: "10\n20", output: "30" },
    { input: "0\n0", output: "0" },
    { input: "-5\n5", output: "0" },
    { input: "100\n200", output: "300" }
  ],
  "digital profile card": [
    { input: "John\n25\nNew York", output: "Name: John\nAge: 25\nCity: New York" },
    { input: "Alice\n30\nLondon", output: "Name: Alice\nAge: 30\nCity: London" },
    { input: "Bob\n22\nParis", output: "Name: Bob\nAge: 22\nCity: Paris" },
    { input: "Emma\n28\nTokyo", output: "Name: Emma\nAge: 28\nCity: Tokyo" },
    { input: "Max\n35\nBerlin", output: "Name: Max\nAge: 35\nCity: Berlin" }
  ],
  "grade calculator": [
    { input: "85", output: "A" },
    { input: "75", output: "B" },
    { input: "65", output: "C" },
    { input: "55", output: "D" },
    { input: "45", output: "F" }
  ],
  "substring": [
    { input: "Python\n0\n3", output: "Pyt" },
    { input: "Hello\n1\n4", output: "ell" },
    { input: "World\n0\n5", output: "World" },
    { input: "Programming\n3\n7", output: "gram" },
    { input: "Code\n1\n3", output: "od" }
  ],
  "calculator": [
    { input: "10\n5", output: "15\n5\n50\n2.0" },
    { input: "20\n4", output: "24\n16\n80\n5.0" },
    { input: "100\n10", output: "110\n90\n1000\n10.0" },
    { input: "7\n3", output: "10\n4\n21\n2.3333333333333335" },
    { input: "15\n5", output: "20\n10\n75\n3.0" }
  ],
  "ticket price": [
    { input: "25", output: "Adult" },
    { input: "17", output: "Child" },
    { input: "10", output: "Child" },
    { input: "30", output: "Adult" },
    { input: "18", output: "Adult" }
  ],
  "multiplication table": [
    { input: "5", output: "5 x 1 = 5\n5 x 2 = 10\n5 x 3 = 15\n5 x 4 = 20\n5 x 5 = 25\n5 x 6 = 30\n5 x 7 = 35\n5 x 8 = 40\n5 x 9 = 45\n5 x 10 = 50" },
    { input: "3", output: "3 x 1 = 3\n3 x 2 = 6\n3 x 3 = 9\n3 x 4 = 12\n3 x 5 = 15\n3 x 6 = 18\n3 x 7 = 21\n3 x 8 = 24\n3 x 9 = 27\n3 x 10 = 30" },
    { input: "7", output: "7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70" },
    { input: "2", output: "2 x 1 = 2\n2 x 2 = 4\n2 x 3 = 6\n2 x 4 = 8\n2 x 5 = 10\n2 x 6 = 12\n2 x 7 = 14\n2 x 8 = 16\n2 x 9 = 18\n2 x 10 = 20" },
    { input: "10", output: "10 x 1 = 10\n10 x 2 = 20\n10 x 3 = 30\n10 x 4 = 40\n10 x 5 = 50\n10 x 6 = 60\n10 x 7 = 70\n10 x 8 = 80\n10 x 9 = 90\n10 x 10 = 100" }
  ],
  "function": [
    { input: "10\n5", output: "15" },
    { input: "20\n30", output: "50" },
    { input: "0\n0", output: "0" },
    { input: "-5\n5", output: "0" },
    { input: "100\n200", output: "300" }
  ]
};

async function addTestCases() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db('test'); // Using 'test' database
    const coursesCollection = db.collection('courses');

    const course = await coursesCollection.findOne({ 
      slug: 'python-fundamentals-complete-beginner-program' 
    });

    if (!course) {
      console.log('❌ Course not found');
      return;
    }

    console.log('📚 Found course:', course.title);

    let updatedCount = 0;

    // Update each module's coding tasks
    for (let moduleIndex = 0; moduleIndex < course.sections.length; moduleIndex++) {
      const module = course.sections[moduleIndex];
      
      for (let lessonIndex = 0; lessonIndex < module.lessons.length; lessonIndex++) {
        const lesson = module.lessons[lessonIndex];
        
        if (lesson.resources?.[0]) {
          const content = JSON.parse(lesson.resources[0].url);
          
          // Check if it's a coding task
          if (content.type === 'codingTask' && content.content) {
            const lessonTitle = lesson.title.toLowerCase();
            
            // Find test cases by matching lesson title keywords
            let foundTestCases = null;
            
            if (lessonTitle.includes('sum of two numbers')) {
              foundTestCases = testCasesByTitle["sum of two numbers"];
            } else if (lessonTitle.includes('profile card')) {
              foundTestCases = testCasesByTitle["digital profile card"];
            } else if (lessonTitle.includes('grade calculator')) {
              foundTestCases = testCasesByTitle["grade calculator"];
            } else if (lessonTitle.includes('substring')) {
              foundTestCases = testCasesByTitle["substring"];
            } else if (lessonTitle.includes('calculator') && lessonTitle.includes('input')) {
              foundTestCases = testCasesByTitle["calculator"];
            } else if (lessonTitle.includes('ticket')) {
              foundTestCases = testCasesByTitle["ticket price"];
            } else if (lessonTitle.includes('multiplication')) {
              foundTestCases = testCasesByTitle["multiplication table"];
            } else if (lessonTitle.includes('function')) {
              foundTestCases = testCasesByTitle["function"];
            }
            
            if (foundTestCases) {
              content.content.testCases = foundTestCases;
              lesson.resources[0].url = JSON.stringify(content);
              updatedCount++;
              console.log(`✅ Added test cases to: ${lesson.title}`);
            } else {
              console.log(`⚠️  No test cases defined for: ${lesson.title}`);
            }
          }
        }
      }
    }

    if (updatedCount > 0) {
      await coursesCollection.updateOne(
        { _id: course._id },
        { $set: { sections: course.sections } }
      );
      console.log(`\n✅ Successfully updated ${updatedCount} coding tasks with test cases`);
    } else {
      console.log('\n⚠️  No coding tasks were updated');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('👋 Disconnected from MongoDB');
  }
}

addTestCases();
