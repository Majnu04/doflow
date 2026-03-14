import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Extract section/lesson structure from master notes
function extractSectionsAndLessons(text) {
  const noteHeader = /^===== NOTE\s+(\d{8}_\d{6})\s+\|\s+(.+?)\s+=====$/gm;
  let match, lastIdx = 0;
  const sections = [];
  while ((match = noteHeader.exec(text)) !== null) {
    const start = match.index;
    const end = noteHeader.lastIndex;
    const title = match[2].trim();
    if (sections.length > 0) {
      sections[sections.length-1].content = text.slice(lastIdx, start).trim();
    }
    sections.push({
      title,
      lessons: [],
      content: '',
      order: sections.length+1
    });
    lastIdx = end;
  }
  if (sections.length > 0) {
    sections[sections.length-1].content = text.slice(lastIdx).trim();
  }
  // Each section is a lesson (PDF is flat, but we treat each as a section with one lesson)
  for (const s of sections) {
    s.lessons = [{
      title: s.title,
      description: s.title,
      content: s.content,
      order: 1,
      duration: 5
    }];
    delete s.content;
  }
  return sections;
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
  const sections = extractSectionsAndLessons(text);

  c.sections = sections;
  await c.save();
  await mongoose.disconnect();
  console.log('Sidebar and content rebuilt to match PDF structure.');
})();
