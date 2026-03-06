import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

function isPlaceholderQuiz(quiz) {
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) return true;
  for (const q of quiz.questions) {
    if (!q.prompt || typeof q.prompt !== 'string' || q.prompt.length < 10) return true;
    if (!Array.isArray(q.options) || q.options.length < 2) return true;
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
    if (!q.sampleAnswer || q.sampleAnswer.length < 80) return true;
    const low = String(q.sampleAnswer || '').toLowerCase();
    if (low.includes('answer:') || low.includes('...') || low.includes('lorem') || low.includes('sample')) return true;
  }
  return false;
}

function summarizeContent(content) {
  const s = String(content || '').trim();
  if (!s) return '';
  // extract first meaningful sentence up to 240 chars
  const sentences = s.split(/[\.\n]/).map(x => x.trim()).filter(Boolean);
  if (sentences.length === 0) return s.slice(0, 240);
  return sentences[0].slice(0, 240);
}

function mkQuizFromTitleAndContent(title, content) {
  const summary = summarizeContent(content) || `Core idea of ${title}`;
  // Q1: definition/describe
  const q1 = {
    prompt: `Which statement best describes "${title}"?`,
    options: [
      summary,
      `A related but different concept not central to this lesson.`,
      `A low-level implementation detail or platform-specific behavior.`,
      `A command/tool unrelated to the lesson's topic.`
    ],
    answerIndex: 0,
    explanation: summary + ' — this captures the main idea of the lesson.'
  };

  // Q2: true/false style using a clear assertion from summary if possible
  let assertion = summary;
  if (assertion.length > 120) assertion = assertion.slice(0, 117) + '...';
  const q2 = {
    prompt: `True or False: ${assertion}.`,
    options: ['True', 'False', 'Both can be true', 'Depends on implementation'],
    answerIndex: 0,
    explanation: `The statement is true based on the lesson's content: ${summary}`
  };

  // Q3: practical/example
  const q3 = {
    prompt: `Which of the following is a practical use-case or example related to "${title}"?`,
    options: [
      `An example described in the lesson: ${summary.slice(0, 120)}`,
      `An unrelated use-case from a different domain.`,
      `A deprecated approach rarely used today.`,
      `A tooling or deployment instruction unrelated to the concept.`
    ],
    answerIndex: 0,
    explanation: `The first option is directly drawn from the lesson's example or summary.`
  };

  return { title: `Quiz: ${title}`, questions: [q1, q2, q3] };
}

function mkInterviewFromTitleAndContent(title, content) {
  const summary = summarizeContent(content) || `Explain ${title}.`;
  const a1 = `${summary}. In addition, explain why this matters: ${title} helps learners understand core concepts and apply them in examples. Provide one or two short steps to practice.`;
  const a2 = `Give a practical approach: ${summary}. Explain a small code example or steps to try hands-on: 1) try a short snippet, 2) debug outputs, 3) vary inputs.`;
  const a3 = `Explain common pitfalls and best practices related to ${title}. Be specific: mention one common mistake and how to avoid it.`;

  return {
    title: `Interview Practice: ${title}`,
    topic: title,
    questions: [
      { prompt: `Explain in your own words: ${title}`, sampleAnswer: a1 },
      { prompt: `Describe a short hands-on example or exercise for ${title}`, sampleAnswer: a2 },
      { prompt: `What are common pitfalls when working with ${title} and how can they be avoided?`, sampleAnswer: a3 }
    ]
  };
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    let scanned = 0;
    let replaced = 0;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        scanned++;
        const content = lesson.content || lesson.description || '';
        const needQuiz = isPlaceholderQuiz(lesson.quiz);
        const needInterview = isPlaceholderInterview(lesson.interview);
        if (!needQuiz && !needInterview) continue;

        console.log(`\n[${scanned}] ${lesson.title}\n  needQuiz=${needQuiz} needInterview=${needInterview}`);

        if (needQuiz) {
          lesson.quiz = mkQuizFromTitleAndContent(lesson.title, content);
          console.log('   ✓ Template quiz generated');
          replaced++;
        }
        if (needInterview) {
          lesson.interview = mkInterviewFromTitleAndContent(lesson.title, content);
          console.log('   ✓ Template interview generated');
          replaced++;
        }
      }
    }

    await course.save();
    console.log(`\n✅ Done. Scanned: ${scanned}, Replaced: ${replaced}`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌', error);
    process.exitCode = 1;
  }
})();
