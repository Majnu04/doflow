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
      temperature: 0.5,
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => '');
    throw new Error(`API error ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

async function generateQualityQuiz(lessTitle, content) {
  const system = `You are an expert Python instructor creating premium MCQ assessments.
STRICT REQUIREMENTS:
1. Return ONLY valid JSON
2. Exactly 3 questions
3. Each question tests real Python concepts from the lesson
4. 4 realistic options (NOT "Option A" - use real concepts)
5. Clear correct answer with justification
6. No generic text

JSON format:
{
  "questions": [
    {
      "prompt": "specific question about lesson topic",
      "options": ["real option 1", "real option 2", "real option 3", "real option 4"],
      "answerIndex": 0,
      "explanation": "why this is correct"
    }
  ]
}`;

  const user = `Python Lesson: "${lessTitle}"

Content:
${content.slice(0, 2500)}

Generate 3 MCQ questions that test deep understanding. Make questions practical and specific to this lesson.`;

  const raw = await callGroqAI(system, user);
  const parsed = JSON.parse(raw);
  return parsed;
}

async function generateQualityInterview(lessTitle, content) {
  const system = `You are a senior Python mentor coaching for interviews.
STRICT REQUIREMENTS:
1. Return ONLY valid JSON
2. Exactly 3 interview questions
3. Each has detailed sample answer (150+ characters)
4. Answers are specific to the lesson, not generic
5. Questions test real-world understanding

JSON format:
{
  "questions": [
    {
      "prompt": "interview question",
      "sampleAnswer": "detailed answer (150+ chars with specifics)"
    }
  ]
}`;

  const user = `Python Lesson: "${lessTitle}"

Content:
${content.slice(0, 2500)}

Generate 3 professional interview questions with detailed sample answers. Focus on practical understanding and real-world usage.`;

  const raw = await callGroqAI(system, user);
  const parsed = JSON.parse(raw);
  return parsed;
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    // Get first 30 lessons
    const lessonsList = [];
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        lessonsList.push(lesson);
        if (lessonsList.length >= 30) break;
      }
      if (lessonsList.length >= 30) break;
    }

    console.log(`🎯 Generating PREMIUM quiz/interview for ${lessonsList.length} core lessons\n`);

    let successQuiz = 0;
    let successInterview = 0;

    for (let i = 0; i < lessonsList.length; i++) {
      const lesson = lessonsList[i];
      const content = lesson.content || lesson.description || '';

      if (content.length < 100) {
        console.log(`[${i+1}/30] ⏭️  "${lesson.title}" (too short)`);
        continue;
      }

      console.log(`[${i+1}/30] 📝 "${lesson.title.slice(0, 40)}..."`);

      try {
        // Quiz
        const quiz = await generateQualityQuiz(lesson.title, content);
        if (quiz?.questions?.length === 3) {
          lesson.quiz = quiz;
          successQuiz++;
          console.log(`        ✓ Quiz: 3 questions`);
        } else {
          console.log(`        ✗ Quiz failed`);
        }

        await new Promise(r => setTimeout(r, 500));

        // Interview
        const interview = await generateQualityInterview(lesson.title, content);
        if (interview?.questions?.length === 3) {
          lesson.interview = interview;
          successInterview++;
          console.log(`        ✓ Interview: 3 questions`);
        } else {
          console.log(`        ✗ Interview failed`);
        }

        // Pause every 5 lessons
        if ((i + 1) % 5 === 0) {
          console.log(`\n   ⏸️  Rate limit pause (2 sec)...\n`);
          await new Promise(r => setTimeout(r, 2000));
        }

      } catch (error) {
        console.log(`        ❌ Error: ${error.message}`);
      }
    }

    await course.save();
    console.log(`\n✅ COMPLETE`);
    console.log(`Quiz: ${successQuiz}/30 ✓`);
    console.log(`Interview: ${successInterview}/30 ✓`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
