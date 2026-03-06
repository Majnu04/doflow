import 'dotenv/config';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Problem from '../models/Problem.js';

const COURSE_TITLE_REGEX = /HackWithInfy 2025/i;
const BANNED_DESCRIPTION_PATTERNS = [/\bjson\b/i, /json-array/i, /\bjudge\b/i];

const hasNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const run = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set in environment (.env).');
  }

  await mongoose.connect(mongoUri);

  const course = await Course.findOne({ title: COURSE_TITLE_REGEX }).select('_id title').lean();
  if (!course) {
    throw new Error('HackWithInfy course not found. Run the seed script first.');
  }

  const courseFull = await Course.findById(course._id).select('title description').lean();
  const courseDesc = String(courseFull?.description || '');
  const courseDescHasBanned = BANNED_DESCRIPTION_PATTERNS.some((re) => re.test(courseDesc));

  const problems = await Problem.find({ course: course._id })
    .select('title description examples testCases')
    .sort({ order: 1, title: 1 })
    .lean();

  const issues = [];
  const stats = {
    problems: problems.length,
    missingInputFormat: 0,
    missingOutputFormat: 0,
    missingExplainedExample: 0,
    hiddenNot50: 0,
    publicMissing: 0,
    bannedWording: 0,
  };

  for (const p of problems) {
    const description = String(p.description || '');
    const hasInputFormat = /\bInput Format\s*:/i.test(description);
    const hasOutputFormat = /\bOutput Format\s*:/i.test(description);
    const hasBannedWording = BANNED_DESCRIPTION_PATTERNS.some((re) => re.test(description));

    const examples = Array.isArray(p.examples) ? p.examples : [];
    const hasExplainedExample = examples.some((ex) => hasNonEmptyString(ex?.explanation));

    const testCases = Array.isArray(p.testCases) ? p.testCases : [];
    const hiddenCount = testCases.filter((t) => t?.isHidden).length;
    const publicCount = testCases.filter((t) => !t?.isHidden).length;

    const problemIssues = [];
    if (!hasInputFormat) {
      stats.missingInputFormat += 1;
      problemIssues.push('missing Input Format');
    }
    if (!hasOutputFormat) {
      stats.missingOutputFormat += 1;
      problemIssues.push('missing Output Format');
    }
    if (!hasExplainedExample) {
      stats.missingExplainedExample += 1;
      problemIssues.push('no example with explanation');
    }
    if (hasBannedWording) {
      stats.bannedWording += 1;
      problemIssues.push('contains JSON/judge implementation wording');
    }
    if (hiddenCount !== 50) {
      stats.hiddenNot50 += 1;
      problemIssues.push(`hidden=${hiddenCount} (expected 50)`);
    }
    if (publicCount < 1) {
      stats.publicMissing += 1;
      problemIssues.push('no public tests');
    }

    if (problemIssues.length) {
      issues.push({ title: p.title, issues: problemIssues });
    }
  }

  console.log(`Course: ${course.title}`);
  console.log(`Problems: ${stats.problems}`);
  console.log(
    `Checks: inputFmtMissing=${stats.missingInputFormat}, outputFmtMissing=${stats.missingOutputFormat}, explainedExampleMissing=${stats.missingExplainedExample}, hiddenNot50=${stats.hiddenNot50}, publicMissing=${stats.publicMissing}, bannedWording=${stats.bannedWording}`
  );

  if (courseDescHasBanned) {
    console.log('\nCourse description issue: contains JSON/judge implementation wording');
    process.exitCode = 1;
  }

  if (issues.length) {
    console.log('\nIssues:');
    for (const item of issues) {
      console.log(`- ${item.title}: ${item.issues.join('; ')}`);
    }
    process.exitCode = 1;
    return;
  }

  if (courseDescHasBanned) {
    return;
  }

  const sample = problems.slice(0, 2).map((p) => {
    const ex = (Array.isArray(p.examples) && p.examples[0]) || {};
    const testCases = Array.isArray(p.testCases) ? p.testCases : [];
    const hiddenCount = testCases.filter((t) => t?.isHidden).length;
    const publicCount = testCases.filter((t) => !t?.isHidden).length;
    return {
      title: p.title,
      exampleExplanationLen: String(ex.explanation || '').trim().length,
      publicCount,
      hiddenCount,
    };
  });

  console.log('\nSample (first 2 problems):');
  for (const s of sample) {
    console.log(
      `- ${s.title}: exampleExplanationLen=${s.exampleExplanationLen}, public=${s.publicCount}, hidden=${s.hiddenCount}`
    );
  }
};

try {
  await run();
} finally {
  await mongoose.disconnect().catch(() => undefined);
}
