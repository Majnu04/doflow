import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.js';
import {
  problemPresets,
  cloneArray,
} from '../utils/problemPresets.js';

dotenv.config();

const titles = Object.keys(problemPresets);
const FORCE_OVERWRITE = process.argv.includes('--force') || /^true$/i.test(process.env.FORCE_PRESET_OVERWRITE || '');

const shouldBackfillStarters = (starterCode = []) =>
  !Array.isArray(starterCode) || starterCode.length === 0 || starterCode.every((entry) => !entry?.visibleCode);

const shouldBackfillField = (existingValue = [], presetValue = []) =>
  (!Array.isArray(existingValue) || existingValue.length === 0) && Array.isArray(presetValue) && presetValue.length > 0;

async function applyProblemPresets() {
  if (!process.env.MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in environment.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const problems = await Problem.find({ title: { $in: titles } });
    if (problems.length === 0) {
      console.log('ℹ️  No matching problems found to update.');
      return;
    }

    let updatedCount = 0;

    for (const problem of problems) {
      const preset = problemPresets[problem.title];
      if (!preset) {
        continue;
      }

      const updates = {};
      if ((FORCE_OVERWRITE || shouldBackfillStarters(problem.starterCode)) && preset.starterCode) {
        updates.starterCode = cloneArray(preset.starterCode);
      }
      if ((FORCE_OVERWRITE || shouldBackfillField(problem.testCases, preset.testCases))) {
        updates.testCases = cloneArray(preset.testCases);
      }
      if ((FORCE_OVERWRITE || shouldBackfillField(problem.constraints, preset.constraints))) {
        updates.constraints = cloneArray(preset.constraints);
      }
      if ((FORCE_OVERWRITE || shouldBackfillField(problem.hints, preset.hints))) {
        updates.hints = cloneArray(preset.hints);
      }
      if ((FORCE_OVERWRITE || shouldBackfillField(problem.examples, preset.examples))) {
        updates.examples = cloneArray(preset.examples);
      }
      if ((FORCE_OVERWRITE || !problem.description) && preset.description) {
        updates.description = preset.description;
      }

      if (Object.keys(updates).length === 0) {
        console.log(`➡️  Skipping ${problem.title} (${problem._id}); already populated.`);
        continue;
      }

      await Problem.updateOne({ _id: problem._id }, { $set: updates });
      updatedCount += 1;
      console.log(`✅ Updated ${problem.title} (${problem._id})`);
    }

    console.log(`\n🎯 Finished applying presets to ${updatedCount} problem(s).`);
    if (!FORCE_OVERWRITE) {
      console.log('ℹ️  Run with --force or set FORCE_PRESET_OVERWRITE=true to overwrite populated fields.');
    }
  } catch (error) {
    console.error('❌ Failed to apply problem presets:', error);
  } finally {
    await mongoose.disconnect();
  }
}

applyProblemPresets();
