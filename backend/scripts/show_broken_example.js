import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const c = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!c) throw new Error('Course not found');

    console.log('\n🔴 SHOWING EXACTLY WHAT\'S WRONG:\n');

    // Get a failed lesson
    let failedLesson = null;
    for (const section of c.sections) {
      for (const lesson of section.lessons) {
        if (lesson.title === 'DATA TYPES') {
          failedLesson = lesson;
          break;
        }
      }
    }

    if (!failedLesson) throw new Error('Lesson not found');

    console.log(`Lesson: ${failedLesson.title}\n`);
    
    if (failedLesson.quiz?.questions) {
      console.log('❌ QUIZ QUESTIONS (showing what\'s broken):\n');
      for (let i = 0; i < failedLesson.quiz.questions.length; i++) {
        const q = failedLesson.quiz.questions[i];
        console.log(`Q${i+1}: ${q.prompt}`);
        console.log(`Options:`);
        q.options.forEach((opt, j) => {
          console.log(`  ${j}: "${opt}"`);
        });
        console.log(`Answer Index: ${q.answerIndex}`);
        console.log(`Explanation: ${q.explanation}\n`);
      }
    }

    if (failedLesson.interview?.questions) {
      console.log('❌ INTERVIEW QUESTIONS:\n');
      for (let i = 0; i < failedLesson.interview.questions.length; i++) {
        const q = failedLesson.interview.questions[i];
        console.log(`Q${i+1}: ${q.prompt}`);
        console.log(`Answer: ${q.sampleAnswer}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
})();
