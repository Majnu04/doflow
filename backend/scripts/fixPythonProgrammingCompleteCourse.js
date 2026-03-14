import dotenv from 'dotenv';
import mongoose from 'mongoose';

import Course from '../models/Course.js';

dotenv.config();

const TARGET_TITLE = 'Python Programming - Complete Course';
const SOURCE_TAG = 'python-programming-from-pdf';

const ADVANCED_SECTION_TITLES = [
  'Modules & Packages',
  'OOP (Object-Oriented Python)',
  'Exception Handling',
  'Advanced Python',
  'Assertions',
  'File Handling',
  'Object Serialization',
  'Logging',
];

function titleCaseFromSlug(slug) {
  const cleaned = String(slug || '')
    .replace(/^python-/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
  if (!cleaned) return 'Lesson';

  return cleaned
    .split(/\s+/)
    .map((w) => (w.length ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}

function parseLegacyLessonDescription(raw) {
  const text = String(raw || '');
  const lines = text.split(/\r?\n/);

  let extractedTitle = '';
  let startIndex = 0;

  // Legacy generator format often starts with:
  // TITLE: ...
  // DURATION: ...
  // LEVEL: ...
  // (blank)
  if (lines.length >= 1 && /^TITLE\s*:\s*/i.test(lines[0])) {
    extractedTitle = lines[0].replace(/^TITLE\s*:\s*/i, '').trim();

    // Skip TITLE/DURATION/LEVEL lines if present.
    startIndex = 1;
    if (lines[startIndex] && /^DURATION\s*:\s*/i.test(lines[startIndex])) startIndex += 1;
    if (lines[startIndex] && /^LEVEL\s*:\s*/i.test(lines[startIndex])) startIndex += 1;

    // Skip leading blank lines after the metadata.
    while (startIndex < lines.length && lines[startIndex].trim() === '') startIndex += 1;
  }

  const cleanedDescription = lines.slice(startIndex).join('\n').trim();
  return {
    extractedTitle,
    cleanedDescription,
  };
}

function dedupeLessonsByTitle(lessons) {
  const seen = new Set();
  const out = [];
  for (const lesson of lessons) {
    const title = String(lesson?.title || '').trim();
    if (!title) continue;
    if (seen.has(title)) continue;
    seen.add(title);
    out.push(lesson);
  }
  return out;
}

function buildIntroSection() {
  const lessons = [
    {
      title: 'Introduction: How to use this course',
      duration: 10,
      description: `## Introduction: How to use this course

This course is **text-first** and practice-focused.

How to study (simple plan):

1) Read the lesson once (don’t memorize).
2) Re-type the code examples and run them.
3) Do the small practice tasks immediately.
4) If you get errors, read the traceback and fix step-by-step.

Rules for fast progress:

- Don’t skip practice.
- Don’t copy-paste blindly.
- Keep a single file per topic (ex: \`strings_practice.py\`).

Checkpoint:

- Q1: What is the best way to learn Python here?
  A: Read + type + run + practice.
- Q2: Why avoid blind copy-paste?
  A: You won’t build debugging skill.
- Q3: What to do when you get an error?
  A: Read the traceback carefully and fix one thing at a time.
`,
      videoUrl: '',
      resources: [],
      isPreview: true,
    },
    {
      title: 'Setup: Install Python and verify in terminal',
      duration: 14,
      description: `## Setup: Install Python and verify in terminal

Steps (Windows):

1) Install Python 3.x from the official site.
2) During install, **tick** “Add Python to PATH”.
3) Open PowerShell and run:

\`python --version\`

If it prints a version, you’re ready.

Quick test program:

\`hello.py\`

\`\`\`python
print("Hello from Python")
\`\`\`

Run:

\`python hello.py\`

Checkpoint:

- Q1: What does PATH help with?
  A: Running \`python\` from any folder.
- Q2: What file extension is used for Python scripts?
  A: \`.py\`
- Q3: What command runs a script?
  A: \`python your_file.py\`
`,
      videoUrl: '',
      resources: [],
      isPreview: false,
    },
    {
      title: 'Your first program: variables + print + input',
      duration: 16,
      description: `## Your first program: variables + print + input

Let’s combine 3 basics:

- store values in variables
- print output
- take input from user

\`\`\`python
name = input("Enter your name: ")
year = int(input("Enter your birth year: "))

age = 2026 - year
print("Hi", name)
print("Your approx age is", age)
\`\`\`

Common beginner mistake:

- \`input()\` always returns a **string**, so convert when needed.

Checkpoint:

- Q1: What does \`input()\` return?
  A: A string.
- Q2: Why use \`int(input(...))\`?
  A: To convert numeric text into an integer.
- Q3: What does \`print()\` do?
  A: Displays output to the console.
`,
      videoUrl: '',
      resources: [],
      isPreview: false,
    },
  ];

  return {
    title: 'Introduction',
    lessons,
  };
}

function copySectionForCourse(section, { forcePreviewOff } = {}) {
  const srcLessons = Array.isArray(section?.lessons) ? section.lessons : [];
  const lessons = srcLessons.map((l, idx) => ({
    title: String(l.title || '').trim() || `Lesson ${idx + 1}`,
    description: String(l.description || '').trim(),
    videoUrl: String(l.videoUrl || ''),
    duration: typeof l.duration === 'number' && Number.isFinite(l.duration) ? l.duration : 18,
    order: idx + 1,
    isPreview: forcePreviewOff ? false : Boolean(l.isPreview),
    resources: Array.isArray(l.resources) ? l.resources : [],
  }));

  return {
    title: String(section.title || '').trim() || 'Section',
    lessons,
  };
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI in backend/.env');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  const target = await Course.findOne({ title: TARGET_TITLE });
  if (!target) throw new Error(`Target course not found: ${TARGET_TITLE}`);

  const source = await Course.findOne({ tags: SOURCE_TAG }).lean();
  if (!source) throw new Error(`Source course not found by tag: ${SOURCE_TAG}`);

  // 1) Clean + dedupe existing sections/lessons in the interactive course.
  const cleanedSections = [];
  const targetSections = Array.isArray(target.sections) ? target.sections : [];

  for (const section of targetSections) {
    const lessons = Array.isArray(section.lessons) ? section.lessons : [];
    const deduped = dedupeLessonsByTitle(lessons);

    for (const lesson of deduped) {
      const { extractedTitle, cleanedDescription } = parseLegacyLessonDescription(lesson.description);
      const finalTitle = extractedTitle || titleCaseFromSlug(lesson.title);

      lesson.title = finalTitle;
      if (cleanedDescription) lesson.description = cleanedDescription;
    }

    section.lessons = deduped;
    cleanedSections.push(section);
  }

  // 2) Ensure Introduction section exists at the top.
  const intro = buildIntroSection();
  const introSection = {
    title: intro.title,
    order: 1,
    lessons: intro.lessons.map((l, idx) => ({
      title: l.title,
      description: l.description,
      videoUrl: l.videoUrl,
      duration: l.duration,
      order: idx + 1,
      resources: l.resources,
      isPreview: Boolean(l.isPreview),
    })),
  };

  // Remove any existing Introduction-like section to avoid duplicates.
  const withoutIntro = cleanedSections.filter((s) => String(s.title || '').trim().toLowerCase() !== 'introduction');

  // 3) Append advanced sections from the PDF-based course, but only if missing.
  const existingTitles = new Set(withoutIntro.map((s) => String(s.title || '').trim()));
  const sourceSections = Array.isArray(source.sections) ? source.sections : [];

  const advancedToAdd = [];
  for (const neededTitle of ADVANCED_SECTION_TITLES) {
    if (existingTitles.has(neededTitle)) continue;
    const src = sourceSections.find((s) => s.title === neededTitle);
    if (!src) continue;
    advancedToAdd.push(copySectionForCourse(src, { forcePreviewOff: true }));
  }

  // Rebuild target.sections with correct ordering.
  const newSections = [introSection];
  for (const s of withoutIntro) newSections.push(s);
  for (const s of advancedToAdd) {
    newSections.push({
      title: s.title,
      order: 0,
      lessons: s.lessons.map((l) => ({
        title: l.title,
        description: l.description,
        videoUrl: l.videoUrl,
        duration: l.duration,
        order: l.order,
        resources: l.resources,
        isPreview: l.isPreview,
      })),
    });
  }

  // Fix section order fields and lesson order fields.
  for (let i = 0; i < newSections.length; i += 1) {
    newSections[i].order = i + 1;
    const lessons = Array.isArray(newSections[i].lessons) ? newSections[i].lessons : [];
    for (let j = 0; j < lessons.length; j += 1) lessons[j].order = j + 1;
  }

  target.sections = newSections;
  await target.save();

  const totalLessons = target.totalLessons;
  console.log('✅ Course updated');
  console.log('   Title:', target.title);
  console.log('   Sections:', target.sections.length);
  console.log('   Total lessons:', totalLessons);
  console.log('   URL: http://localhost:5174/#/course/' + String(target._id));
}

main()
  .catch((e) => {
    console.error('❌ Failed:', e?.message || e);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });
