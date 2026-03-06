import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import fs from 'fs';

dotenv.config();

// Groq API integration for AI-based question generation
async function callGroqAI(system, user) {
  const apiKey = process.env.GROQ_API_KEY || process.env.GORK_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY or GORK_API_KEY not configured');
  }

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
      temperature: 0.3,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Groq API failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

// Generate high-quality quiz questions based on lesson content
async function generateQuiz(lessonTitle, lessonContent) {
  const system = `You are an expert Python programming instructor creating assessment questions.
Generate ONLY valid JSON (no markdown, no explanations).

RULES:
- Create exactly 3 multiple-choice questions directly from the lesson content.
- Each question must have 4 unique options.
- One option must be correct (answerIndex: 0-3).
- Questions should test understanding, not just memorization.
- Difficulty: beginner to intermediate.
- Keep questions focused on "${lessonTitle}".

Return JSON with this structure:
{
  "title": "Quiz: ${lessonTitle}",
  "questions": [
    {
      "prompt": "question text?",
      "options": ["option A", "option B", "option C", "option D"],
      "answerIndex": 0,
      "explanation": "why this is correct"
    }
  ]
}`;

  const user = `Lesson: ${lessonTitle}

Content:
${lessonContent.slice(0, 3000)}

Create 3 quiz questions testing key concepts from this lesson.`;

  const raw = await callGroqAI(system, user);
  
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse quiz JSON:', e.message);
    return null;
  }
}

// Generate interview questions with sample answers
async function generateInterview(lessonTitle, lessonContent) {
  const system = `You are a Python programming interview coach.
Generate ONLY valid JSON (no markdown, no explanations).

RULES:
- Create exactly 3 interview-style questions for "${lessonTitle}".
- Each question should test conceptual understanding and real-world application.
- Provide a detailed sample answer for each question.
- Sample answers should be 3-6 sentences.
- Questions should be practical and focused on interview success.

Return JSON with this structure:
{
  "title": "Interview: ${lessonTitle}",
  "topic": "${lessonTitle}",
  "questions": [
    {
      "prompt": "interview question?",
      "sampleAnswer": "detailed answer with explanation"
    }
  ]
}`;

  const user = `Lesson: ${lessonTitle}

Content:
${lessonContent.slice(0, 3000)}

Create 3 interview questions that test deep understanding of this topic.`;

  const raw = await callGroqAI(system, user);
  
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse interview JSON:', e.message);
    return null;
  }
}

// Main execution
(async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('Missing MONGODB_URI in .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) {
      throw new Error('Python Programming - Complete Course not found');
    }

    let processed = 0;
    let totalLessons = 0;

    // Count total lessons
    for (const section of course.sections) {
      totalLessons += section.lessons.length;
    }

    console.log(`\n📚 Processing ${totalLessons} lessons for Python course...\n`);

    // Generate quiz and interview for each lesson
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        const lessonContent = lesson.content || lesson.description || '';
        if (!lessonContent || lessonContent.length < 50) {
          console.log(`⏭️  Skipping "${lesson.title}" (insufficient content)`);
          continue;
        }

        try {
          console.log(`📝 Generating for: "${lesson.title}"`);

          // Generate quiz
          const quiz = await generateQuiz(lesson.title, lessonContent);
          if (quiz && quiz.questions && quiz.questions.length === 3) {
            lesson.quiz = quiz;
            console.log(`   ✓ Quiz: 3 questions generated`);
          } else {
            console.log(`   ⚠️  Quiz generation incomplete`);
          }

          // Small delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));

          // Generate interview
          const interview = await generateInterview(lesson.title, lessonContent);
          if (interview && interview.questions && interview.questions.length === 3) {
            lesson.interview = interview;
            console.log(`   ✓ Interview: 3 questions generated`);
          } else {
            console.log(`   ⚠️  Interview generation incomplete`);
          }

          processed++;

          // Rate limit: pause every 4 lessons
          if (processed % 4 === 0) {
            console.log(`   ⏸️  Rate limit pause...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error(`   ❌ Error generating for "${lesson.title}":`, error.message);
        }
      }
    }

    // Save to database
    await course.save();
    console.log(`\n✅ Completed! Updated ${processed} lessons with quiz and interview questions.`);
    console.log(`📊 Total lessons processed: ${processed}/${totalLessons}`);

  } catch (error) {
    console.error('❌ Failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
