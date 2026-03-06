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
      max_tokens: 2500,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Groq API failed: ${text}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

// Generate ONLY high-quality interview questions
async function generateProfessionalInterview(lessonTitle, lessonContent) {
  const system = `You are a senior Python mentor creating interview preparation content.
CRITICAL: Generate ONLY valid JSON (strict format).

RULES:
- Create exactly 3 professional interview questions for Python developers.
- Questions must test real understanding from the lesson, not generic knowledge.
- Sample answers MUST be 4-6 sentences, very specific, with code examples or technical details.
- Each answer should demonstrate expertise and understanding of the topic.
- NO placeholder text like "Sample answer".
- Make answers practical and directly from the lesson content.

Format (MUST be valid JSON):
{
  "title": "Interview: ${lessonTitle}",
  "topic": "${lessonTitle}",
  "questions": [
    {
      "prompt": "specific professional question",
      "sampleAnswer": "4-6 sentence detailed answer with technical specifics"
    }
  ]
}`;

  const user = `Lesson Title: ${lessonTitle}
  
Lesson Content (excerpt):
${lessonContent.slice(0, 2500)}

Generate 3 professional interview questions with detailed, specific sample answers based ONLY on the lesson content.
Each sample answer must be 4-6 sentences, specific, and demonstrate expertise.`;

  const raw = await callGroqAI(system, user);
  
  try {
    const parsed = JSON.parse(raw);
    // Validate all answers have content
    if (parsed.questions) {
      for (const q of parsed.questions) {
        if (!q.sampleAnswer || q.sampleAnswer.includes('Sample') || q.sampleAnswer.length < 50) {
          console.warn(`   ⚠️  Generic answer detected, regenerating...`);
          return null;
        }
      }
    }
    return parsed;
  } catch (e) {
    console.error('   Parse error:', e.message);
    return null;
  }
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    let fixed = 0;
    console.log('🔧 Fixing interview answers (removing generic text)...\n');

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        const content = lesson.content || lesson.description || '';
        if (!content || content.length < 100) continue;

        // Check if interview has generic answers
        if (lesson.interview?.questions) {
          const hasGeneric = lesson.interview.questions.some(
            q => !q.sampleAnswer || q.sampleAnswer.includes('Sample') || q.sampleAnswer.length < 60
          );

          if (hasGeneric) {
            try {
              console.log(`📝 "${lesson.title}"`);
              const newInterview = await generateProfessionalInterview(lesson.title, content);
              if (newInterview?.questions?.length === 3) {
                lesson.interview = newInterview;
                console.log(`   ✓ Interview answers improved\n`);
                fixed++;
              } else {
                console.log(`   ⚠️  Could not improve\n`);
              }
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.log(`   Error: ${error.message}\n`);
            }
          }
        }
      }
    }

    await course.save();
    console.log(`\n✅ Fixed ${fixed} lessons with professional interview answers.`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
