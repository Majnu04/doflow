import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Course from '../models/Course.js';
import User from '../models/User.js';

dotenv.config();

const DEFAULT_COURSE_TITLE = 'C Programming';
const DEFAULT_COURSE_TAG = 'c-programming-from-notes';
const NOTES_MASTER_FILE = path.resolve(process.cwd(), 'notes_out', 'MASTER_ENHANCED_NOTES.txt');

const resolveGroqKey = () => process.env.GROQ_API_KEY || process.env.GORK_API_KEY;

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

  if (/(structure|struct|union|typedef|padding|alignment|pack)/.test(t)) return 'Structures, Unions & Memory Layout';
  if (/(function pointer|callback)/.test(t)) return 'Function Pointers & Callbacks';
  if (/recursion/.test(t)) return 'Recursion';
  if (/(pointer)/.test(t)) return 'Pointers';
  if (/(array|string)/.test(t)) return 'Arrays & Strings';
  if (/function/.test(t)) return 'Functions';
  if (/(memory model|stack|heap|static)/.test(t)) return 'Memory Model (Stack/Heap/Static)';
  if (/(intro|need of programming|low level|high level|compiler)/.test(t)) return 'Introduction & Basics';
  return 'C Basics';
}

function buildEngagementFooter(noteTitle) {
  const t = String(noteTitle || '').toLowerCase();

  let practice = [];
  let checkpoint = [];
  let interview = [];
  let quiz = null;
  let interviewJson = null;

  if (t.includes('union')) {
    practice = [
      'Create a union with int/float and print sizeof(union).',
      'Assign int then float; observe last-written member behavior.',
      'Write 2 lines: access union with pointer using ->.',
    ];
    checkpoint = [
      'Q: Union size equals what? A: Largest member size (with alignment).',
      'Q: Can all members hold valid values together? A: No (overlap).',
      'Q: Why use union? A: Memory saving when only one value is needed at a time.',
    ];

    interview = [
      'Explain struct vs union with a real use-case.',
      'What happens if you read a different union member than last written?',
      'How does alignment affect sizeof(union)?',
    ];

    interviewJson = {
      title: 'Interview Practice: Unions',
      topic: 'Unions in C',
      questions: [
        {
          prompt: 'Difference between struct and union? When will u use union?',
          sampleAnswer:
            'Struct: each member has its own storage, so all members can hold values together.\nUnion: all members share the same memory, so only one member value is valid at a time.\nUse union when u want to store one of many types at different times (memory saving), ex: variant-like data or protocol parsing.',
        },
        {
          prompt: 'If u write to one union member and read another member, what happens?',
          sampleAnswer:
            'Generally, reading a different member than the last written does not give a meaningful value. It may appear to show “bit reinterpretation”, but it is not portable/safe. Safer approach: track active member (tag) and read the same member u wrote.',
        },
        {
          prompt: 'How do u calculate sizeof(union)?',
          sampleAnswer:
            'sizeof(union) is at least the size of the largest member, and it can be rounded up due to alignment requirements of the most strictly-aligned member.',
        },
      ],
    };

    quiz = {
      title: 'Quiz: Unions',
      questions: [
        {
          prompt: 'In C, sizeof(union) is usually equal to…',
          options: ['Sum of all members', 'Largest member (plus alignment)', 'Smallest member', 'Always 1 byte'],
          answerIndex: 1,
          explanation: 'Union members overlap, so size is based on the largest member (and alignment).',
        },
        {
          prompt: 'Union is most useful when…',
          options: ['You need all values at same time', 'You want to save memory', 'You want deep copy', 'You want dynamic allocation'],
          answerIndex: 1,
          explanation: 'Only one member is meaningful at a time, so it saves memory.',
        },
        {
          prompt: 'If you write to one member and read another member, the result is…',
          options: ['Always same', 'Always 0', 'Often not meaningful / may be UB depending on use', 'Guaranteed compile-time error'],
          answerIndex: 2,
          explanation: 'Reading a different member than last written is not generally meaningful; be careful.',
        },
      ],
    };
  } else if (t.includes('typedef')) {
    practice = [
      'Create typedef alias for a struct and declare 2 variables.',
      'Write one typedef for a function pointer and declare variable.',
    ];
    checkpoint = [
      'Q: typedef creates new type? A: No, only alias name.',
      'Q: typedef allocates memory? A: No.',
      'Q: Where is typedef useful? A: struct/union/function pointers readability.',
    ];

    interview = [
      'Show typedef for a struct without writing "struct" every time.',
      'Show typedef for a function pointer (callback).',
      'Why typedef improves readability but not runtime?',
    ];

    interviewJson = {
      title: 'Interview Practice: typedef',
      topic: 'typedef in C',
      questions: [
        {
          prompt: 'Write typedef for a struct so u can declare it without the "struct" keyword.',
          sampleAnswer:
            'Example:\n\ntypedef struct Student {\n  int id;\n  char name[32];\n} Student;\n\nNow u can write: Student s1; without writing struct Student s1;',
        },
        {
          prompt: 'Write a typedef for a function pointer (callback).',
          sampleAnswer:
            'Example:\n\ntypedef int (*Comparator)(const void*, const void*);\n\nComparator cmp = myCmp;\n// use cmp(ptr1, ptr2)',
        },
        {
          prompt: 'Does typedef change memory layout or sizeof? Explain.',
          sampleAnswer:
            'No. typedef only creates an alias name at compile-time. It does not change representation, memory layout, or sizeof. Only readability improves.',
        },
      ],
    };

    quiz = {
      title: 'Quiz: typedef',
      questions: [
        {
          prompt: 'typedef in C…',
          options: ['Allocates memory', 'Creates a new alias name', 'Creates a new runtime type', 'Changes sizeof'],
          answerIndex: 1,
          explanation: 'typedef only creates an alias; it does not allocate memory or change sizeof.',
        },
        {
          prompt: 'typedef is especially useful for…',
          options: ['Looping', 'Function pointers and structs', 'Preprocessor macros only', 'printf formatting'],
          answerIndex: 1,
          explanation: 'It makes complex declarations readable (structs/unions/function pointers).',
        },
        {
          prompt: 'typedef changes how the compiler stores data?',
          options: ['Yes', 'No'],
          answerIndex: 1,
          explanation: 'No changes to representation; only the name changes.',
        },
      ],
    };
  } else if (/(padding|alignment|pack)/.test(t)) {
    practice = [
      'Compute sizeof for char-int-char struct using rules (write steps).',
      'Reorder members and compute sizeof again.',
      'Try #pragma pack(1) (only for learning) and compare sizes.',
    ];
    checkpoint = [
      'Q: Padding meaning? A: extra bytes inserted for alignment.',
      'Q: Why alignment needed? A: faster access / fewer transfers.',
      'Q: Packing drawback? A: misaligned access → slower/fault, less portable.',
    ];

    interview = [
      'Explain padding with a char-int-char example.',
      'How to reduce padding without packing?',
      'When is packing acceptable and when dangerous?',
    ];

    interviewJson = {
      title: 'Interview Practice: Padding & Alignment',
      topic: 'Padding and alignment in C',
      questions: [
        {
          prompt: 'Explain padding using struct { char a; int b; char c; } (assume int alignment 4).',
          sampleAnswer:
            'Layout: a at offset 0 (1 byte). Then padding 3 bytes to align b at offset 4. b uses 4 bytes (offset 4..7). c at offset 8 (1 byte). Then tail padding to make total size multiple of max alignment (4), so add 3 bytes. Total sizeof = 12.',
        },
        {
          prompt: 'How can u reduce padding without using #pragma pack?',
          sampleAnswer:
            'Reorder members from larger alignment to smaller: put int/long/double first, then short, then char arrays. This reduces internal padding while keeping alignment safe.',
        },
        {
          prompt: 'What is the risk of packing (#pragma pack(1))?',
          sampleAnswer:
            'Packed structs can create misaligned accesses. On some CPUs it becomes slower; on some it can fault/crash. It is also less portable. Use only when required (ex: binary protocol), and access carefully (memcpy).',
        },
      ],
    };

    quiz = {
      title: 'Quiz: Padding & Alignment',
      questions: [
        {
          prompt: 'Padding bytes are added mainly to…',
          options: ['Increase file size', 'Satisfy alignment for faster access', 'Hide data', 'Prevent compilation'],
          answerIndex: 1,
          explanation: 'Alignment helps the CPU access data efficiently (sometimes required).',
        },
        {
          prompt: 'Best way to reduce padding is…',
          options: ['Use #pragma pack everywhere', 'Reorder struct members', 'Use more pointers', 'Use volatile'],
          answerIndex: 1,
          explanation: 'Reordering members often reduces padding without misalignment risks.',
        },
        {
          prompt: 'Packing can cause…',
          options: ['Always faster code', 'Misaligned accesses and portability issues', 'Larger alignment', 'More padding'],
          answerIndex: 1,
          explanation: 'Misalignment can slow down or even fault on some architectures.',
        },
      ],
    };
  } else if (t.includes('function pointer') || t.includes('callback')) {
    practice = [
      'Declare a function pointer and call a function through it.',
      'Create a small callback function and pass it to another function.',
    ];
    checkpoint = [
      'Q: Correct syntax? A: ret (*ptr)(args).',
      'Q: Why parentheses important? A: changes meaning vs normal function decl.',
      'Q: Callback means? A: passing function address to call later.',
    ];

    interview = [
      'Write a comparator function pointer example (like sorting).',
      'Explain why parentheses matter in function pointer typedef.',
      'When would you use a callback in C?',
    ];

    interviewJson = {
      title: 'Interview Practice: Function Pointers',
      topic: 'Function pointers in C',
      questions: [
        {
          prompt: 'Explain syntax: int (*fp)(int,int); Why parentheses are needed?',
          sampleAnswer:
            'Parentheses bind *fp before ( ). Without parentheses, int *fp(int,int) means a function returning int*. With parentheses, fp is a pointer to a function returning int.',
        },
        {
          prompt: 'Give one callback example in C.',
          sampleAnswer:
            'Example: sorting with comparator. You pass a function pointer cmp(a,b) to a sort function; sort calls cmp many times to decide order.',
        },
        {
          prompt: 'How do u call a function using function pointer?',
          sampleAnswer:
            'If fp points to a function, call as fp(args). Example: int r = fp(2,3);',
        },
      ],
    };

    quiz = {
      title: 'Quiz: Function Pointers',
      questions: [
        {
          prompt: 'Correct pattern for a function pointer is…',
          options: ['ret *ptr(args)', 'ret (*ptr)(args)', 'ret (ptr*)(args)', 'ptr ret(args)'],
          answerIndex: 1,
          explanation: 'Parentheses bind *ptr correctly: ret (*ptr)(args).',
        },
        {
          prompt: 'A callback means…',
          options: ['Calling main again', 'Passing a function address to call later', 'Using recursion', 'Using macros'],
          answerIndex: 1,
          explanation: 'You pass a function pointer so another function can call it.',
        },
        {
          prompt: 'Function pointers are stored as…',
          options: ['Data values', 'Addresses', 'Strings', 'Structs'],
          answerIndex: 1,
          explanation: 'They hold an address of a function.',
        },
      ],
    };
  } else if (t.includes('recursion')) {
    practice = [
      'Write a recursion with base case and dry-run 3 calls.',
      'Convert a simple recursion into iterative loop (if possible).',
    ];
    checkpoint = [
      'Q: Base condition purpose? A: stop recursion and prevent infinite calls.',
      'Q: What grows in recursion? A: stack frames (call stack).',
      'Q: Tail recursion? A: recursive call is last operation.',
    ];

    interview = [
      'Explain recursion vs iteration with factorial.',
      'What is stack overflow in recursion?',
      'When is recursion a bad idea?',
    ];

    interviewJson = {
      title: 'Interview Practice: Recursion',
      topic: 'Recursion in C',
      questions: [
        {
          prompt: 'What is base case? Why mandatory?',
          sampleAnswer:
            'Base case is the condition that stops recursion. Without it, calls keep happening until stack overflow. It ensures termination.',
        },
        {
          prompt: 'Explain recursion vs iteration for factorial.',
          sampleAnswer:
            'Recursion: fact(n)=n*fact(n-1) with base fact(0)=1. Iteration: loop multiply from 1..n. Recursion uses stack frames; iteration uses constant stack.',
        },
        {
          prompt: 'What is stack overflow in recursion?',
          sampleAnswer:
            'Too many recursive calls consume stack memory, program crashes. Happens when depth is large or base case missing.',
        },
      ],
    };

    quiz = {
      title: 'Quiz: Recursion',
      questions: [
        {
          prompt: 'A base case is needed to…',
          options: ['Make code longer', 'Stop recursion', 'Add padding', 'Allocate heap memory'],
          answerIndex: 1,
          explanation: 'Without base case, recursion becomes infinite.',
        },
        {
          prompt: 'Recursion mainly uses…',
          options: ['Heap', 'Stack', 'ROM', 'GPU memory'],
          answerIndex: 1,
          explanation: 'Each call pushes a new stack frame.',
        },
        {
          prompt: 'Tail recursion means…',
          options: ['Recursive call is last operation', 'Recursive call is first line', 'No base case', 'Uses union'],
          answerIndex: 0,
          explanation: 'Tail recursion: last thing in function is the recursive call.',
        },
      ],
    };
  } else if (t.includes('pointer')) {
    practice = [
      'Pass an int to function using pointer and modify caller value.',
      'Show . vs -> using a struct pointer example.',
    ];
    checkpoint = [
      'Q: Call by value default in C? A: Yes.',
      'Q: How to modify caller var? A: pass address (pointer) and dereference.',
      'Q: ptr->x means? A: access member x through pointer.',
    ];

    interview = [
      'Show how to swap two ints using pointers.',
      'Explain . vs -> with a struct pointer.',
      'What is NULL pointer and why check it?',
    ];

    interviewJson = {
      title: 'Interview Practice: Pointers',
      topic: 'Pointers in C',
      questions: [
        {
          prompt: 'Write swap(a,b) using pointers.',
          sampleAnswer:
            'void swap(int *a, int *b) { int t=*a; *a=*b; *b=t; }\nCall: swap(&x,&y);',
        },
        {
          prompt: 'Explain . vs -> (with example).',
          sampleAnswer:
            'If s is a struct variable, use s.x. If p is pointer to struct, use p->x which is same as (*p).x.',
        },
        {
          prompt: 'What is NULL pointer? Why check it?',
          sampleAnswer:
            'NULL means pointer points to nothing valid (0). Check before dereference to avoid crash/UB, especially after malloc or when parameter can be null.',
        },
      ],
    };

    quiz = {
      title: 'Quiz: Pointers',
      questions: [
        {
          prompt: 'To modify a caller variable, we pass…',
          options: ['Its value', 'Its address (pointer)', 'A macro', 'A string'],
          answerIndex: 1,
          explanation: 'Pass the address and dereference inside function.',
        },
        {
          prompt: 'ptr->x is same as…',
          options: ['ptr.x', '(*ptr).x', '&ptr.x', '*ptr.x'],
          answerIndex: 1,
          explanation: 'Arrow is for pointer member access: (*ptr).x.',
        },
        {
          prompt: 'Dereference operator is…',
          options: ['&', '*', '->', '.'],
          answerIndex: 1,
          explanation: '* dereferences a pointer.',
        },
      ],
    };
  } else {
    practice = [
      'Take one example from this lesson and rewrite it in your own words.',
      'Dry-run the code snippet and predict output.',
    ];
    checkpoint = [
      'Q: What is the main idea of this lesson? A: (write 1 line).',
      'Q: One common mistake? A: (write 1 line).',
      'Q: One exam line to remember? A: (write 1 line).',
    ];

    interview = [
      'Explain this topic in 60 seconds.',
      'Give one real-world example of this concept.',
      'What is one common bug students do here?',
    ];

    interviewJson = {
      title: 'Interview Practice',
      topic: noteTitle,
      questions: [
        {
          prompt: 'Explain this concept in 60 seconds.',
          sampleAnswer: 'Start with 1-line definition, then 1 key rule, then 1 tiny example/output.',
        },
        {
          prompt: 'Give one real-world example where this is used.',
          sampleAnswer: 'Mention one scenario and how this concept solves it (2-3 lines).',
        },
        {
          prompt: 'Tell one common bug/mistake and how to avoid it.',
          sampleAnswer: 'Name the bug, why it happens, and 1 prevention tip.',
        },
      ],
    };

    quiz = {
      title: 'Quiz',
      questions: [
        {
          prompt: 'This lesson is mainly about…',
          options: ['Syntax only', 'Core concept + why + examples', 'Only theory', 'Only interview'],
          answerIndex: 1,
          explanation: 'We focus on concept + why + examples + practice.',
        },
        {
          prompt: 'Best way to learn C from this lesson is…',
          options: ['Only read once', 'Practice + run examples', 'Skip code', 'Memorize without understanding'],
          answerIndex: 1,
          explanation: 'Practice and run examples to build skill.',
        },
        {
          prompt: 'Checkpoint is used for…',
          options: ['Decoration', 'Quick self-test', 'Compiler option', 'OS setting'],
          answerIndex: 1,
          explanation: 'Checkpoint questions help you verify understanding fast.',
        },
      ],
    };
  }

  const lines = [];
  lines.push('');
  lines.push('Quick Practice (5 min)');
  practice.forEach((p, idx) => lines.push(`${idx + 1}. ${p}`));
  lines.push('');
  lines.push('Checkpoint');
  checkpoint.forEach((q) => lines.push(`- ${q}`));

  lines.push('');
  lines.push('Quiz');
  lines.push('```quizjson');
  lines.push(JSON.stringify(quiz, null, 2));
  lines.push('```');

  lines.push('');
  lines.push('Interview Q');
  interview.forEach((q) => lines.push(`- ${q}`));

  lines.push('');
  lines.push('```interviewjson');
  lines.push(JSON.stringify(interviewJson, null, 2));
  lines.push('```');

  return lines.join('\n');
}

