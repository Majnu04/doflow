import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.js';
import RoadmapSection from '../models/RoadmapSection.js';
import { problemPresets, cloneArray } from '../utils/problemPresets.js';

dotenv.config();

const TARGET_TITLE = 'Longest Substring Without Repeating Characters';
const TARGET_SECTION_MATCHER = /string/i;
const PRESET = problemPresets[TARGET_TITLE];
const DEFAULT_DIFFICULTY = 'Medium';
const LEETCODE_LINK = 'https://leetcode.com/problems/longest-substring-without-repeating-characters/';

if (!PRESET) {
  console.error(`❌ No preset entry found for "${TARGET_TITLE}". Update problemPresets.js first.`);
  process.exit(1);
}

const pickSection = async () => {
  const section = await RoadmapSection.findOne({ title: TARGET_SECTION_MATCHER });
  if (!section) {
    throw new Error('String section not found. Create it first or adjust TARGET_SECTION_MATCHER.');
  }
  return section;
};

const deriveOrder = async (sectionId, existingProblem) => {
  if (existingProblem?.order) {
    return existingProblem.order;
  }
  const lastProblem = await Problem.findOne({ section: sectionId }).sort({ order: -1 }).lean();
  return lastProblem ? lastProblem.order + 1 : 1;
};

const deriveIsFree = async (sectionId, existingProblem) => {
  if (typeof existingProblem?.isFree === 'boolean') {
    return existingProblem.isFree;
  }
  const reference = await Problem.findOne({ section: sectionId }).sort({ order: 1 }).lean();
  return typeof reference?.isFree === 'boolean' ? reference.isFree : false;
};

const buildPayload = async (section, existingProblem) => {
  const order = await deriveOrder(section._id, existingProblem);
  const isFree = await deriveIsFree(section._id, existingProblem);

  return {
    title: TARGET_TITLE,
    description: PRESET.description,
    difficulty: DEFAULT_DIFFICULTY,
    section: section._id,
    course: section.course,
    order,
    isFree,
    starterCode: cloneArray(PRESET.starterCode),
    testCases: cloneArray(PRESET.testCases),
    constraints: cloneArray(PRESET.constraints),
    hints: cloneArray(PRESET.hints),
    examples: cloneArray(PRESET.examples),
    leetcodeLink: LEETCODE_LINK,
  };
};

const main = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in environment.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  try {
    const section = await pickSection();
    console.log(`📚 Using section "${section.title}" (${section._id})`);

    const existingProblem = await Problem.findOne({ title: TARGET_TITLE });
    if (existingProblem) {
      console.log(`ℹ️  Found existing problem (${existingProblem._id}); will update it.`);
    }

    const payload = await buildPayload(section, existingProblem);
    const result = await Problem.findOneAndUpdate(
      { title: TARGET_TITLE },
      payload,
      { upsert: true, new: true }
    );

    console.log(`✨ Successfully synced "${result.title}" (${result._id})`);
    console.log(`   Section: ${section.title}`);
    console.log(`   Difficulty: ${result.difficulty}`);
    console.log(`   Order: ${result.order}`);
    console.log(`   isFree: ${result.isFree}`);
    console.log(`   Starter code languages: ${result.starterCode.map(sc => sc.language).join(', ')}`);
    console.log(`   Test cases: ${result.testCases.length} (${result.testCases.filter(tc => !tc.isHidden).length} public, ${result.testCases.filter(tc => tc.isHidden).length} hidden)`);
  } catch (error) {
    console.error('❌ Error syncing problem:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
};

main();
