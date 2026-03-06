import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import fetch from 'node-fetch';

dotenv.config();

const API_KEY = process.env.GROQ_API_KEY || process.env.GORK_API_KEY;
const ASSESSMENT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

if (!API_KEY) throw new Error('Missing GROQ_API_KEY or GORK_API_KEY in .env');

const fetchGroqChatJson = async ({ system, user }) => {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: ASSESSMENT_MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.2,
      max_tokens: 900,
    }),
  });
  if (!response.ok) throw new Error('Groq request failed: ' + response.status);
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return JSON.parse(content);
};

function trimExistingAssessments(content) {
  const text = String(content || '');
  const lower = text.toLowerCase();
  const markers = ['\nquiz', '\n```quizjson', '\ninterview q', '\n```interviewjson'];
  let cut = text.length;
  for (const m of markers) {
    const idx = lower.indexOf(m);
    if (idx !== -1) cut = Math.min(cut, idx);
  }
  return text.slice(0, cut).trim();
}

function appendAssessments(baseContent, quiz, interview) {
  const quizJson = quiz || { title: 'Quiz', questions: [] };
  const interviewJson = interview || { title: 'Interview Practice', topic: '', questions: [] };
  const interviewBullets = Array.isArray(interviewJson.questions)
    ? interviewJson.questions.map((q) => `- ${q.prompt}`).join('\n')
    : '';
  return [
    baseContent.trim(),
    '',
    'Quiz',
    '```quizjson',
    JSON.stringify(quizJson, null, 2),
    '```',
    '',
    'Interview Q',
    interviewBullets || '- (no questions)',
    '',
    '```interviewjson',
    JSON.stringify(interviewJson, null, 2),
    '```',
  ].join('\n');
}

async function generateAssessmentsForLesson({ lessonTitle, lessonText }) {
  const system = `You are a Python programming instructor.\nReturn ONLY valid JSON (no markdown).\nTask:\nCreate a topic-specific quiz + interview practice based ONLY on the lesson content.\nRules:\n- Quiz must be exactly 3 MCQs, each with 4 options.\n- Each MCQ must have a clearly correct answerIndex (0..3) and a short explanation.\n- Interview must be exactly 3 questions, each with a good sampleAnswer (3-6 lines).\n- Avoid generic questions like \"What is Python?\" unless the lesson is intro.\nSchema:{\n  \"quiz\": {\n    \"title\": string,\n    \"questions\": [\n      { \"prompt\": string, \"options\": string[], \"answerIndex\": number, \"explanation\": string }\n    ]\n  },\n  \"interview\": {\n    \"title\": string,\n    \"topic\": string,\n    \"questions\": [\n      { \"prompt\": string, \"sampleAnswer\": string }\n    ]\n  }\n}`;
  const user = `Lesson title: ${String(lessonTitle || '').slice(0, 120)}\n\nLesson content:\n${String(lessonText || '').slice(0, 5500)}`;
  const json = await fetchGroqChatJson({ system, user });
  const quiz = json?.quiz;
  const interview = json?.interview;
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length !== 3) throw new Error('Bad quiz payload');
  for (const q of quiz.questions) {
    if (!q || !Array.isArray(q.options) || q.options.length !== 4) throw new Error('Bad quiz options');
    if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex > 3) throw new Error('Bad answerIndex');
  }
  if (!interview || !Array.isArray(interview.questions) || interview.questions.length !== 3) throw new Error('Bad interview payload');
  for (const q of interview.questions) {
    if (!q?.prompt || !q?.sampleAnswer) throw new Error('Bad interview question');
  }
  return { quiz, interview };
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const c = await Course.findOne({ title: 'Python Programming - Complete Course' });
  if (!c) throw new Error('Course not found');
  let updated = 0;
  for (const section of c.sections) {
    for (const lesson of section.lessons) {
      const base = trimExistingAssessments(lesson.content || lesson.description || '');
      try {
        const { quiz, interview } = await generateAssessmentsForLesson({ lessonTitle: lesson.title, lessonText: base });
        lesson.content = appendAssessments(base, quiz, interview);
        updated++;
        console.log('✅ Updated:', lesson.title);
      } catch (e) {
        console.warn('⚠️ Failed for', lesson.title, ':', e.message);
      }
      await new Promise((r) => setTimeout(r, 1200));
    }
  }
  await c.save();
  await mongoose.disconnect();
  console.log('All lessons updated with quiz and interview questions. Total:', updated);
}

main().catch((e) => {
  console.error('❌ Failed:', e?.message || e);
  process.exitCode = 1;
});
