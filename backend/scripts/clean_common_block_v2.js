import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

// Remove sample blocks that look like the old appended demo quiz/interview
// Heuristics: if content contains 'Who created Python?' or 'Interview Q' and 'Q1.' we'll strip the chunk from 'Quiz' to end or up to 'Interview Q' removal.

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    let scanned = 0;
    let cleaned = 0;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        scanned++;
        let content = String(lesson.content || '');
        const lower = content.toLowerCase();
        if (lower.includes('who created python') || (lower.includes('quiz') && lower.includes('q1.'))) {
          // remove from first occurrence of '\nQuiz' or '\nQuiz\n' or 'Quiz\n\nQ1.'
          const quizIdx = content.search(/\n?Quiz\s*\n/i);
          if (quizIdx >= 0) {
            // attempt to remove until 'Interview Q' or end
            const interviewIdx = content.search(/Interview\s*Q/i);
            if (interviewIdx > quizIdx) {
              content = content.slice(0, quizIdx) + '\n' + content.slice(interviewIdx +  ('Interview Q'.length));
            } else {
              content = content.slice(0, quizIdx).trim();
            }
            lesson.content = content.trim();
            cleaned++;
          } else {
            // fallback: remove known sample question phrase
            content = content.replace(/Who created Python\?[\s\S]*$/i, '').trim();
            lesson.content = content;
            cleaned++;
          }
        }
      }
    }

    await course.save();
    console.log(`Scanned: ${scanned}, cleaned: ${cleaned}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  }
})();