function buildOfflineCoursePlan(notesText) {
  const blocks = splitNotesIntoBlocks(notesText);

  const sectionMap = new Map();
  for (const block of blocks) {
    const sectionTitle = classifySectionTitle(block.title);
    if (!sectionMap.has(sectionTitle)) {
      sectionMap.set(sectionTitle, []);
    }

    const base = String(block.content || '').trim();
    const contentWithEngagement = `${base}\n${buildEngagementFooter(block.title)}`.trim();

    sectionMap.get(sectionTitle).push({
      title: block.title,
      content: contentWithEngagement,
    });
  }

  const sections = Array.from(sectionMap.entries()).map(([title, lessons]) => ({
    title,
    lessons,
  }));

  const limitedSections = sections.slice(0, 14);
  while (limitedSections.length < 6) {
    limitedSections.push({ title: `Extra Practice ${limitedSections.length + 1}`, lessons: [] });
  }

  return {
    courseTitle: DEFAULT_COURSE_TITLE,
    courseDescription:
      'A complete C Programming course built directly from our MASTER_ENHANCED_NOTES. Text-first, exam-friendly, and practice-driven: each lesson has clear rules, examples, quick practice, and checkpoints.',
    shortDescription: 'C Programming from notes (text-first + practice + checkpoints).',
    level: 'Beginner',
    requirements: [
      'Basic computer knowledge',
      'Willingness to practice daily',
      'A C compiler setup (GCC/Clang/MSVC) to run examples',
    ],
    whatYouWillLearn: [
      'Write clean C programs with correct syntax and flow',
      'Master functions, pointers, recursion, and memory basics',
      'Use structures/unions/typedef and understand padding/alignment',
      'Avoid common exam traps (UB, lifetimes, void params, etc.)',
    ],
    tags: ['c-programming', 'c', 'notes-based', 'text-first'],
    sections: limitedSections,
  };
}

