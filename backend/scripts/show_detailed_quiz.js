import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const c = await Course.findOne({ title: 'Python Programming - Complete Course' }).lean();
    if (!c) throw new Error('Course not found');

    console.log('\n📊 DETAILED QUIZ & INTERVIEW VERIFICATION:\n');
    
    // Get first 3 lessons
    const lessons = [];
    for (const section of c.sections) {
      lessons.push(...section.lessons.slice(0, 3));
      if (lessons.length >= 3) break;
    }

    for (const lesson of lessons) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📖 LESSON: ${lesson.title}`);
      console.log(`${'='.repeat(70)}`);

      if (lesson.quiz?.questions) {
        console.log(`\n🎯 QUIZ (${lesson.quiz.questions.length} questions):\n`);
        for (let i = 0; i < lesson.quiz.questions.length; i++) {
          const q = lesson.quiz.questions[i];
          console.log(`Q${i+1}. ${q.prompt}`);
          console.log(`Options:`);
          q.options.forEach((opt, j) => {
            const mark = j === q.answerIndex ? '✓' : ' ';
            console.log(`  [${mark}] ${opt}`);
          });
          console.log(`   Explanation: ${q.explanation}\n`);
        }
      }

      if (lesson.interview?.questions) {
        console.log(`\n👔 INTERVIEW (${lesson.interview.questions.length} questions):\n`);
        for (let i = 0; i < lesson.interview.questions.length; i++) {
          const q = lesson.interview.questions[i];
          console.log(`Q${i+1}. ${q.prompt}`);
          console.log(`   Answer: ${q.sampleAnswer.substring(0, 120)}...\n`);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
})();
