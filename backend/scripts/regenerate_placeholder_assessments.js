import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

// copy of robust call + extractor (kept local to avoid cross-file imports)
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
          temperature: 0.4,
          max_tokens: 2000,
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
      const wait = Math.min(30000, 1000 * Math.pow(2, attempt));
      console.log(`  ⚠️ API attempt ${attempt} failed: ${err.message}. retrying ${wait}ms`);
      if (attempt > maxRetries) throw err;
      await sleep(wait);
    }
  }
}

function extractJSON(text) {
  text = String(text || '');
  const withoutFences = text.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
  const start = withoutFences.indexOf('{');
  if (start === -1) throw new Error('No JSON object found');
  let depth = 0;
  for (let i = start; i < withoutFences.length; i++) {
    const ch = withoutFences[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    if (depth === 0) {
      const candidate = withoutFences.slice(start, i + 1);
      try { return JSON.parse(candidate); } catch (e) {}
    }
  }
  const regexAny = withoutFences.match(/(\{[\s\S]*\})/);
  if (regexAny) try { return JSON.parse(regexAny[1]); } catch (e) {}
  throw new Error('No valid JSON could be extracted');
}

function isPlaceholderQuiz(quiz) {
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) return true;
  for (const q of quiz.questions) {
    if (!q.prompt || typeof q.prompt !== 'string' || q.prompt.length < 10) return true;
    if (!Array.isArray(q.options) || q.options.length < 2) return true;
    // detect generic options like Option A/B/C or "A","B"
    for (const o of q.options) {
      const low = String(o || '').toLowerCase();
      if (/^option\s*[abcd]$/.test(low) || /^a$|^b$|^c$|^d$/.test(low) || low.includes('option a') && low.includes('option b')) return true;
    }
    if (typeof q.answerIndex !== 'number') return true;
    if (!q.explanation || String(q.explanation).trim().length < 10) return true;
  }
  return false;
}

function isPlaceholderInterview(interview) {
  if (!interview || !Array.isArray(interview.questions) || interview.questions.length === 0) return true;
  for (const q of interview.questions) {
    if (!q.prompt || q.prompt.length < 8) return true;
    if (!q.sampleAnswer || q.sampleAnswer.length < 50) return true;
    const low = String(q.sampleAnswer || '').toLowerCase();
    if (low.includes('answer:') || low.includes('...') || low.includes('lorem') || low.includes('sample')) return true;
  }
  return false;
}

async function generateReplacementQuiz(title, content) {
  const system = `You are an expert Python instructor. Return ONLY VALID JSON following the schema exactly. Create exactly 3 multiple-choice questions focused on the lesson title and content. Each question must have 4 plausible options, one correct answer returned as zero-based 'answerIndex', and an 'explanation' of 40-200 characters. Do NOT use placeholders like 'Option A' or single-letter options. Be concrete and specific.`;
  const user = `Lesson: ${title}\n\nContent (first 2000 chars):\n${content.slice(0,2000)}\n\nOutput JSON schema:\n{ "questions": [ {"prompt":"...","options":["...","...","...","..."],"answerIndex":0,"explanation":"..."} ] }`;
  const raw = await callGroqAI(system, user);
  return extractJSON(raw);
}

async function generateReplacementInterview(title, content) {
  const system = `You are a senior Python mentor. Return ONLY VALID JSON. Create exactly 3 interview-style questions about the lesson. Each question must include 'prompt' and a 'sampleAnswer' field with at least 100 characters showing an expert, specific answer. Avoid generic filler.`;
  const user = `Lesson: ${title}\n\nContent (first 2000 chars):\n${content.slice(0,2000)}\n\nOutput JSON schema:\n{ "questions": [ {"prompt":"...","sampleAnswer":"..."} ] }`;
  const raw = await callGroqAI(system, user);
  return extractJSON(raw);
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    let replaced = 0;
    let scanned = 0;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        scanned++;
        const content = lesson.content || lesson.description || '';
        const needQuiz = isPlaceholderQuiz(lesson.quiz);
        const needInterview = isPlaceholderInterview(lesson.interview);
        if (!needQuiz && !needInterview) continue;

        console.log(`\n[${scanned}] ${lesson.title}\n  needQuiz=${needQuiz} needInterview=${needInterview}`);

        // regenerate quiz if needed
        if (needQuiz) {
          try {
            const quiz = await generateReplacementQuiz(lesson.title, content);
            if (quiz && Array.isArray(quiz.questions) && quiz.questions.length === 3) {
              lesson.quiz = quiz;
              console.log('   ✓ Replaced quiz');
              replaced++;
            } else {
              console.log('   ✗ Quiz generation returned invalid shape');
            }
          } catch (e) {
            console.log('   ✗ Quiz error:', e.message);
          }
          await new Promise(r => setTimeout(r, 1200));
        }

        // regenerate interview if needed
        if (needInterview) {
          try {
            const interview = await generateReplacementInterview(lesson.title, content);
            if (interview && Array.isArray(interview.questions) && interview.questions.length === 3) {
              lesson.interview = interview;
              console.log('   ✓ Replaced interview');
              replaced++;
            } else {
              console.log('   ✗ Interview generation returned invalid shape');
            }
          } catch (e) {
            console.log('   ✗ Interview error:', e.message);
          }
          await new Promise(r => setTimeout(r, 1200));
        }

        // short pause to reduce rate pressure
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    await course.save();
    console.log(`\n✅ Done. Scanned: ${scanned}, Replacements: ${replaced}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌', error);
    process.exitCode = 1;
  }
})();
