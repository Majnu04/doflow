import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Problem from '../models/Problem.js';

dotenv.config();

const [title, language, needleArg] = process.argv.slice(2);

if (!process.env.MONGODB_URI) {
  process.stderr.write('MONGODB_URI is not set.\n');
  process.exit(1);
}

if (!title || !language || !needleArg) {
  process.stderr.write('Usage: node scripts/findInStarterCode.js "<Problem Title>" <language> "<needle>"\n');
  process.exit(1);
}

const needle = needleArg === 'TRIPLE_QUOTES' ? '"""' : String(needleArg);

await mongoose.connect(process.env.MONGODB_URI);

const problem = await Problem.findOne({ title }).lean();
if (!problem) {
  process.stderr.write(`Problem not found: ${title}\n`);
  await mongoose.disconnect();
  process.exit(2);
}

const starter = Array.isArray(problem.starterCode) ? problem.starterCode.find((s) => s?.language === language) : null;
if (!starter) {
  process.stderr.write(`Starter not found for language: ${language}\n`);
  await mongoose.disconnect();
  process.exit(3);
}

const combined = `${starter.visibleCode || ''}\n\n${starter.adapterCode || ''}`;
const idx = combined.indexOf(needle);
console.log(`indexOf(${JSON.stringify(needle)}) = ${idx}`);

if (idx >= 0) {
  const start = Math.max(0, idx - 200);
  const end = Math.min(combined.length, idx + needle.length + 200);
  console.log('\n--- context ---');
  console.log(combined.slice(start, end));
}

await mongoose.disconnect();
