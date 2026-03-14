import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

// Groq API call
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
      max_tokens: 3000,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Groq API failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content || '';
}

// Remove old quiz/interview blocks from content
function cleanContent(content) {
  let cleaned = String(content || '');
  
  // Remove Quiz blocks
  cleaned = cleaned.replace(/\n+Quiz\s*\n+Q\d+\..+?(?=\n\n|\n[A-Z]|\Z)/gs, '');
  cleaned = cleaned.replace(/\n+```quizjson\s*\{[\s\S]*?```/g, '');
  
  // Remove Interview blocks
  cleaned = cleaned.replace(/\n+Interview Q\s*\n+.+?(?=\n\n|\Z)/gs, '');
  cleaned = cleaned.replace(/\n+```interviewjson\s*\{[\s\S]*?```/g, '');
  
  // Remove Quick Practice, Checkpoint sections
  cleaned = cleaned.replace(/\n+Quick Practice.*?(?=\n\n[A-Z]|\n\n###|\Z)/gs, '');
  cleaned = cleaned.replace(/\n+Checkpoint.*?(?=\n\n[A-Z]|\n\n###|\Z)/gs, '');
  
  return cleaned.trim();
}

// Extract key concepts from content
async function extractKeyConcepts(lessonTitle, lessonContent) {
  const system = `You are a Python course analyst. Extract the key concepts, code examples, and important rules from the lesson.
Return ONLY raw text (no JSON, no markdown).
Be very specific and detailed.`;

  const user = `Lesson: ${lessonTitle}

Content:
${lessonContent.slice(0, 3000)}

List all key concepts, code examples, syntax rules, and important points covered in this lesson.`;

  return await callGroqAI(system, user);
}

// Generate context-specific quiz
async function generateContextualQuiz(lessonTitle, lessonContent, concepts) {
  const system = `You are an expert Python instructor creating assessment questions.
CRITICAL: Generate ONLY valid JSON (no markdown, no extra text).

RULES:
- Create exactly 3 MCQ questions that test SPECIFIC concepts from this lesson.
- Each question MUST be about actual code, syntax, or concepts mentioned in the lesson.
- Question must directly relate to: ${concepts.slice(0, 200)}
- Each question has 4 unique, realistic options.
- Exactly one correct answer (answerIndex: 0-3).
- Include a short explanation why the answer is correct.
- Options must be plausible (common mistakes students make).
- NO generic "Option A" or "Statement 1" - use real Python syntax/concepts.

Format:
{
  "title": "Quiz: ${lessonTitle}",
  "questions": [
    {
      "prompt": "specific question about the lesson?",
      "options": ["actual option 1", "actual option 2", "actual option 3", "actual option 4"],
      "answerIndex": 0,
      "explanation": "why this answer is correct based on the lesson"
    }
  ]
}`;

  const user = `Lesson: ${lessonTitle}

Content (first 2000 chars):
${lessonContent.slice(0, 2000)}

Key concepts covered:
${concepts.slice(0, 500)}

Generate 3 specific MCQ questions that test the actual content and concepts.`;

  const raw = await callGroqAI(system, user);
  
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse quiz:', e.message, '\nRaw:', raw.slice(0, 200));
    return null;
  }
}

// Generate interview questions with real sample answers
async function generateContextualInterview(lessonTitle, lessonContent, concepts) {
  const system = `You are a Python interview coach. Generate interview questions that test deep understanding.
CRITICAL: Generate ONLY valid JSON (no markdown, no extra text).

RULES:
- Create exactly 3 interview questions about ${lessonTitle}.
- Questions must test practical understanding, edge cases, and real-world application.
- Provide detailed, specific sample answers (3-6 sentences) based on the lesson.
- NO generic answers like "Sample answer for this topic".
- Each answer should cite specific concepts or code from the lesson.
- Questions should be challenging but answerable from the lesson content.

Format:
{
  "title": "Interview: ${lessonTitle}",
  "topic": "${lessonTitle}",
  "questions": [
    {
      "prompt": "specific interview question?",
      "sampleAnswer": "detailed, specific answer with reasoning from the lesson"
    }
  ]
}`;

  const user = `Lesson: ${lessonTitle}

Content (first 2000 chars):
${lessonContent.slice(0, 2000)}

Key concepts:
${concepts.slice(0, 500)}

Generate 3 interview questions with detailed sample answers based on this lesson's content.`;

  const raw = await callGroqAI(system, user);
  
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse interview:', e.message, '\nRaw:', raw.slice(0, 200));
    return null;
  }
}

// Main execution
(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    let processed = 0;
    let totalLessons = 0;

    for (const section of course.sections) {
      totalLessons += section.lessons.length;
    }

    console.log(`🔄 Cleaning and regenerating ${totalLessons} lessons...\n`);

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        let contentRaw = lesson.content || lesson.description || '';
        if (!contentRaw || contentRaw.length < 100) {
          console.log(`⏭️  "${lesson.title}" - insufficient content`);
          continue;
        }

        try {
          console.log(`📝 "${lesson.title}"`);

          // Step 1: Clean content
          const cleanedContent = cleanContent(contentRaw);
          lesson.content = cleanedContent;
          console.log(`   ✓ Cleaned (removed old quiz/interview blocks)`);

          // Small delay
          await new Promise(resolve => setTimeout(resolve, 300));

          // Step 2: Extract key concepts
          console.log(`   📊 Analyzing concepts...`);
          const concepts = await extractKeyConcepts(lesson.title, cleanedContent);

          // Step 3: Generate quiz
          const quiz = await generateContextualQuiz(lesson.title, cleanedContent, concepts);
          if (quiz?.questions?.length === 3) {
            lesson.quiz = quiz;
            console.log(`   ✓ Quiz: 3 specific questions (${quiz.questions[0].prompt.slice(0, 40)}...)`);
          } else {
            console.log(`   ⚠️  Quiz generation failed`);
          }

          await new Promise(resolve => setTimeout(resolve, 300));

          // Step 4: Generate interview
          const interview = await generateContextualInterview(lesson.title, cleanedContent, concepts);
          if (interview?.questions?.length === 3) {
            lesson.interview = interview;
            console.log(`   ✓ Interview: 3 specific questions (${interview.questions[0].prompt.slice(0, 40)}...)`);
          } else {
            console.log(`   ⚠️  Interview generation failed`);
          }

          processed++;

          // Rate limiting
          if (processed % 3 === 0) {
            console.log(`   ⏸️  Rate limit pause...`);
            await new Promise(resolve => setTimeout(resolve, 2500));
          }

        } catch (error) {
          console.error(`   ❌ Error: ${error.message}`);
        }
      }
    }

    // Save all changes
    await course.save();
    console.log(`\n✅ Completed! Processed ${processed} lessons with high-quality quiz/interview.`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
