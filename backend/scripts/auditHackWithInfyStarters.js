import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Problem from '../models/Problem.js';

dotenv.config();

const COURSE_TITLE = 'HackWithInfy 2025 — DSA PYQ-Style Prep (50 Problems)';

const requiredEnv = ['MONGODB_URI'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    process.stderr.write(`${key} is not set.\n`);
    process.exit(1);
  }
}

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

function addIssue(issues, { problemId, title, language, kind, message }) {
  issues.push({ problemId: String(problemId || ''), title, language, kind, message });
}

function auditJava({ issues, problemId, title, visibleCode, adapterCode }) {
  const combined = `${visibleCode}\n\n${adapterCode}`;

  const combinedNoComments = combined
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  if (combinedNoComments.includes('"""')) {
    addIssue(issues, {
      problemId,
      title,
      language: 'java',
      kind: 'compile',
      message: 'Contains """ (Java text block delimiter) which can break compilation on Judge0.',
    });
  }

  if (!combined.includes('__doflow_entry')) {
    addIssue(issues, {
      problemId,
      title,
      language: 'java',
      kind: 'harness',
      message: 'Missing DoFlowAdapter.__doflow_entry entrypoint.',
    });
  }

  if (/\bpublic\s+class\s+Solution\b/.test(combined) || /\bpublic\s+class\s+DoFlowAdapter\b/.test(combined)) {
    addIssue(issues, {
      problemId,
      title,
      language: 'java',
      kind: 'compile',
      message: 'Contains public top-level class (Solution/DoFlowAdapter) which can break single-file compilation.',
    });
  }
}

function auditC({ issues, problemId, title, visibleCode, adapterCode }) {
  const combined = `${visibleCode}\n\n${adapterCode}`;
  const needsLongArray = combined.includes('LongArray');
  const hasLongArrayTypedef = /typedef\s+struct\s*\{[\s\S]*?\}\s*LongArray\s*;/.test(combined);
  if (needsLongArray && !hasLongArrayTypedef) {
    addIssue(issues, {
      problemId,
      title,
      language: 'c',
      kind: 'compile',
      message: 'References LongArray but no typedef struct ... LongArray; found.',
    });
  }

  const needsLongMatrix = combined.includes('LongMatrix');
  const hasLongMatrixTypedef = /typedef\s+struct\s*\{[\s\S]*?\}\s*LongMatrix\s*;/.test(combined);
  if (needsLongMatrix && !hasLongMatrixTypedef) {
    addIssue(issues, {
      problemId,
      title,
      language: 'c',
      kind: 'compile',
      message: 'References LongMatrix but no typedef struct ... LongMatrix; found.',
    });
  }

  if (!adapterCode.includes('__doflow_entry')) {
    addIssue(issues, {
      problemId,
      title,
      language: 'c',
      kind: 'harness',
      message: 'Missing __doflow_entry entrypoint.',
    });
  }

  // If adapter is placed before user code, it must contain a prototype for the user function.
  // Heuristic: locate the function whose body contains the "Write your logic here" marker.
  const logicIdx = visibleCode.indexOf('Write your logic here');
  const searchRegion = logicIdx >= 0 ? visibleCode.slice(0, logicIdx) : visibleCode;
  const fnDefRe = /(?:^|\n)\s*[A-Za-z_][A-Za-z0-9_\s\*]*\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;]*\)\s*\{/g;

  let fnName = null;
  for (const match of searchRegion.matchAll(fnDefRe)) {
    fnName = match[1];
  }

  if (fnName && !new RegExp(`\\b${fnName}\\s*\\([^;]*\\)\\s*;`).test(adapterCode)) {
    addIssue(issues, {
      problemId,
      title,
      language: 'c',
      kind: 'compile',
      message: `Adapter missing prototype for user function '${fnName}(...)'.`,
    });
  }
}

function auditCpp({ issues, problemId, title, visibleCode, adapterCode }) {
  const combined = `${visibleCode}\n\n${adapterCode}`;
  if (!combined.includes('__doflow_entry')) {
    addIssue(issues, {
      problemId,
      title,
      language: 'cpp',
      kind: 'harness',
      message: 'Missing __doflow_entry entrypoint.',
    });
  }
}

