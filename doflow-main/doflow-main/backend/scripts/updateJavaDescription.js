import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const newDescription = `Master Java programming from absolute basics to algorithmic problem-solving. This comprehensive course follows a proven, structured curriculum designed for complete beginners.

What You'll Learn:
• Core Java Fundamentals — variables, data types, operators, and control flow
• Object-Oriented Programming — classes, objects, inheritance, and polymorphism
• Collections & Data Structures — arrays, lists, and essential algorithms
• Problem-Solving Skills — step-by-step approach to coding challenges

Course Structure (14 Modules):
Each module includes concept lessons with real-world analogies, interactive MCQs, hands-on coding tasks with automated test cases, and comprehensive assessments.

No prior programming experience required. Start from zero and build job-ready Java skills.`;

async function updateDescription() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await mongoose.connection.db.collection('courses').updateOne(
      { title: /Java Foundations/i },
      { $set: { description: newDescription } }
    );

    console.log('✅ Java course description updated!');
    console.log('Modified:', result.modifiedCount);
    
    // Show the updated description
    const course = await mongoose.connection.db.collection('courses').findOne({ title: /Java Foundations/i });
    console.log('\nNew Description:');
    console.log(course.description);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateDescription();
