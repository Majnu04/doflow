import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

const COMMON_BLOCK = `Best practice
Usually catch **Exception**, not BaseException.
Don’t swallow KeyboardInterrupt and SystemExit unless you have a strong reason.
Q2. Why is Python called an interpreted language?
It is directly executed by the CPU
It is converted into machine code using a compiler
It is executed line by line by the interpreter
It is a markup language
Q3. What is the main idea of this lesson?
Python is a programming language used for web development
Python is a compiled language used for system programming
Python is a high-level, general-purpose language
Python is only for data science
Interview Q
What is Python and why is it popular?
Name two features of Python.
How is Python different from C?`;

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    let cleaned = 0;
    let scanned = 0;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        scanned++;
        if (lesson.content && lesson.content.includes(COMMON_BLOCK)) {
          lesson.content = lesson.content.replace(COMMON_BLOCK, '').trim();
          cleaned++;
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
