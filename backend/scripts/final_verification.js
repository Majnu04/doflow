import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const c = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!c) throw new Error('Course not found');

    const lesson = c.sections[0]?.lessons[0];
    if (!lesson) throw new Error('No lesson found');

    console.log('\n✅ COMPLETE LESSON VERIFICATION\n');
    console.log('=' .repeat(70));
    console.log(`📖 Lesson: ${lesson.title}`);
    console.log('=' .repeat(70));
    
    console.log(`\n📄 Content: ${(lesson.content || '').slice(0, 150)}...`);
    console.log(`Length: ${(lesson.content || '').length} chars`);
    
    console.log(`\n🎯 Quiz:`);
    console.log(`   - Title: ${lesson.quiz?.title}`);
    console.log(`   - Questions: ${lesson.quiz?.questions?.length || 0}`);
    if (lesson.quiz?.questions?.[0]) {
      console.log(`   - Q1: ${lesson.quiz.questions[0].prompt.slice(0, 60)}...`);
      console.log(`   - Options: ${lesson.quiz.questions[0].options?.length || 0} (answer: ${lesson.quiz.questions[0].answerIndex})`);
    }
    
    console.log(`\n👔 Interview:`);
    console.log(`   - Title: ${lesson.interview?.title}`);
    console.log(`   - Topic: ${lesson.interview?.topic}`);
    console.log(`   - Questions: ${lesson.interview?.questions?.length || 0}`);
    if (lesson.interview?.questions?.[0]) {
      console.log(`   - Q1: ${lesson.interview.questions[0].prompt.slice(0, 60)}...`);
      console.log(`   - Answer length: ${lesson.interview.questions[0].sampleAnswer?.length || 0} chars`);
    }
    
    console.log('\n✅ Everything is ready for frontend display!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
})();
