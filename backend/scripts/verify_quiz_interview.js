import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const c = await Course.findOne({ title: 'Python Programming - Complete Course' }).lean();
    if (!c) throw new Error('Course not found');

    console.log('\n🎯 Checking Quiz & Interview Questions in Database:\n');
    
    for (const section of c.sections) {
      console.log(`📚 ${section.title}`);
      for (const lesson of section.lessons.slice(0, 3)) {
        console.log(`\n   📖 ${lesson.title}`);
        console.log(`      Quiz: ${lesson.quiz ? '✓ ' + lesson.quiz.questions?.length + ' questions' : '✗ None'}`);
        console.log(`      Interview: ${lesson.interview ? '✓ ' + lesson.interview.questions?.length + ' questions' : '✗ None'}`);
        
        if (lesson.quiz?.questions?.[0]) {
          console.log(`         Q1: ${lesson.quiz.questions[0].prompt?.slice(0, 50)}...`);
        }
        if (lesson.interview?.questions?.[0]) {
          console.log(`         I1: ${lesson.interview.questions[0].prompt?.slice(0, 50)}...`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
})();