const PREFERRED_NAMES = [
  'Ramu',
  'Sai Ram',
  'Shiva',
  'Ganesha',
  'Venketesawara',
  'Allah',
  'Yesaiyya',
];

const EXAMPLE_NAME_REPLACEMENTS = [
  { from: /\bJenny\b/g, to: PREFERRED_NAMES[0] },
  { from: /\bJohn Doe\b/g, to: PREFERRED_NAMES[1] },
  { from: /\bAlice\b/g, to: PREFERRED_NAMES[2] },
  { from: /\bBob\b/g, to: PREFERRED_NAMES[3] },
  { from: /\bCharlie\b/g, to: PREFERRED_NAMES[4] },
];

function sanitizeExampleNames(input) {
  const text = String(input || '');

  // Keep factual / technical names intact.
  // (We only replace common placeholder person-names used in examples.)
  let out = text;
  for (const rule of EXAMPLE_NAME_REPLACEMENTS) {
    out = out.replace(rule.from, rule.to);
  }
  return out;
}

function sanitizeCoursePlan(plan) {
  if (!plan || typeof plan !== 'object') return plan;
  const cloned = JSON.parse(JSON.stringify(plan));

  if (Array.isArray(cloned.sections)) {
    cloned.sections = cloned.sections.map((section) => {
      const nextSection = { ...section };
      if (Array.isArray(nextSection.lessons)) {
        nextSection.lessons = nextSection.lessons.map((lesson) => ({
          ...lesson,
          title: sanitizeExampleNames(lesson.title),
          content: sanitizeExampleNames(lesson.content),
        }));
      }
      nextSection.title = sanitizeExampleNames(nextSection.title);
      return nextSection;
    });
  }

  cloned.courseDescription = sanitizeExampleNames(cloned.courseDescription);
  cloned.shortDescription = sanitizeExampleNames(cloned.shortDescription);
  return cloned;
}

