import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

(async () => {
  dotenv.config();
  await mongoose.connect(process.env.MONGODB_URI);
  const c = await Course.findOne({ title: 'Python Programming - Complete Course' }).lean();
  if (!c) throw new Error('Course not found');
  const lessons = c.sections[0].lessons.slice(0, 5);
  for (const l of lessons) {
    console.log({
      title: l.title,
      content: l.content ? l.content.slice(0, 200) : null
    });
  }
  await mongoose.disconnect();
})();
