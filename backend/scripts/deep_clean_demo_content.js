import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    let scanned = 0;
    let cleaned = 0;

    // Pattern to remove: Q2, Q3, and Interview Q section
    const patterns = [
      /\nQ2\.\s+Why is Python called an interpreted language\?[\s\S]*?Q3\.\s+What is the main idea of this lesson\?[\s\S]*?Interview Q[\s\S]*?How is Python different from C\?/i,
      /Q2\.\s+Why is Python called an interpreted language\?[\s\S]*?It is a markup language/i,
      /Q3\.\s+What is the main idea of this lesson\?[\s\S]*?Python is only for data science/i,
      /Interview Q[\s\S]*?How is Python different from C\?/i,
      /\n\nQuiz\s*\n+Q1\.\s+Who created Python\?[\s\S]*?How is Python different from C\?/i
    ];

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        scanned++;
        let content = String(lesson.content || '');
        const originalLength = content.length;

        // Apply all patterns
        for (const pattern of patterns) {
          content = content.replace(pattern, '');
        }

        // Also remove common leftover patterns
        content = content.replace(/\n\nInterview Q[\s\S]*?(?=\n[A-Z]|\n\n[A-Z]|$)/i, '');
        content = content.replace(/\n\nQuiz[\s\S]*?(?=\n[A-Z]|\n\n[A-Z]|$)/i, '');
        
        if (content.length < originalLength) {
          lesson.content = content.trim();
          cleaned++;
          console.log(`✓ Cleaned: ${lesson.title}`);
        }
      }
    }

    await course.save();
    console.log(`\nScanned: ${scanned}, Cleaned: ${cleaned}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  }
})();
