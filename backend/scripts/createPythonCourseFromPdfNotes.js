import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Course from '../models/Course.js';
import User from '../models/User.js';

dotenv.config();

const DEFAULT_COURSE_TITLE = 'Python Programming';
const DEFAULT_COURSE_TAG = 'python-programming-from-pdf';
const NOTES_MASTER_FILE = path.resolve(process.cwd(), 'notes_out', 'PYTHON_MASTER_NOTES.txt');

function splitNotesIntoBlocks(notesText) {
  const text = String(notesText || '');
  const headerRe = /^===== NOTE\s+(\d{8}_\d{6})\s+\|\s+(.+?)\s+=====$/gm;
  const matches = Array.from(text.matchAll(headerRe));
  if (matches.length === 0) {
    return [{ timestamp: '', title: 'Notes', content: text.trim() }];
  }

  const blocks = [];
  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const next = matches[i + 1];
    const start = match.index + match[0].length;
    const end = next ? next.index : text.length;

    blocks.push({
      timestamp: match[1] || '',
      title: String(match[2] || '').trim(),
      content: text.slice(start, end).trim(),
    });
  }
  return blocks.filter((b) => b.content && b.content.length > 0);
}

function classifySectionTitle(noteTitle) {
  const t = String(noteTitle || '').toLowerCase();

  // Prefer explicit collection-section prefixes first. This prevents broad keywords like
  // 'input' or 'loop' from incorrectly pulling collection lessons into other sections.
  if (/^(list|tuple|set|dictionary|dict)\b/.test(t)) return 'Data Structures';

  // Prefer explicit section prefixes next (stable + avoids substring false-positives).
  if (/^(oop|oops|object[- ]oriented)\b/.test(t)) return 'OOP (Object-Oriented Python)';
  if (/^functions?\b/.test(t)) return 'Functions';
  if (/^(modules?|packages?)\b/.test(t)) return 'Modules & Packages';
  if (/^strings?\b/.test(t)) return 'Strings';
  if (/^(data types?|type casting)\b/.test(t)) return 'Data Types & Casting';
  if (/^operators?\b/.test(t)) return 'Operators';
  if (/^(input|output)\b/.test(t)) return 'Input / Output';
  if (/^(flow control)\b/.test(t)) return 'Flow Control';
  if (/^(exceptions?|exception handling)\b/.test(t)) return 'Exception Handling';
  if (/^(decorator functions?|decorators?|generator functions?|generators?)\b/.test(t)) return 'Advanced Python';
  if (/^assertions?\b/.test(t)) return 'Assertions';
  if (/^file handling\b/.test(t)) return 'File Handling';
  if (/^logging\b/.test(t)) return 'Logging';
  if (/^(object serialization|serialization|pickling|pickle|jsonpickle|json|yaml)\b/.test(t)) return 'Object Serialization';

  if (/(intro|introduction|features|limitations|flavors|versions|identifiers|reserved)/.test(t)) return 'Language Fundamentals';
  if (/\bstring\b/.test(t)) return 'Strings';
  if (/(data type|type casting|immutability|numbers|\bint\b|\bfloat\b|\bbool\b|escape|constant)/.test(t)) return 'Data Types & Casting';
  if (/operator/.test(t)) return 'Operators';
  if (/(\binput\b|\boutput\b|command line)/.test(t)) return 'Input / Output';
  if (/(del statement|del vs none)/.test(t)) return 'Flow Control';
  if (/(\bif\b|\belse\b|\bfor\b|\bwhile\b|\bbreak\b|\bcontinue\b|\bpass\b|control flow|flow control|\bloop\b)/.test(t)) return 'Flow Control';
  if (/(\blist\b|\btuple\b|\bset\b|\bdict\b|\bdictionary\b|data structure)/.test(t)) return 'Data Structures';
  if (/\bfunction\b/.test(t)) return 'Functions';
  if (/(\bmodule\b|\bpackage\b)/.test(t)) return 'Modules & Packages';
  if (/(oops|\boop\b|object[- ]oriented|\bclass\b|\bobject\b|inheritance|polymorphism|encapsulation|abstraction)/.test(t)) return 'OOP (Object-Oriented Python)';
  if (/\b(exception|except|finally)\b/.test(t) || /\btry\b/.test(t)) return 'Exception Handling';
  if (/(serialization|pickling|unpickling|\bpickle\b|\bjson\b|\byaml\b|jsonpickle|marshalling|unmarshalling)/.test(t)) return 'Object Serialization';
  if (/\bfile\b/.test(t)) return 'File Handling';
  if (/(regex|regular expression)/.test(t)) return 'Regular Expressions';
  if (/(thread|multithread)/.test(t)) return 'Multithreading';
  if (/(generator|iterator|comprehension|decorator)/.test(t)) return 'Advanced Python';
  if (/logging/.test(t)) return 'Logging';
  if (/\b(assert|assertion)\b/.test(t)) return 'Assertions';

  return 'Python';
}

