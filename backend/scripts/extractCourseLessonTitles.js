import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

(async () => {
  dotenv.config();
  await mongoose.connect(process.env.MONGODB_URI);
  const c = await Course.findOne({ title: 'Python Programming - Complete Course' }).lean();
  const sections = Array.isArray(c.sections) ? c.sections : [];
  const allTitles = [];
  for (const s of sections) {
    const lessons = Array.isArray(s.lessons) ? s.lessons : [];
    for (const l of lessons) {
      if (l && l.title) allTitles.push(String(l.title).trim());
    }
  }
  console.log(JSON.stringify(allTitles));
  await mongoose.disconnect();
})();
