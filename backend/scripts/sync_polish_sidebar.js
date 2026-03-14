import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Improved section definitions for a natural Python learning flow
const sectionDefs = [
  ['Introduction', ['introduction', 'setup', 'how to use', 'first program']],
  ['Variables & Data Types', ['variable', 'identifier', 'constant', 'data type', 'type casting', 'fundamental', 'immutability', 'assignment', 'dynamic input', 'input', 'output', 'print', 'command line']],
  ['Operators', ['operator', 'precedence', 'arithmetic', 'comparison', 'logical', 'bitwise', 'assignment', 'identity', 'membership']],
  ['Flow Control', ['flow control', 'conditional', 'if', 'elif', 'else', 'iterative', 'for', 'while', 'break', 'continue', 'pass', 'del']],
  ['Strings', ['string', 'escape', 'formatting', 'strip', 'find', 'replace', 'split', 'join', 'case', 'isalpha', 'isdigit', 'practice']],
  ['Lists', ['list', 'matrix', 'comprehension', 'append', 'insert', 'extend', 'remove', 'pop', 'clear', 'reverse', 'sort', 'aliasing', 'copy', 'practice']],
  ['Tuples', ['tuple', 'packing', 'unpacking', 'comprehension', 'sum', 'average', 'practice']],
  ['Sets', ['set', 'add', 'update', 'remove', 'discard', 'union', 'intersection', 'comprehension', 'practice']],
  ['Dictionaries', ['dictionary', 'dict', 'key', 'value', 'get', 'setdefault', 'pop', 'items', 'copy', 'frequency', 'marks', 'comprehension', 'practice']],
  ['Functions', ['function', 'def', 'parameter', 'argument', 'return', 'lambda', 'scope', 'global', 'recursion', 'filter', 'map', 'reduce', 'practice']],
  ['Modules & Packages', ['module', 'import', 'package', 'dir', 'help', 'math', 'random', 'practice']],
  ['OOP', ['oop', 'class', 'object', 'self', 'constructor', 'init', 'method', 'instance', 'static', 'getter', 'setter', 'inheritance', 'polymorphism', 'abc', 'interface', 'banking', 'practice']],
  ['Exception Handling', ['exception', 'try', 'except', 'finally', 'raise', 'custom', 'safe division', 'practice']],
  ['Decorators', ['decorator']],
  ['Generators', ['generator']],
  ['Assertions', ['assert']],
  ['File Handling', ['file', 'open', 'read', 'write', 'csv', 'zip', 'os', 'pathlib', 'practice']],
  ['Object Serialization', ['serialize', 'deserialize', 'pickle', 'json', 'yaml', 'practice']],
  ['Logging', ['logging', 'log', 'logger', 'filehandler', 'streamhandler', 'config', 'practice']]
];

function findSection(title) {
  const t = title.toLowerCase();
  for (let i = 0; i < sectionDefs.length; ++i) {
    for (const kw of sectionDefs[i][1]) {
      if (t.includes(kw)) return i;
    }
  }
  return -1;
}

// Variables subtopics to highlight and expand
const variableKeywords = [
  'variable', 'identifier', 'constant', 'assignment', 'data type', 'type casting', 'fundamental', 'immutability', 'dynamic input', 'input', 'output', 'print', 'command line'
];

(async () => {
  dotenv.config();
  await mongoose.connect(process.env.MONGODB_URI);
  const c = await Course.findOne({ title: 'Python Programming - Complete Course' });
  if (!c) throw new Error('Course not found');

  // Flatten all lessons
  let allLessons = [];
  c.sections = Array.isArray(c.sections) ? c.sections : [];
  for (const s of c.sections) {
    s.lessons = Array.isArray(s.lessons) ? s.lessons : [];
    for (const l of s.lessons) {
      if (l && l.title) allLessons.push(l);
    }
  }

  // Assign lessons to sections
  const grouped = Array(sectionDefs.length).fill(0).map((_,i) => ({
    title: sectionDefs[i][0],
    order: i+1,
    lessons: []
  }));
  const ungrouped = [];
  for (const l of allLessons) {
    const idx = findSection(l.title);
    if (idx >= 0) grouped[idx].lessons.push(l);
    else ungrouped.push(l);
  }

  // Polish Variables section: sort and expand subtopics
  const variablesSection = grouped.find(s => s.title === 'Variables & Data Types');
  if (variablesSection) {
    variablesSection.lessons.sort((a, b) => {
      // Prioritize variable-related subtopics
      const aScore = variableKeywords.filter(k => a.title.toLowerCase().includes(k)).length;
      const bScore = variableKeywords.filter(k => b.title.toLowerCase().includes(k)).length;
      return bScore - aScore;
    });
  }

  // Remove empty sections
  const sections = grouped.filter(s => s.lessons.length > 0);
  if (ungrouped.length) {
    sections.push({ title: 'Other Topics', order: sections.length+1, lessons: ungrouped });
  }

  c.sections = sections;
  await c.save();
  await mongoose.disconnect();
  console.log('Polished sidebar: improved grouping, order, and variables section.');
})();
