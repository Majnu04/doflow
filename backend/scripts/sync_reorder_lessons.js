import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

(async () => {
  dotenv.config();
  await mongoose.connect(process.env.MONGODB_URI);
  const c = await Course.findOne({ title: 'Python Programming - Complete Course' });
  if (!c) throw new Error('Course not found');

  // Read all lessons from all sections
  let allLessons = [];
  c.sections = Array.isArray(c.sections) ? c.sections : [];
  for (const s of c.sections) {
    s.lessons = Array.isArray(s.lessons) ? s.lessons : [];
    for (const l of s.lessons) {
      if (l && l.title) allLessons.push(l);
    }
  }

  // Sort lessons by their 'order' property if present, else keep as is
  allLessons.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Rebuild sections: one section, all lessons in master notes order
  c.sections = [{ title: 'Python Programming - Complete Course', lessons: allLessons, order: 1 }];

  await c.save();
  await mongoose.disconnect();
  console.log('Reordered all lessons into a single section.');
})();