function buildOfflineCoursePlan(notesText) {
  const blocks = splitNotesIntoBlocks(notesText);

  const sectionMap = new Map();
  for (const block of blocks) {
    const sectionTitle = classifySectionTitle(block.title);
    if (!sectionMap.has(sectionTitle)) sectionMap.set(sectionTitle, []);

    sectionMap.get(sectionTitle).push({
      title: block.title,
      content: String(block.content || '').trim(),
    });
  }

  const sections = Array.from(sectionMap.entries()).map(([title, lessons]) => ({
    title,
    lessons,
  }));

  return {
    courseTitle: DEFAULT_COURSE_TITLE,
    courseDescription:
      'A deep, beginner-friendly Python course rebuilt from the Python Doflow PDF. Text-first, example-driven, and focused on logic + real skills.',
    shortDescription: 'Python course (PDF-depth, text-first, examples + practice).',
    level: 'Beginner',
    requirements: [
      'Basic computer knowledge',
      'Willingness to practice daily',
      'Python installed (we will guide setup)',
    ],
    whatYouWillLearn: [
      'Write Python programs confidently (syntax + logic)',
      'Use core data types and operators correctly',
      'Master flow control, strings, and collections',
      'Build strong fundamentals for interviews and projects',
    ],
    tags: ['python', 'python-programming', 'pdf-based', 'text-first'],
    sections,
  };
}

async function main() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI in backend/.env');
    if (!fs.existsSync(NOTES_MASTER_FILE)) throw new Error(`Missing notes master file: ${NOTES_MASTER_FILE}`);

    const raw = fs.readFileSync(NOTES_MASTER_FILE, 'utf8');
    const notesText = String(raw || '').trim();
    if (notesText.length < 200) throw new Error('PYTHON_MASTER_NOTES.txt is too small. Add first topic notes.');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser && process.env.ADMIN_EMAIL) adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminUser) throw new Error('No admin user found. Run scripts/createAdmin.js once.');

    const plan = buildOfflineCoursePlan(notesText);

    const sections = (plan.sections || []).map((section, sectionIndex) => ({
      title: section.title,
      order: sectionIndex + 1,
      lessons: (section.lessons || []).map((lesson, lessonIndex) => ({
        title: lesson.title,
        description: lesson.content,
        videoUrl: '',
        duration: 18,
        order: lessonIndex + 1,
        isPreview: sectionIndex === 0 && lessonIndex === 0,
        resources: [],
      })),
    }));

    let course = await Course.findOne({ tags: DEFAULT_COURSE_TAG });
    if (!course) course = await Course.findOne({ title: new RegExp(`^${DEFAULT_COURSE_TITLE}$`, 'i') });

    if (course) {
      course.title = DEFAULT_COURSE_TITLE;
      course.description = plan.courseDescription;
      course.shortDescription = plan.shortDescription;
      course.level = plan.level;
      course.sections = sections;
      course.requirements = plan.requirements;
      course.whatYouWillLearn = plan.whatYouWillLearn;
      const tags = Array.isArray(plan.tags) ? plan.tags : [];
      course.tags = Array.from(new Set([DEFAULT_COURSE_TAG, 'python', ...tags]));
      course.isPublished = true;
      course.thumbnail = course.thumbnail || '/images/course-placeholder.svg';
      await course.save();
      console.log('\n✅ Python course updated from PDF notes!');
    } else {
      course = await Course.create({
        title: DEFAULT_COURSE_TITLE,
        description: plan.courseDescription,
        shortDescription: plan.shortDescription,
        instructor: adminUser._id,
        category: 'Other',
        level: plan.level,
        price: 0,
        discountPrice: 0,
        thumbnail: '/images/course-placeholder.svg',
        promoVideo: '',
        sections,
        requirements: plan.requirements,
        whatYouWillLearn: plan.whatYouWillLearn,
        tags: Array.from(new Set([DEFAULT_COURSE_TAG, 'python', ...((Array.isArray(plan.tags) && plan.tags) || [])])),
        language: 'English',
        isPublished: true,
        isFeatured: false,
      });
      console.log('\n✅ Python course created from PDF notes!');
    }

    console.log(`   Course ID: ${course._id}`);
    console.log(`   URL: http://localhost:5174/#/course/${course._id}`);
  } catch (error) {
    console.error('❌ Failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }
}

await main();
