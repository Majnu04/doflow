import dotenv from 'dotenv';
import mongoose from 'mongoose';
import axios from 'axios';
import { Buffer } from 'buffer';

import Course from '../models/Course.js';
import Problem from '../models/Problem.js';
import judge0Queue from '../utils/judge0Queue.js';
import retryWithBackoff from '../utils/judge0Retry.js';
import { buildHarnessedSource } from '../utils/compilerHarness.js';

dotenv.config();

if (process.env.JUDGE0_MAX_CONCURRENT) {
  judge0Queue.setMaxConcurrent(process.env.JUDGE0_MAX_CONCURRENT);
}

const COURSE_TITLE = 'HackWithInfy 2025 — DSA PYQ-Style Prep (50 Problems)';

const ADAPTER_ENTRYPOINTS = {
  javascript: '__doflow_entry(...__doflowArgs)',
  python: '__doflow_entry(*__doflow_args)',
  java: 'DoFlowAdapter.__doflow_entry(rawArgs)',
  cpp: '__doflow_entry(rawArgs)',
  c: '__doflow_entry(argc, argv)',
};

const LANGUAGE_MAPPING = {
  javascript: 93, // Node.js
  python: 71, // Python 3.8.1
  java: 62, // Java 15.0.2
  cpp: 54, // C++ 17
  c: 50, // C (GCC 9.2.0)
};

const requiredEnv = ['MONGODB_URI'];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    process.stderr.write(`${key} is not set.\n`);
    process.exit(1);
  }
}

const parseArgs = () => {
  const args = process.argv.slice(2);
  const out = {
    max: null,
    continueOnFailure: false,
    only: null,
  };

  for (let i = 0; i < args.length; i += 1) {
    const a = args[i];
    if (a === '--max') {
      out.max = Number(args[i + 1]);
      i += 1;
      continue;
    }
    if (a === '--continue') {
      out.continueOnFailure = true;
      continue;
    }
    if (a === '--only') {
      out.only = String(args[i + 1] || '').trim() || null;
      i += 1;
      continue;
    }
  }

  if (out.max !== null && !Number.isFinite(out.max)) {
    out.max = null;
  }
  if (out.max !== null) {
    out.max = Math.max(1, Math.floor(out.max));
  }

  return out;
};

const buildJudge0Client = () => {
  const judge0ApiKey = process.env.JUDGE0_API_KEY;
  const isRapidApi = Boolean(judge0ApiKey);

  let judge0ApiUrl = process.env.JUDGE0_API_URL || (isRapidApi ? 'https://judge0-ce.p.rapidapi.com' : 'https://ce.judge0.com');

  if (!isRapidApi && /rapidapi/i.test(judge0ApiUrl)) {
    process.stderr.write('RapidAPI host configured but no API key found. Falling back to https://ce.judge0.com\n');
    judge0ApiUrl = 'https://ce.judge0.com';
  }

  const judge0Headers = isRapidApi
    ? {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': judge0ApiKey,
      }
    : {
        'Content-Type': 'application/json',
      };

  if (!judge0ApiKey) {
    process.stderr.write('Judge0 API key not set; using public ce.judge0.com (strict rate limits).\n');
  }

  return { judge0ApiUrl, judge0Headers };
};

const toBase64 = (str) => Buffer.from(str ?? '', 'utf-8').toString('base64');
const fromBase64 = (value) => {
  if (!value) return value;
  try {
    return Buffer.from(value, 'base64').toString('utf-8');
  } catch {
    return value;
  }
};

const submitToJudge0 = async (client, payload) => {
  const base64Payload = { ...payload };
  if (payload.source_code) {
    base64Payload.source_code = toBase64(payload.source_code);
  }

  const response = await judge0Queue.enqueue(() =>
    retryWithBackoff(
      () =>
        axios.post(`${client.judge0ApiUrl}/submissions?base64_encoded=true&wait=true`, base64Payload, {
          headers: client.judge0Headers,
          timeout: 30000,
        }),
      3,
      1000
    )
  );

  const raw = response.data || {};
  return {
    ...raw,
    stdout: fromBase64(raw.stdout),
    stderr: fromBase64(raw.stderr),
    compile_output: fromBase64(raw.compile_output),
    message: fromBase64(raw.message),
  };
};

const pickSmokeTestCase = (problem) => {
  const tests = Array.isArray(problem?.testCases) ? problem.testCases : [];
  if (!tests.length) return { input: '[]', expectedOutput: null, isHidden: false };
  const publicTest = tests.find((t) => !t?.isHidden);
  return publicTest || tests[0];
};

const normalizeStatus = (raw) => {
  const id = raw?.status?.id;
  const description = raw?.status?.description || 'Unknown';
  return { id, description };
};

