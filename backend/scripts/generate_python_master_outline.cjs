/*
  Generates a grouped outline for backend/notes_out/PYTHON_MASTER_NOTES.txt
  Output: backend/notes_out/PYTHON_MASTER_OUTLINE.md

  Usage:
    node backend/scripts/generate_python_master_outline.cjs
*/

const fs = require('fs');
const path = require('path');

const NOTES_PATH = path.join(__dirname, '..', 'notes_out', 'PYTHON_MASTER_NOTES.txt');
const OUTLINE_PATH = path.join(__dirname, '..', 'notes_out', 'PYTHON_MASTER_OUTLINE.md');

const NOTE_HEADER_RE = /^===== NOTE\s+\d{8}_\d{6}\s+\|\s+(.+?)\s+=====$/;

function titleKey(title) {
  return String(title || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();
}

function guessGroup(title) {
  const t = titleKey(title);

  if (t.startsWith('INTRODUCTION')) return 'Introduction';

  if (
    t.startsWith('IDENTIFIERS') ||
    t.startsWith('RESERVED WORDS') ||
    t.startsWith('DATA TYPES') ||
    t.startsWith('TYPE CASTING') ||
    t.startsWith('CONSTANT') ||
    t.startsWith('OPERATORS') ||
    t.includes('DYNAMIC INPUT') ||
    t.includes('COMMAND LINE ARGUMENTS') ||
    t.startsWith('OUTPUT')
  ) {
    return 'Fundamentals';
  }

  if (
    t.startsWith('FLOW CONTROL') ||
    t.startsWith('CONDITIONAL') ||
    t.startsWith('ITERATIVE') ||
    t.startsWith('TRANSFER STATEMENTS')
  ) {
    return 'Control Flow';
  }

  if (t.startsWith('STRING')) return 'String';
  if (t.startsWith('LIST')) return 'List';
  if (t.startsWith('TUPLE')) return 'Tuple';
  if (t.startsWith('SET')) return 'Set';
  if (t.startsWith('DICT') || t.startsWith('DICTIONARY')) return 'Dictionary';

  if (t.includes('FUNCTION')) return 'Functions';
  if (t.includes('MODULE') || t.includes('PACKAGE')) return 'Modules & Packages';
  if (t.includes('OOP') || t.includes('CLASS') || t.includes('INHERIT')) return 'OOP';
  if (t.includes('EXCEPTION')) return 'Exceptions';
  if (t.includes('FILE') || t.includes('SERIALIZATION')) return 'File Handling';
  if (t.includes('LOGGING')) return 'Logging';

  return 'Other';
}

function main() {
  if (!fs.existsSync(NOTES_PATH)) {
    console.error('❌ Notes file not found:', NOTES_PATH);
    process.exit(1);
  }

  const text = fs.readFileSync(NOTES_PATH, 'utf8');
  const lines = text.split(/\r?\n/);

  /** @type {Map<string, string[]>} */
  const groups = new Map();

  for (const line of lines) {
    const match = NOTE_HEADER_RE.exec(line);
    if (!match) continue;

    const title = match[1].trim();
    const group = guessGroup(title);

    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(title);
  }

  const preferredOrder = [
    'Introduction',
    'Fundamentals',
    'Control Flow',
    'String',
    'List',
    'Tuple',
    'Set',
    'Dictionary',
    'Functions',
    'Modules & Packages',
    'OOP',
    'Exceptions',
    'File Handling',
    'Logging',
    'Other'
  ];

  const presentGroups = preferredOrder.filter((g) => groups.has(g));

  let out = '';
  out += '# Python Master Notes — Grouped Outline\n\n';
  out += 'Generated from `backend/notes_out/PYTHON_MASTER_NOTES.txt`.\n\n';

  for (const group of presentGroups) {
    const titles = groups.get(group) || [];
    if (!titles.length) continue;

    out += `## ${group}\n\n`;
    for (const title of titles) {
      out += `- ${title}\n`;
    }
    out += '\n';
  }

  fs.writeFileSync(OUTLINE_PATH, out, 'utf8');
  console.log('✅ Wrote outline:', OUTLINE_PATH);
}

main();
