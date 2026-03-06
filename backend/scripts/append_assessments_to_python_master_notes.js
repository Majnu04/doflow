import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

const COURSE_TITLE = 'Python Programming - Complete Course';
const NOTES_PATH = path.resolve('notes_out', 'PYTHON_MASTER_NOTES.txt');
const MARKER_START = '===== AUTO-GENERATED ASSESSMENTS (DO NOT EDIT BELOW) =====';
const MARKER_END = '===== END AUTO-GENERATED ASSESSMENTS =====';

function toLetter(index) {
  return String.fromCharCode('A'.charCodeAt(0) + index);
}

function safeText(value) {
  return String(value ?? '').replace(/\r\n/g, '\n');
}

function normalizeOption(opt) {
  return safeText(opt).trim().replace(/\s+/g, ' ');
}

function looksDummy(text) {
  const t = safeText(text).toLowerCase();
  return (
    t.includes('a related but weaker statement') ||
    t.includes('a concept related to') ||
    t.includes('an unrelated option to test attention') ||
    t.includes('a common mistake about') ||
    t.includes("a fact that sounds correct but isn't") ||
    t.includes('a detail from another topic')
  );
}

function formatQuiz(quiz) {
  const title = safeText(quiz?.title || 'Quiz');
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  let out = '';
  out += `${title}\n`;
  if (!questions.length) {
    out += `No quiz questions found.\n`;
    return out;
  }

  questions.forEach((q, i) => {
    const prompt = safeText(q?.prompt || '').trim();
    const options = Array.isArray(q?.options) ? q.options.map(normalizeOption) : [];
    const answerIndex = Number.isInteger(q?.answerIndex) ? q.answerIndex : 0;
    const explanation = safeText(q?.explanation || '').trim();

    const expectedAnswer = safeText(
      (typeof q?.expectedAnswer === 'string' && q.expectedAnswer) ? q.expectedAnswer : (options[answerIndex] || '')
    ).trim();

    out += `Q${i + 1}. ${prompt || '(missing prompt)'}\n`;

    // Quiz is now short-answer style (like interview practice): no options printed.
    out += `  Sample answer: ${expectedAnswer || '(missing expected answer)'}\n`;
    if (explanation) out += `  Explanation: ${explanation}\n`;

    // Simple quality flags for your review
    const dummyFound = looksDummy(prompt) || looksDummy(expectedAnswer) || looksDummy(explanation);
    if (dummyFound) out += `  NOTE: Potential dummy/template text detected here.\n`;

    out += '\n';
  });

  return out;
}

function formatInterview(interview) {
  const title = safeText(interview?.title || 'Interview Practice');
  const questions = Array.isArray(interview?.questions) ? interview.questions : [];
  let out = '';
  out += `${title}\n`;
  if (!questions.length) {
    out += `No interview questions found.\n`;
    return out;
  }

  questions.forEach((q, i) => {
    const prompt = safeText(q?.prompt || '').trim();
    const sampleAnswer = safeText(q?.sampleAnswer || '').trim();
    out += `Q${i + 1}. ${prompt || '(missing prompt)'}\n`;
    if (sampleAnswer) out += `  Sample answer: ${sampleAnswer}\n`;
    const dummyFound = looksDummy(prompt) || looksDummy(sampleAnswer);
    if (dummyFound) out += `  NOTE: Potential dummy/template text detected here.\n`;
    out += '\n';
  });

  return out;
}

function stripExistingGeneratedBlock(text) {
  const s = safeText(text);
  const startIdx = s.indexOf(MARKER_START);
  if (startIdx === -1) return s;
  const endIdx = s.indexOf(MARKER_END);
  if (endIdx === -1) {
    // if partial, strip from start marker to end of file
    return s.slice(0, startIdx).trimEnd() + '\n';
  }
  return (s.slice(0, startIdx).trimEnd() + '\n');
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');

    if (!fs.existsSync(NOTES_PATH)) throw new Error(`Master notes not found at ${NOTES_PATH}`);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const course = await Course.findOne({ title: COURSE_TITLE });
    if (!course) throw new Error(`Course not found: ${COURSE_TITLE}`);

    const original = fs.readFileSync(NOTES_PATH, 'utf8');
    const cleaned = stripExistingGeneratedBlock(original);

    const timestamp = new Date().toISOString();
    let block = '';
    block += `\n\n${MARKER_START}\n`;
    block += `Generated: ${timestamp}\n`;
    block += `Course: ${course.title}\n`;
    block += `Total lessons: ${course.totalLessons || 0}\n`;
    block += `\n`; 

    course.sections.forEach((section, secIdx) => {
      const secTitle = safeText(section?.title || `Section ${secIdx + 1}`).trim();
      block += `\n========================================\n`;
      block += `SECTION ${secIdx + 1}: ${secTitle}\n`;
      block += `========================================\n\n`;

      (section.lessons || []).forEach((lesson, lesIdx) => {
        const lessonTitle = safeText(lesson?.title || `Lesson ${lesIdx + 1}`).trim();
        block += `----------------------------------------\n`;
        block += `Lesson ${secIdx + 1}.${lesIdx + 1}: ${lessonTitle}\n`;
        block += `----------------------------------------\n\n`;

        block += formatQuiz(lesson?.quiz);
        block += '\n';
        block += formatInterview(lesson?.interview);
        block += '\n';
      });
    });

    block += `${MARKER_END}\n`;

    // backup
    const backupPath = NOTES_PATH.replace(/\.txt$/i, `.bak.${Date.now()}.txt`);
    fs.writeFileSync(backupPath, original, 'utf8');
    fs.writeFileSync(NOTES_PATH, cleaned + block, 'utf8');

    console.log(`Backup written: ${backupPath}`);
    console.log(`Updated master notes: ${NOTES_PATH}`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  }
})();