function auditPy({ issues, problemId, title, visibleCode, adapterCode }) {
  const combined = `${visibleCode}\n\n${adapterCode}`;
  if (!combined.includes('__doflow_entry')) {
    addIssue(issues, {
      problemId,
      title,
      language: 'python',
      kind: 'harness',
      message: 'Missing __doflow_entry entrypoint.',
    });
  }
}

function auditJs({ issues, problemId, title, visibleCode, adapterCode }) {
  const combined = `${visibleCode}\n\n${adapterCode}`;
  if (!combined.includes('__doflow_entry')) {
    addIssue(issues, {
      problemId,
      title,
      language: 'javascript',
      kind: 'harness',
      message: 'Missing __doflow_entry entrypoint.',
    });
  }
}

await mongoose.connect(process.env.MONGODB_URI);

const course = await Course.findOne({ title: COURSE_TITLE }).lean();
if (!course) {
  process.stderr.write(`Course not found by title: ${COURSE_TITLE}\n`);
  await mongoose.disconnect();
  process.exit(2);
}

const problems = await Problem.find({ course: course._id }).lean();
if (!problems.length) {
  process.stderr.write(`No problems found for course=${String(course._id)}\n`);
  await mongoose.disconnect();
  process.exit(3);
}

const issues = [];
const stats = {
  problems: problems.length,
  starters: 0,
  byLang: Object.create(null),
};

for (const problem of problems) {
  const starters = Array.isArray(problem.starterCode) ? problem.starterCode : [];
  for (const starter of starters) {
    const language = starter?.language;
    const visibleCode = isNonEmptyString(starter?.visibleCode) ? starter.visibleCode : '';
    const adapterCode = isNonEmptyString(starter?.adapterCode) ? starter.adapterCode : '';

    stats.starters += 1;
    stats.byLang[language] = (stats.byLang[language] || 0) + 1;

    if (!language) continue;

    if (!isNonEmptyString(visibleCode)) {
      addIssue(issues, {
        problemId: problem._id,
        title: problem.title,
        language,
        kind: 'data',
        message: 'visibleCode is empty.',
      });
    }

    if (!isNonEmptyString(adapterCode)) {
      addIssue(issues, {
        problemId: problem._id,
        title: problem.title,
        language,
        kind: 'data',
        message: 'adapterCode is empty.',
      });
    }

    if (language === 'java') auditJava({ issues, problemId: problem._id, title: problem.title, visibleCode, adapterCode });
    if (language === 'c') auditC({ issues, problemId: problem._id, title: problem.title, visibleCode, adapterCode });
    if (language === 'cpp') auditCpp({ issues, problemId: problem._id, title: problem.title, visibleCode, adapterCode });
    if (language === 'python') auditPy({ issues, problemId: problem._id, title: problem.title, visibleCode, adapterCode });
    if (language === 'javascript') auditJs({ issues, problemId: problem._id, title: problem.title, visibleCode, adapterCode });
  }
}

process.stdout.write(`Audited course: ${COURSE_TITLE}\n`);
process.stdout.write(`Problems: ${stats.problems}, Starters scanned: ${stats.starters}\n`);
process.stdout.write(`By language: ${Object.entries(stats.byLang)
  .map(([k, v]) => `${k}=${v}`)
  .join(', ')}\n`);

if (issues.length) {
  process.stdout.write(`\nFound ${issues.length} issue(s):\n`);
  for (const issue of issues.slice(0, 80)) {
    process.stdout.write(`- [${issue.language}] ${issue.title}: ${issue.kind} — ${issue.message}\n`);
  }
  if (issues.length > 80) {
    process.stdout.write(`...and ${issues.length - 80} more\n`);
  }
  await mongoose.disconnect();
  process.exit(4);
}

process.stdout.write('\n✅ No audit issues found.\n');
await mongoose.disconnect();
