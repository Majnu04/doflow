import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Problem from '../models/Problem.js';

dotenv.config();

const [title, language = 'c', linesRaw = '60'] = process.argv.slice(2);
const lines = Number(linesRaw);

if (!title) {
  process.stderr.write('Usage: node scripts/inspectStarterCode.js "<Problem Title>" <language> [lines]\n');
  process.exit(1);
}

if (!process.env.MONGODB_URI) {
  process.stderr.write('MONGODB_URI is not set.\n');
  process.exit(1);
}

await mongoose.connect(process.env.MONGODB_URI);

const problem = await Problem.findOne({ title }).lean();
if (!problem) {
  process.stderr.write(`Problem not found: ${title}\n`);
  await mongoose.disconnect();
  process.exit(2);
}

const starter = Array.isArray(problem.starterCode)
  ? problem.starterCode.find((s) => s && s.language === language)
  : null;

if (!starter) {
  process.stderr.write(`Starter for language '${language}' not found on: ${title}\n`);
  await mongoose.disconnect();
  process.exit(3);
}

const visible = typeof starter.visibleCode === 'string' ? starter.visibleCode : '';
const adapter = typeof starter.adapterCode === 'string' ? starter.adapterCode : '';

process.stdout.write(`Title: ${title}\nLanguage: ${language}\n\n--- visibleCode (top ${lines}) ---\n`);
process.stdout.write(visible.split(/\r?\n/).slice(0, lines).join('\n'));
process.stdout.write(`\n\n--- adapterCode (top ${Math.min(lines, 120)}) ---\n`);
process.stdout.write(adapter.split(/\r?\n/).slice(0, Math.min(lines, 120)).join('\n'));

await mongoose.disconnect();