function safeJsonParse(text) {
  const trimmed = String(text || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
    if (match?.[1]) return JSON.parse(match[1]);
    throw new Error('Failed to parse JSON from model response.');
  }
}

async function groqChatJson({ apiKey, model, system, user }) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      max_tokens: 1200,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Groq API error ${res.status}: ${errText.slice(0, 400)}`);
  }

  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  return safeJsonParse(content);
}

const ASSESSMENT_MODEL = process.env.GROQ_ASSESS_MODEL || 'llama-3.1-8b-instant';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function trimExistingAssessments(content) {
  const text = String(content || '');
  const lower = text.toLowerCase();
  const markers = ['\nquiz', '\n```quizjson', '\ninterview q', '\n```interviewjson'];
  let cut = text.length;
  for (const m of markers) {
    const idx = lower.indexOf(m);
    if (idx !== -1) cut = Math.min(cut, idx);
  }
  return text.slice(0, cut).trim();
}

function appendAssessments(baseContent, quiz, interview) {
  const quizJson = quiz || { title: 'Quiz', questions: [] };
  const interviewJson = interview || { title: 'Interview Practice', topic: '', questions: [] };

  const interviewBullets = Array.isArray(interviewJson.questions)
    ? interviewJson.questions.map((q) => `- ${q.prompt}`).join('\n')
    : '';

  return [
    baseContent.trim(),
    '',
    'Quiz',
    '```quizjson',
    JSON.stringify(quizJson, null, 2),
    '```',
    '',
    'Interview Q',
    interviewBullets || '- (no questions)',
    '',
    '```interviewjson',
    JSON.stringify(interviewJson, null, 2),
    '```',
  ].join('\n');
}

