import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Extract lessons with content from master notes
function extractLessons(text) {
  const noteHeader = /^===== NOTE\s+(\d{8}_\d{6})\s+\|\s+(.+?)\s+=====$/gm;
  let match;
  const lessons = [];
  let indices = [];
  while ((match = noteHeader.exec(text)) !== null) {
    indices.push({
      start: match.index,
      end: noteHeader.lastIndex,
      title: match[2].trim()
    });
  }
  for (let i = 0; i < indices.length; i++) {
    const contentStart = indices[i].end;
    const contentEnd = (i + 1 < indices.length) ? indices[i + 1].start : text.length;
    const content = text.slice(contentStart, contentEnd).trim();
    // Append a sample quiz and interview block to each lesson
    const quizBlock = `\n\nQuiz\n\nQ1. Who created Python?\n- Alan Turing\n- Guido van Rossum\n- John von Neumann\n- Charles Babbage\n\nQ2. Why is Python called an interpreted language?\n- It is directly executed by the CPU\n- It is converted into machine code using a compiler\n- It is executed line by line by the interpreter\n- It is a markup language\n\nQ3. What is the main idea of this lesson?\n- Python is a programming language used for web development\n- Python is a compiled language used for system programming\n- Python is a high-level, general-purpose language\n- Python is only for data science\n\nInterview Q\n- What is Python and why is it popular?\n- Name two features of Python.\n- How is Python different from C?`;
    lessons.push({
      title: indices[i].title,
      description: indices[i].title,
      content: content + quizBlock,
      order: i + 1,
      duration: 5
    });
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

  // Flat structure: one section, all lessons as direct items with content
  c.sections = [{
    title: 'Python Programming - Complete Course',
    order: 1,
    lessons
  }];

  await c.save();
  await mongoose.disconnect();
  console.log('Lesson content fields are now populated from master notes.');
})();
