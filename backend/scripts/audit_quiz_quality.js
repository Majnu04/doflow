import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const course = await Course.findOne({ title: 'Python Programming - Complete Course' }).lean();
    if (!course) throw new Error('Course not found');

    console.log('📋 QUIZ QUALITY ANALYSIS\n');
    
    let sampleCount = 0;
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (sampleCount >= 10) break;
        if (lesson.quiz && lesson.quiz.questions && lesson.quiz.questions.length > 0) {
          console.log(`\n=== ${lesson.title} ===`);
          lesson.quiz.questions.forEach((q, idx) => {
            console.log(`Q${idx + 1}: ${q.prompt}`);
            q.options.forEach((o, oi) => {
              const mark = oi === q.answerIndex ? '✓' : ' ';
              console.log(`  [${mark}] ${o}`);
            });
            console.log(`  Explanation: ${q.explanation ? q.explanation.slice(0, 80) : 'N/A'}...`);
            console.log();
          });
          sampleCount++;
        }
      }
      if (sampleCount >= 10) break;
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  }
})();
