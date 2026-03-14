import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

async function callGroqAI(system, user) {
  const apiKey = process.env.GROQ_API_KEY || process.env.GORK_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      temperature: 0.4,
      max_tokens: 3500,
    }),
  });

  if (!response.ok) throw new Error(`API failed`);
  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

// CORRECT validation - only reject ACTUAL placeholders
function isValidQuiz(quiz) {
  if (!quiz?.questions || !Array.isArray(quiz.questions) || quiz.questions.length !== 3) return false;
  
  for (const q of quiz.questions) {
    if (!q.prompt || q.prompt.length < 10) return false;
    if (!Array.isArray(q.options) || q.options.length !== 4) return false;
    
    // Only reject if ALL options are the pattern "Option A", "Option B", etc.
    const allGeneric = q.options.every(opt => /^(Option|Statement|Reason)\s+[1-4A-D]$/.test(opt));
    if (allGeneric) return false;
    
    if (q.options.some(opt => opt.length < 3)) return false;
    if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex > 3) return false;
    if (!q.explanation || q.explanation.length < 10) return false;
  }
  return true;
}

function isValidInterview(interview) {
  if (!interview?.questions || !Array.isArray(interview.questions) || interview.questions.length !== 3) return false;
  
  for (const q of interview.questions) {
    if (!q.prompt || q.prompt.length < 10) return false;
    if (!q.sampleAnswer || q.sampleAnswer.length < 50) return false;
  }
  return true;
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    let totalLessons = 0;
    let quizSuccess = 0;
    let interviewSuccess = 0;
    let failed = [];

    const system_quiz = `You are a Python instructor. Return ONLY valid JSON (no markdown, no extra text).

Create exactly 3 MCQ questions about the lesson topic.
Each question must have 4 real, different options (NOT "Option A", "Option B").
answerIndex must be 0-3.

Format:
{
  "questions": [
    {"prompt": "...", "options": ["...", "...", "...", "..."], "answerIndex": 0, "explanation": "..."}
  ]
}`;

    const system_interview = `You are a Python mentor. Return ONLY valid JSON.

Create exactly 3 interview questions with sample answers (100+ characters each).

Format:
{
  "questions": [
    {"prompt": "...", "sampleAnswer": "..."}
  ]
}`;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        const content = lesson.content || lesson.description || '';
        if (content.length < 100) continue;

        totalLessons++;
        const progress = `[${totalLessons}] ${lesson.title.slice(0, 45)}`;

        try {
          // Quiz
          const userQuiz = `Topic: ${lesson.title}
Content: ${content.slice(0, 1500)}
Generate 3 MCQ questions.`;

          const quizRaw = await callGroqAI(system_quiz, userQuiz);
          const quiz = JSON.parse(quizRaw);

          if (isValidQuiz(quiz)) {
            lesson.quiz = quiz;
            quizSuccess++;
            console.log(`${progress} ✓ Quiz`);
          } else {
            console.log(`${progress} ✗ Quiz`);
            failed.push(lesson.title);
          }

          await new Promise(r => setTimeout(r, 300));

          // Interview
          const userInterview = `Topic: ${lesson.title}
Content: ${content.slice(0, 1500)}
Generate 3 interview questions with detailed sample answers.`;

          const interviewRaw = await callGroqAI(system_interview, userInterview);
          const interview = JSON.parse(interviewRaw);

          if (isValidInterview(interview)) {
            lesson.interview = interview;
            interviewSuccess++;
            console.log(`${progress} ✓ Interview`);
          } else {
            console.log(`${progress} ✗ Interview`);
          }

          // Rate limit
          if (totalLessons % 5 === 0) {
            console.log(`   ⏸️  Pause...\n`);
            await new Promise(r => setTimeout(r, 2000));
          }

        } catch (error) {
          console.log(`${progress} ❌ ${error.message}`);
          failed.push(lesson.title);
        }
      }
    }

    await course.save();
    console.log(`\n✅ COMPLETE RESULTS:`);
    console.log(`Total Lessons: ${totalLessons}`);
    console.log(`Quiz Success: ${quizSuccess}/${totalLessons}`);
    console.log(`Interview Success: ${interviewSuccess}/${totalLessons}`);
    console.log(`Failed: ${failed.length}`);
    
    if (failed.length > 0 && failed.length <= 20) {
      console.log(`\nFailed lessons:`);
      failed.slice(0, 20).forEach(name => console.log(`  - ${name}`));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