async function generateAssessmentsForLesson({ apiKey, lessonTitle, lessonText }) {
  const system = `You are a C programming instructor.
Return ONLY valid JSON (no markdown).

Task:
Create a topic-specific quiz + interview practice based ONLY on the lesson content.

Rules:
- Keep it practical and exam/interview relevant.
- Quiz must be exactly 3 MCQs, each with 4 options.
- Each MCQ must have a clearly correct answerIndex (0..3) and a short explanation.
- Interview must be exactly 3 questions, each with a good sampleAnswer (3-6 lines).
- Avoid generic questions like "What is C?" unless the lesson is intro.

Schema:
{
  "quiz": {
    "title": string,
    "questions": [
      { "prompt": string, "options": string[], "answerIndex": number, "explanation": string }
    ]
  },
  "interview": {
    "title": string,
    "topic": string,
    "questions": [
      { "prompt": string, "sampleAnswer": string }
    ]
  }
}`;

  const user = `Lesson title: ${String(lessonTitle || '').slice(0, 120)}

Lesson content:
${String(lessonText || '').slice(0, 5500)}`;

  const json = await groqChatJson({
    apiKey,
    model: ASSESSMENT_MODEL,
    system,
    user,
  });

  const quiz = json?.quiz;
  const interview = json?.interview;

  // lightweight validation
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length !== 3) throw new Error('Bad quiz payload');
  for (const q of quiz.questions) {
    if (!q || !Array.isArray(q.options) || q.options.length !== 4) throw new Error('Bad quiz options');
    if (typeof q.answerIndex !== 'number' || q.answerIndex < 0 || q.answerIndex > 3) throw new Error('Bad answerIndex');
  }
  if (!interview || !Array.isArray(interview.questions) || interview.questions.length !== 3) throw new Error('Bad interview payload');
  for (const q of interview.questions) {
    if (!q?.prompt || !q?.sampleAnswer) throw new Error('Bad interview question');
  }

  return { quiz, interview };
}

