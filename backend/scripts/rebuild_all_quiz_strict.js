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

  if (!response.ok) {
    throw new Error(`API failed (${response.status})`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

// Validate quiz strictly
function validateQuiz(quiz) {
  if (!quiz?.questions || !Array.isArray(quiz.questions) || quiz.questions.length !== 3) return false;
  
  for (const q of quiz.questions) {
    // Check for generic options
    if (!q.prompt || q.prompt.length < 15) return false;
    if (!Array.isArray(q.options) || q.options.length !== 4) return false;
    if (q.options.some(opt => /^(Option|Statement|Reason)\s*[1-4A-D]$/i.test(opt))) return false;
    if (q.options.some(opt => opt.length < 5)) return false;
    if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex > 3) return false;
    if (!q.explanation || q.explanation.includes('correct because...')) return false;
  }
  return true;
}

// Validate interview strictly
function validateInterview(interview) {
  if (!interview?.questions || !Array.isArray(interview.questions) || interview.questions.length !== 3) return false;
  
  for (const q of interview.questions) {
    if (!q.prompt || q.prompt.length < 15) return false;
    if (!q.sampleAnswer || q.sampleAnswer.length < 100) return false;
    if (q.sampleAnswer.includes('Sample answer') || q.sampleAnswer.includes('Sample real-world')) return false;
  }
  return true;
}

// Generate quiz with retry
async function generateQuizWithRetry(lessonTitle, lessonContent, maxRetries = 2) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const system = `You are a Python instructor. Generate ONLY valid JSON (no markdown).
Create exactly 3 MCQ questions about: ${lessonTitle}

RULES:
- Questions must use real concepts from the lesson (NOT generic placeholders)
- Each question MUST have 4 different, realistic options
- Options must NOT be "Option A", "Statement 1", etc.
- Each option minimum 5 characters
- answerIndex must be 0-3
- Explanation must NOT say "correct because..."
- NO generic text

Return valid JSON only.`;

      const user = `Lesson: ${lessonTitle}
Content: ${lessonContent.slice(0, 2000)}
Generate 3 specific MCQ questions.`;

      const raw = await callGroqAI(system, user);
      const quiz = JSON.parse(raw);

      if (validateQuiz(quiz)) {
        return quiz;
      }
    } catch (e) {
      // continue retry
    }
  }
  return null;
}

// Generate interview with retry
async function generateInterviewWithRetry(lessonTitle, lessonContent, maxRetries = 2) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const system = `You are a Python mentor. Generate ONLY valid JSON (no markdown).
Create exactly 3 interview questions about: ${lessonTitle}

RULES:
- Each sampleAnswer MUST be 100+ characters
- NOT generic like "Sample answer for this topic"
- Use real Python concepts from the lesson
- Specific, detailed, professional answers

Return valid JSON only.`;

      const user = `Lesson: ${lessonTitle}
Content: ${lessonContent.slice(0, 2000)}
Generate 3 interview questions with detailed sample answers.`;

      const raw = await callGroqAI(system, user);
      const interview = JSON.parse(raw);

      if (validateInterview(interview)) {
        return interview;
      }
    } catch (e) {
      // continue retry
    }
  }
  return null;
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    let processed = 0;
    let succeeded = 0;
    let failed = 0;

    console.log('🔧 REBUILDING ALL QUIZ/INTERVIEW WITH STRICT VALIDATION\n');

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        const content = lesson.content || lesson.description || '';
        
        if (content.length < 100) {
          continue;
        }

        processed++;
        console.log(`[${processed}] ${lesson.title.slice(0, 50)}`);

        try {
          // Clear old data
          lesson.quiz = null;
          lesson.interview = null;

          // Generate quiz
          const quiz = await generateQuizWithRetry(lesson.title, content);
          if (quiz) {
            lesson.quiz = quiz;
            console.log(`   ✓ Quiz: 3 questions`);
            succeeded++;
          } else {
            console.log(`   ✗ Quiz: FAILED`);
            failed++;
          }

          await new Promise(resolve => setTimeout(resolve, 400));

          // Generate interview
          const interview = await generateInterviewWithRetry(lesson.title, content);
          if (interview) {
            lesson.interview = interview;
            console.log(`   ✓ Interview: 3 questions`);
          } else {
            console.log(`   ✗ Interview: FAILED`);
          }

          // Rate limit
          if (processed % 5 === 0) {
            console.log(`   ⏸️  Pause...\n`);
            await new Promise(resolve => setTimeout(resolve, 3000));
          }

        } catch (error) {
          console.log(`   ❌ Error: ${error.message}`);
          failed++;
        }
      }
    }

    await course.save();
    console.log(`\n✅ Done! Successfully regenerated: ${succeeded} lessons`);
    console.log(`⚠️  Failed: ${failed} lessons (need manual review)`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
