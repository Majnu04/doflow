import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

async function callGroqAI(system, user) {
  const apiKey = process.env.GROQ_API_KEY || process.env.GORK_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');

  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const maxRetries = 5;
  let attempt = 0;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0.5,
          max_tokens: 2800,
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) throw new Error('RATE_LIMIT');
        const text = await response.text().catch(() => '');
        throw new Error(`API error ${status}: ${text.slice(0, 200)}`);
      }

      const data = await response.json();
      return data?.choices?.[0]?.message?.content || '';
    } catch (err) {
      attempt++;
      const isRate = String(err.message || '').includes('RATE_LIMIT') || String(err.message || '').includes('429');
      const wait = Math.min(30000, 1000 * Math.pow(2, attempt));
      console.log(`    ⚠️  API attempt ${attempt} failed${isRate ? ' (rate limit)' : ''}: ${err.message}. retrying in ${wait}ms`);
      if (attempt > maxRetries) {
        throw err;
      }
      await sleep(wait);
    }
  }
}

// Extract JSON from markdown or plain text
function extractJSON(text) {
  text = String(text || '');

  // Remove surrounding markdown fences (but keep inner content)
  const withoutFences = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();

  // Try to find the first balanced JSON object starting from the first '{'
  const start = withoutFences.indexOf('{');
  if (start === -1) throw new Error('No JSON object found');

  let depth = 0;
  for (let i = start; i < withoutFences.length; i++) {
    const ch = withoutFences[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;

    if (depth === 0) {
      const candidate = withoutFences.slice(start, i + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        // Try small repairs: replace single quotes with double quotes if it looks like JSON-like but uses single quotes
        const repaired = candidate.replace(/(\')/g, '"').replace(/\s+\'/g, ' "');
        try {
          return JSON.parse(repaired);
        } catch (e2) {
          // Fall through and continue searching for another object
        }
      }
    }
  }

  // As a last resort, try to find any {...} block with regex
  const regexAny = withoutFences.match(/(\{[\s\S]*\})/);
  if (regexAny) {
    try { return JSON.parse(regexAny[1]); } catch (e) {}
  }

  throw new Error('No valid JSON could be extracted');
}

async function generateQualityQuiz(lessTitle, content) {
  const system = `You are an expert Python instructor.
Return ONLY JSON (inside or outside markdown code block).

Create exactly 3 MCQ questions about: ${lessTitle}
- Each question tests real Python concepts
- 4 realistic options (NOT generic)
- Clear correct answer

JSON format:
{
  "questions": [
    {"prompt": "...", "options": ["...", "...", "...", "..."], "answerIndex": 0, "explanation": "..."}
  ]
}`;

  const user = `Lesson: ${lessTitle}

Content: ${content.slice(0, 2000)}

Generate 3 real MCQ questions about this lesson. Return JSON only.`;

  const raw = await callGroqAI(system, user);
  return extractJSON(raw);
}

async function generateQualityInterview(lessTitle, content) {
  const system = `You are a senior Python mentor.
Return ONLY JSON (inside or outside markdown).

Create exactly 3 interview questions about: ${lessTitle}
- Detailed sample answers (100+ characters each)
- Specific to lesson content

JSON format:
{
  "questions": [
    {"prompt": "...", "sampleAnswer": "..."}
  ]
}`;

  const user = `Lesson: ${lessTitle}

Content: ${content.slice(0, 2000)}

Generate 3 interview questions with sample answers. Return JSON only.`;

  const raw = await callGroqAI(system, user);
  return extractJSON(raw);
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected\n');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    const lessonsList = [];
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        lessonsList.push(lesson);
        if (lessonsList.length >= 30) break;
      }
      if (lessonsList.length >= 30) break;
    }

    console.log(`🎯 Generating for ${lessonsList.length} core lessons\n`);

    let successQuiz = 0;
    let successInterview = 0;

    for (let i = 0; i < lessonsList.length; i++) {
      const lesson = lessonsList[i];
      const content = lesson.content || lesson.description || '';

      if (content.length < 100) {
        console.log(`[${i+1}] ⏭️  ${lesson.title.slice(0, 40)}`);
        continue;
      }

      console.log(`[${i+1}] 📝 ${lesson.title.slice(0, 45)}`);

      try {
        // Quiz
        try {
          const quiz = await generateQualityQuiz(lesson.title, content);
          if (quiz?.questions?.length === 3) {
            lesson.quiz = quiz;
            successQuiz++;
            console.log(`    ✓ Quiz`);
          }
        } catch (e) {
          console.log(`    ✗ Quiz: ${e.message}`);
        }

        // Wait before interview (rate limit protection)
        await new Promise(r => setTimeout(r, 1200));

        // Interview
        try {
          const interview = await generateQualityInterview(lesson.title, content);
          if (interview?.questions?.length === 3) {
            lesson.interview = interview;
            successInterview++;
            console.log(`    ✓ Interview`);
          }
        } catch (e) {
          console.log(`    ✗ Interview: ${e.message}`);
        }

        // Rate limit: pause every 3 lessons
        if ((i + 1) % 3 === 0) {
          console.log(`    ⏸️  Pause 3 sec\n`);
          await new Promise(r => setTimeout(r, 3000));
        } else {
          await new Promise(r => setTimeout(r, 800));
        }

      } catch (error) {
        console.log(`    ❌ ${error.message}`);
      }
    }

    await course.save();
    console.log(`\n✅ Done!`);
    console.log(`Quiz: ${successQuiz}/30`);
    console.log(`Interview: ${successInterview}/30`);

  } catch (error) {
    console.error('❌:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
