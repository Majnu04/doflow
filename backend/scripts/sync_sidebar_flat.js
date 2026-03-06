import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Extract section/lesson structure from master notes
function extractLessons(text) {
  const noteHeader = /^===== NOTE\s+(\d{8}_\d{6})\s+\|\s+(.+?)\s+=====$/gm;
  let match, lastIdx = 0;
  const lessons = [];
  while ((match = noteHeader.exec(text)) !== null) {
    const start = match.index;
    const end = noteHeader.lastIndex;
    const title = match[2].trim();
    if (lessons.length > 0) {
      lessons[lessons.length-1].content = text.slice(lastIdx, start).trim();
    }
    lessons.push({
      title,
      description: title,
      content: '',
      order: lessons.length+1,
      duration: 5
    });
    lastIdx = end;
  }
  if (lessons.length > 0) {
    lessons[lessons.length-1].content = text.slice(lastIdx).trim();
  }
  // Remove empty lessons
  return lessons.filter(l => l.content && l.content.length > 10);
}

(async () => {
  dotenv.config();
  await mongoose.connect(process.env.MONGODB_URI);
  const c = await Course.findOne({ title: 'Python Programming - Complete Course' });
  if (!c) throw new Error('Course not found');

  // Read master notes
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const notesFile = path.resolve(__dirname, '../notes_out/PYTHON_MASTER_NOTES.txt');
  const text = fs.readFileSync(notesFile, 'utf8');
  const lessons = extractLessons(text);

  // Flat structure: one section, all lessons as direct items
  c.sections = [{
    title: 'Python Programming - Complete Course',
    order: 1,
    lessons
  }];

  await c.save();
  await mongoose.disconnect();
  console.log('Sidebar now shows each heading as a direct item (no dropdowns).');
})();
