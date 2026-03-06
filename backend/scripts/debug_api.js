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

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Testing one lesson...\n');

    const c = await Course.findOne({ title: 'Python Programming - Complete Course' });
    const lesson = c.sections[0]?.lessons[0];

    console.log(`Lesson: ${lesson.title}\n`);
    const content = lesson.content || lesson.description || '';

    console.log('Requesting quiz from API...\n');

    const system = `You are a Python instructor. RETURN ONLY VALID JSON.
Create exactly 3 MCQ questions about: ${lesson.title}

Format:
{
  "questions": [
    {
      "prompt": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "answerIndex": 0,
      "explanation": "why correct"
    }
  ]
}`;

    const user = `Lesson: ${lesson.title}
Content: ${content.slice(0, 1500)}
Generate 3 MCQ questions in JSON format.`;

    const result = await callGroqAI(system, user);
    
    console.log('API Response:\n');
    console.log(result);
    console.log('\n\nAttempting to parse as JSON...');
    
    try {
      const parsed = JSON.parse(result);
      console.log('✓ Valid JSON!');
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log('✗ Invalid JSON:', e.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
})();
