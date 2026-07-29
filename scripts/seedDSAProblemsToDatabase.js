import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem.js';
import RoadmapSection from '../models/RoadmapSection.js';
import {
  problemPresets,
  defaultStarterCode,
  defaultTestCases,
  defaultConstraints,
  defaultHints,
  cloneArray,
} from '../utils/problemPresets.js';

dotenv.config();

const COURSE_ID = '69221b7d34a1c735a4c255ba';

const dsaProblems = {
  basic: [
    { title: 'Two Sum', difficulty: 'Easy', description: 'Find two numbers that add up to a target value.' },
    { title: 'Reverse String', difficulty: 'Easy', description: 'Reverse a given string.' },
    { title: 'Valid Palindrome', difficulty: 'Easy', description: 'Check if a string is a palindrome.' },
    { title: 'Find Maximum in Array', difficulty: 'Easy', description: 'Find the maximum element in an array.' },
    { title: 'Remove Duplicates from Sorted Array', difficulty: 'Easy', description: 'Remove duplicates in-place from a sorted array.' },
  ],
  intermediate: [
    { title: 'Binary Tree Inorder Traversal', difficulty: 'Medium', description: 'Traverse a binary tree in inorder.' },
    { title: 'Group Anagrams', difficulty: 'Medium', description: 'Group anagrams from a list of strings.' },
    { title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', description: 'Find the longest substring without repeating characters.' },
  ],
  advanced: [
    { title: 'Merge K Sorted Lists', difficulty: 'Hard', description: 'Merge k sorted linked lists.' },
    { title: 'Word Ladder', difficulty: 'Hard', description: 'Find the shortest transformation sequence.' },
  ],
};

const problemPresets = {
  'Two Sum': {
    description:
      'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target. Each input has exactly one solution.',
    starterCode: [
      {
        language: 'javascript',
        visibleCode: `function twoSum(nums, target) {
  // Return two indices [i, j]
  return [];
}`,
        adapterCode: `function __doflow_entry(...args) {
  const [nums, target] = args;
  const result = twoSum(nums, target);
  return Array.isArray(result) ? JSON.stringify(result) : String(result ?? '');
}`,
        code: `function twoSum(nums, target) {
  // Return two indices [i, j]
  return [];
}`,
      },
      {
        language: 'python',
        visibleCode: `class Solution:
    def twoSum(self, nums, target):
        """Return two indices [i, j]"""
        return []`,
        adapterCode: `import json


def __doflow_entry(*args):
    nums, target = args
      console.log(`📦 Created section: ${section.title}`);

      for (let i = 0; i < sectionData.problems.length; i += 1) {
        const problemMeta = sectionData.problems[i];
        const preset = problemPresets[problemMeta.title] || {};

        const problemPayload = {
          title: problemMeta.title,
          description: preset.description || problemMeta.description,
          difficulty: problemMeta.difficulty,
          section: section._id,
          course: COURSE_ID,
          order: i + 1,
          isFree: sectionData.order === 1,
          starterCode: cloneArray(preset.starterCode || defaultStarterCode),
          testCases: cloneArray(preset.testCases || defaultTestCases),
          constraints: cloneArray(preset.constraints || defaultConstraints),
          hints: cloneArray(preset.hints || defaultHints),
          examples: cloneArray(preset.examples),
        };

        await Problem.create(problemPayload);
        totalProblems += 1;
      }

      console.log(`   ↳ Added ${sectionData.problems.length} problems`);
    }

    console.log(`\n🎉 Seeded ${totalProblems} DSA problems across ${sections.length} sections.`);
    console.log(`ℹ️  Course URL: http://localhost:5174/#/dsa/problems/${COURSE_ID}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

seedDSAProblemsToDatabase();