const isFailure = (raw) => {
  const { description } = normalizeStatus(raw);
  if (/compilation\s+error/i.test(description)) return true;
  if (/runtime\s+error/i.test(description)) return true;
  if (/time\s+limit\s+exceeded/i.test(description)) return true;

  // Some Judge0 instances omit description; fall back on outputs.
  const compileOut = String(raw?.compile_output || '').trim();
  const stderr = String(raw?.stderr || '').trim();
  if (compileOut.length) return true;
  if (stderr.length && /error|exception|segmentation|stack/i.test(stderr)) return true;

  return false;
};

const formatFailure = (raw) => {
  const { id, description } = normalizeStatus(raw);
  const compileOut = String(raw?.compile_output || '').trim();
  const stderr = String(raw?.stderr || '').trim();
  const stdout = String(raw?.stdout || '').trim();

  const details = [
    `status=${description}${id ? ` (#${id})` : ''}`,
    compileOut ? `compile_output=${compileOut.slice(0, 800)}` : null,
    stderr ? `stderr=${stderr.slice(0, 800)}` : null,
    stdout ? `stdout=${stdout.slice(0, 300)}` : null,
  ].filter(Boolean);

  return details.join('\n');
};

const { max, continueOnFailure, only } = parseArgs();

await mongoose.connect(process.env.MONGODB_URI);

const course = await Course.findOne({ title: COURSE_TITLE }).lean();
if (!course) {
  process.stderr.write(`Course not found: ${COURSE_TITLE}\n`);
  await mongoose.disconnect();
  process.exit(2);
}

const problems = await Problem.find({ course: course._id }).lean();
if (!problems.length) {
  process.stderr.write(`No problems found for course=${String(course._id)}\n`);
  await mongoose.disconnect();
  process.exit(3);
}

const client = buildJudge0Client();

const tasks = [];
for (const problem of problems) {
  if (only && problem.title !== only) continue;

  const starters = Array.isArray(problem.starterCode) ? problem.starterCode : [];
  for (const starter of starters) {
    const language = starter?.language;
    if (!LANGUAGE_MAPPING[language]) continue;

    tasks.push({
      problemId: String(problem._id),
      title: problem.title,
      language,
      visibleCode: starter.visibleCode || '',
      adapterCode: starter.adapterCode || '',
      smokeTest: pickSmokeTestCase(problem),
    });
  }
}

if (!tasks.length) {
  process.stderr.write('No starter entries found to smoke test.\n');
  await mongoose.disconnect();
  process.exit(4);
}

const cappedTasks = max ? tasks.slice(0, max) : tasks;
process.stdout.write(`Smoke testing ${cappedTasks.length}/${tasks.length} starters on Judge0...\n`);

let completed = 0;
let failed = 0;
const failures = [];

for (const task of cappedTasks) {
  const languageId = LANGUAGE_MAPPING[task.language];
  const entryInvocation = task.adapterCode ? ADAPTER_ENTRYPOINTS[task.language] : null;

  let harnessedSource;
  try {
    harnessedSource = buildHarnessedSource(task.language, task.visibleCode, task.smokeTest, task.adapterCode, entryInvocation);
  } catch (error) {
    failed += 1;
    failures.push({
      ...task,
      kind: 'harness',
      details: String(error?.message || error),
    });

    if (!continueOnFailure) break;
    completed += 1;
    continue;
  }

  const payload = {
    language_id: languageId,
    source_code: harnessedSource,
  };

  let raw;
  try {
    raw = await submitToJudge0(client, payload);
  } catch (error) {
    failed += 1;
    failures.push({
      ...task,
      kind: 'judge0',
      details: String(error?.response?.data || error?.message || error),
    });

    if (!continueOnFailure) break;
    completed += 1;
    continue;
  }

  if (isFailure(raw)) {
    failed += 1;
    const failure = {
      ...task,
      kind: 'execute',
      details: formatFailure(raw),
    };
    failures.push(failure);

    process.stdout.write(`\n❌ [${failure.language}] ${failure.title} (${failure.kind})\n${failure.details}\n`);

    if (!continueOnFailure) {
      completed += 1;
      break;
    }
  }

  completed += 1;
  if (completed % 10 === 0) {
    process.stdout.write(`...${completed}/${cappedTasks.length} done (failed=${failed})\n`);
  }
}

if (failures.length) {
  process.stdout.write(`\n❌ Smoke test failures: ${failures.length}\n`);
  for (const f of failures.slice(0, 20)) {
    process.stdout.write(`\n- [${f.language}] ${f.title} (${f.kind})\n${f.details}\n`);
  }
  if (failures.length > 20) {
    process.stdout.write(`\n...and ${failures.length - 20} more\n`);
  }

  await mongoose.disconnect();
  process.exit(5);
}

process.stdout.write(`\n✅ Smoke test passed: ${completed}/${cappedTasks.length} starters compiled/executed without platform errors.\n`);
await mongoose.disconnect();