async function enrichPlanAssessments(plan, apiKey) {
  if (!apiKey) return plan;
  if (!plan?.sections || !Array.isArray(plan.sections)) return plan;

  let count = 0;
  for (const section of plan.sections) {
    if (!section?.lessons || !Array.isArray(section.lessons)) continue;
    for (const lesson of section.lessons) {
      const title = lesson?.title || '';
      const content = lesson?.content || '';
      const base = trimExistingAssessments(content);

      try {
        const { quiz, interview } = await generateAssessmentsForLesson({
          apiKey,
          lessonTitle: title,
          lessonText: base,
        });
        lesson.content = appendAssessments(base, quiz, interview);
      } catch (e) {
        // keep existing footer if AI fails
        lesson.content = content;
      }

      count += 1;
      if (count % 4 === 0) await sleep(350);
    }
  }

  return plan;
}

async function main() {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI in backend/.env');

    const apiKey = resolveGroqKey();

    if (!fs.existsSync(NOTES_MASTER_FILE)) {
      throw new Error(`Missing notes master file: ${NOTES_MASTER_FILE}. Run notes:one first.`);
    }

    const raw = fs.readFileSync(NOTES_MASTER_FILE, 'utf8');
    const notesText = String(raw || '').trim();
    if (notesText.length < 200) throw new Error('Notes master file is too small; add more notes first.');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser && process.env.ADMIN_EMAIL) adminUser = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminUser) throw new Error('No admin user found. Run scripts/createAdmin.js once.');

    const system = `You are my course-content writer.
You will receive a big text file that contains multiple enhanced notes blocks written in my tone.

Goal: Build a clean, section-wise C Programming course.

Rules:
- Use simple Indian-English like my notes: u, lang, mach, i.e., ex, etc.
- headings + bullet points + short lines
- beginner friendly but deeper: add missing why/how points, but do not add new unrelated topics
- NO external links
- Text-first course (NOT video-first). Do not say “watch video”, “in this video”, etc.
- include tiny C examples with expected output
- include ASCII diagrams/flowcharts when helpful
- Each lesson must end with:
  - "Quick Practice (5 min)" (2–4 small tasks)
  - "Checkpoint" (3 short Q/A style questions)
  - "Quiz" as a fenced code block with language quizjson containing JSON with 3 MCQs
  - "Interview Q" with 3 short questions

Return STRICT JSON only.`;

    const schema = `{
  "courseTitle": string,
  "courseDescription": string,
  "shortDescription": string,
  "level": "Beginner"|"Intermediate"|"Advanced",
  "requirements": string[],
  "whatYouWillLearn": string[],
  "tags": string[],
  "sections": [
    {
      "title": string,
      "lessons": [
        {
          "title": string,
          "content": string
        }
      ]
    }
  ]
}`;

    const user = `Create a course using ONLY the notes below.

Constraints:
- courseTitle must be exactly: ${DEFAULT_COURSE_TITLE}
- 6 to 14 sections
- section titles must be topic-based (Arrays, Pointers, Functions, etc.)
- each lesson content ~250–450 words
- lesson content must be Enhanced Notes only (no A/B labels)
- no links

Schema:
${schema}

NOTES:
${notesText.slice(0, 180000)}
`;

    let plan;
    if (apiKey) {
      console.log('🧠 Generating course structure from accumulated notes (Groq)...');
      try {
        plan = await groqChatJson({
          apiKey,
          model: 'llama-3.3-70b-versatile',
          system,
          user,
        });
        plan = sanitizeCoursePlan(plan);
      } catch (error) {
        console.warn('⚠️ Groq generation failed; falling back to offline parser:', error?.message || error);
        plan = sanitizeCoursePlan(buildOfflineCoursePlan(notesText));
      }
    } else {
      console.log('🧠 GROQ_API_KEY not found. Building course structure offline from NOTE blocks...');
      plan = sanitizeCoursePlan(buildOfflineCoursePlan(notesText));
    }

    // Ensure quizzes/interviews are truly topic-specific: do small per-lesson calls.
    if (apiKey) {
      console.log('🧠 Generating topic-specific quiz + interview per lesson...');
      try {
        plan = await enrichPlanAssessments(plan, apiKey);
        plan = sanitizeCoursePlan(plan);
      } catch (error) {
        console.warn('⚠️ Per-lesson assessment generation failed; keeping existing questions:', error?.message || error);
      }
    }

    const sections = (plan.sections || []).map((section, sectionIndex) => ({
      title: section.title,
      order: sectionIndex + 1,
      lessons: (section.lessons || []).map((lesson, lessonIndex) => ({
        title: lesson.title,
        description: lesson.content,
        videoUrl: '',
        duration: 12,
        order: lessonIndex + 1,
        isPreview: sectionIndex === 0 && lessonIndex < 2,
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
      course.tags = Array.from(new Set([DEFAULT_COURSE_TAG, 'c', 'c-programming', ...tags]));
      course.isPublished = true;
      course.thumbnail = course.thumbnail || '/images/course-placeholder.svg';
      await course.save();
      console.log('\n✅ C Programming course updated from notes!');
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
        tags: Array.from(new Set([DEFAULT_COURSE_TAG, 'c', 'c-programming', ...((Array.isArray(plan.tags) && plan.tags) || [])])),
        language: 'English',
        isPublished: true,
        isFeatured: false,
      });
      console.log('\n✅ C Programming course created from notes!');
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

main();
