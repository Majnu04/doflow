import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Problem from '../models/Problem.js';
import { buildBatchHarnessedSource } from '../utils/compilerHarness.js';

dotenv.config();

const ADAPTER_ENTRYPOINTS = {
  javascript: '__doflow_entry(...__doflowArgs)',
  python: '__doflow_entry(*__doflow_args)',
  java: 'DoFlowAdapter.__doflow_entry(rawArgs)',
  cpp: '__doflow_entry(rawArgs)',
  c: '__doflow_entry(argc, argv)',
};

const main = async () => {
  const course = await Course.findOne({ title: /HackWithInfy 2025/i }).select('_id title').lean();
  if (!course) {
    throw new Error('HackWithInfy course not found. Seed first.');
  }

  const problems = await Problem.find({ course: course._id }).select('title starterCode testCases').lean();
  if (!problems.length) {
    throw new Error('No problems found for course.');
  }

  const langs = ['javascript', 'python', 'java', 'cpp', 'c'];
  let built = 0;

  for (const problem of problems) {
    const hidden = (problem.testCases || []).filter((tc) => tc.isHidden).slice(0, 2);
    if (!hidden.length) {
      throw new Error(`No hidden tests for ${problem.title}`);
    }

    for (const language of langs) {
      const starter = (problem.starterCode || []).find((s) => s.language === language);
      if (!starter) {
        throw new Error(`Missing starter for ${problem.title} (${language})`);
      }

      const code = starter.visibleCode || starter.code || '';
      const adapterCode = starter.adapterCode || '';
      const entryInvocation = ADAPTER_ENTRYPOINTS[language];

      buildBatchHarnessedSource(language, code, hidden, adapterCode, entryInvocation);
      built += 1;
    }
  }

  console.log(`✅ Batch harness build audit passed: ${built} batch sources generated.`);
};

try {
  await mongoose.connect(process.env.MONGODB_URI);
  await main();
} catch (error) {
  console.error('❌ Batch harness build audit failed:', error?.message || error);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
