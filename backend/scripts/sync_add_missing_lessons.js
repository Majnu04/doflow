import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

(async () => {
  dotenv.config();
  await mongoose.connect(process.env.MONGODB_URI);
  const c = await Course.findOne({ title: 'Python Programming - Complete Course' });
  if (!c) throw new Error('Course not found');

  // Read master notes titles
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const notesFile = path.resolve(__dirname, '../notes_out/PYTHON_MASTER_NOTES.txt');
  const text = fs.readFileSync(notesFile, 'utf8');
  const header = /^===== NOTE\s+(\d{8}_\d{6})\s+\|\s+(.+?)\s+=====$/gm;
  const masterTitles = [];
  let m = null;
  while ((m = header.exec(text)) !== null) {
    masterTitles.push(String(m[2]).trim());
  }

  // Flatten all lessons in course
  const allLessons = [];
  c.sections = Array.isArray(c.sections) ? c.sections : [];
  for (const s of c.sections) {
    s.lessons = Array.isArray(s.lessons) ? s.lessons : [];
    for (const l of s.lessons) {
      if (l && l.title) allLessons.push({section: s, lesson: l});
    }
  }

  // Find missing lessons
  const courseTitles = allLessons.map(x => x.lesson.title.trim());
  const missing = masterTitles.filter(t => !courseTitles.includes(t));

  // Add missing lessons to the first section (or create one if needed)
  let firstSection = c.sections[0];
  if (!firstSection) {
    firstSection = { title: 'Introduction', lessons: [] };
    c.sections.unshift(firstSection);
  }
  let orderStart = firstSection.lessons.length;
  for (const t of missing) {
    firstSection.lessons.push({
      title: t,
      description: t,
      content: '',
      order: ++orderStart,
      duration: 5
    });
  }

  await c.save();
  await mongoose.disconnect();
  console.log('Added missing lessons:', missing.length);
})();
