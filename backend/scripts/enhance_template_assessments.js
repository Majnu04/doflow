import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from '../models/Course.js';

dotenv.config();

function summarize(content) {
  const s = String(content || '').trim();
  if (!s) return '';
  const lines = s
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .filter(l => !l.startsWith('```'));
  const first = lines[0] || s.slice(0, 200);
  return first
    .replace(/^#+\s*/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 300);
}

function uniqOptions(options) {
  const seen = new Set();
  const out = [];
  for (const o of options) {
    const s = String(o || '').trim();
    if (!s) continue;
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

function hashStringToUint32(str) {
  // FNV-1a 32-bit
  let h = 2166136261;
  const s = String(str || '');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithSeed(array, seedStr) {
  const arr = [...array];
  const rand = mulberry32(hashStringToUint32(seedStr));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function parseArgs(argv) {
  const out = {};
  for (const a of argv.slice(2)) {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2];
  }
  return out;
}

function generateYearDistractors(yearStr) {
  const y = parseInt(yearStr, 10);
  if (!Number.isFinite(y)) return [];
  const candidates = [y - 2, y - 1, y + 2, y + 4, y - 5, y + 1].filter(n => n > 1900 && n < 2100);
  return uniqOptions(candidates.map(String)).slice(0, 3);
}

const PY_KEYWORDS = new Set([
  'false','none','true','and','as','assert','async','await','break','class','continue','def','del','elif','else','except',
  'finally','for','from','global','if','import','in','is','lambda','nonlocal','not','or','pass','raise','return','try',
  'while','with','yield','match','case'
]);

function isValidIdentifierName(name) {
  const s = String(name || '').trim();
  if (!s) return false;
  if (!/^[_A-Za-z][_A-Za-z0-9]*$/.test(s)) return false;
  return true;
}

function isPythonKeyword(name) {
  const s = String(name || '').trim();
  if (!s) return false;
  return PY_KEYWORDS.has(s.toLowerCase());
}

function identifierDistractors(correct, { preferValid = true } = {}) {
  const base = ['total', 'total_count', '_temp', 'value2', 'user_name', 'count', 'result', 'myVar', 'data_1'];
  const extrasInvalid = ['2value', 'my var', 'ca$h', 'def'];
  const candidates = preferValid ? base : base.concat(extrasInvalid);
  return uniqOptions(
    candidates
      .filter(x => x.toLowerCase() !== String(correct || '').trim().toLowerCase())
      .filter(x => (preferValid ? (isValidIdentifierName(x) && !isPythonKeyword(x)) : true))
  ).slice(0, 3);
}

function makeDistractors({ correct, title, content, prompt }) {
  const p = String(prompt || '').toLowerCase();
  const t = String(title || '').toLowerCase();
  const c = String(correct || '').trim();
  const cLower = c.toLowerCase();

  // If the question expects an identifier-style option list, keep options as identifiers.
  if (p.includes('which of the following') && (p.includes('identifier') || p.includes('identifiers'))) {
    // If correct is a keyword (like "def"), distractors should be valid NON-keyword identifiers.
    if (isPythonKeyword(c) || !isValidIdentifierName(c)) {
      return identifierDistractors(c, { preferValid: true });
    }
    // Otherwise, default to valid identifier distractors too.
    return identifierDistractors(c, { preferValid: true });
  }

  // Question-aware rules (better than topic-only)
  // Years
  const yearMatch = c.match(/\b(19\d{2}|20\d{2})\b/);
  if (yearMatch && (p.includes('which year') || p.includes('year') || p.includes('when'))) {
    const ys = generateYearDistractors(yearMatch[1]);
    if (ys.length === 3) return ys;
  }

  // Python intro / history
  if (p.includes('inspiration behind the name') || p.includes("inspiration behind the name 'python'") || p.includes('name \'python\'')) {
    return uniqOptions([
      'The Pythonidae family of snakes',
      "Guido van Rossum's favorite reptile",
      'A reference to the Python programming language logo'
    ]).slice(0, 3);
  }
  if (p.includes('start of public releases') || (p.includes('public') && p.includes('releases'))) {
    const ys = yearMatch ? generateYearDistractors(yearMatch[1]) : ['1989', '1990', '1994'];
    return uniqOptions(ys).slice(0, 3);
  }
  if (p.includes('chosen as a first language') || (p.includes('first language') && p.includes('why'))) {
    return uniqOptions([
      'Because it enforces strict static typing',
      'Because it is the fastest language for CPU-bound code by default',
      'Because it requires semicolons and heavy boilerplate like Java'
    ]).slice(0, 3);
  }

  // Identifiers
  if (t.includes('identifier') || p.includes('identifier') || p.includes('variable name')) {
    if (p.includes('rejects') || p.includes('invalid') || p.includes('not allowed')) {
      return uniqOptions([
        'It starts with a digit',
        'It contains a whitespace character',
        'It uses a reserved keyword'
      ]).slice(0, 3);
    }
    // Handle underscores even when written as `_` in backticks
    const talksAboutUnderscore = (p.includes('_') && p.includes('starts with')) || p.includes('underscore');
    if (talksAboutUnderscore) {
      return uniqOptions([
        'It makes the variable read-only at runtime',
        'It forces the variable to become global automatically',
        'It makes Python treat it as a reserved keyword'
      ]).slice(0, 3);
    }
  }

  // Reserved words / keywords
  if (t.includes('reserved') || p.includes('reserved word') || p.includes('keyword')) {
    if (p.includes("can't") || p.includes('cannot') || p.includes("can't we")) {
      return uniqOptions([
        'Because Python will automatically rename it at runtime',
        'Because keywords are only allowed inside strings',
        'Because keywords are only valid in comments'
      ]).slice(0, 3);
    }
    if (p.includes('not lowercase')) {
      // distractors must be lowercase keywords (so only one correct answer like True/False/None)
      return uniqOptions(['and', 'class', 'return']).slice(0, 3);
    }
  }

  // Number literal prefixes
  if (p.includes('prefix') && (p.includes('binary') || cLower === '0b' || cLower === '0b' || cLower.includes('0b'))) {
    return uniqOptions(['0x', '0o', '0d']).slice(0, 3);
  }
  if (p.includes('prefix') && (p.includes('hex') || cLower === '0x' || cLower.includes('0x'))) {
    return uniqOptions(['0b', '0o', '0d']).slice(0, 3);
  }
  if (p.includes('prefix') && (p.includes('octal') || cLower === '0o' || cLower.includes('0o'))) {
    return uniqOptions(['0b', '0x', '0d']).slice(0, 3);
  }

  // Type casting common traps
  if (t.includes('type casting') || p.includes('type casting') || p.includes('int(') || p.includes('float(') || p.includes('str(')) {
    if (p.includes("int('10.5'") || (p.includes('int(') && p.includes("'"))) {
      return uniqOptions([
        'It raises a ValueError',
        'It returns 11 by rounding',
        'It returns 10.5 as a float'
      ]).slice(0, 3);
    }
  }

  // If we can mine content a bit, use it to craft 1-2 distractors
  const mined = [];
  const s = String(content || '').trim();
  if (s && s.length > 20) {
    if (s.toLowerCase().includes('indent') && !cLower.includes('indent')) mined.push('Because Python uses indentation to define blocks');
    if (s.toLowerCase().includes('readable') && !cLower.includes('readable')) mined.push('Because Python emphasizes readability');
    if (s.toLowerCase().includes('dynamic') && !cLower.includes('dynamic')) mined.push('Because Python uses dynamic typing');
  }

  // Last-resort fallback: keep distractors same "shape" as the correct answer.
  // Avoid repeating the same generic sentences across unrelated questions.
  if (/^\d+$/.test(c)) {
    const n = parseInt(c, 10);
    if (Number.isFinite(n)) return uniqOptions([String(n - 1), String(n + 1), String(n + 2)]).slice(0, 3);
  }

  if (!c.includes(' ') && isValidIdentifierName(c)) {
    return identifierDistractors(c, { preferValid: true });
  }

  const fallbackSentences = [
    'It is a built-in keyword in Python',
    'It changes how indentation works in Python',
    'It is required only when using classes'
  ];

  return uniqOptions([...mined, ...fallbackSentences]).slice(0, 3);
}

function isTemplateQuizQuestionPrompt(prompt) {
  const p = String(prompt || '').toLowerCase();
  return (
    p.includes('which statement best describes') ||
    p.startsWith('true or false:') ||
    p.includes('practical use-case') ||
    p.includes('question about')
  );
}

function isTemplateInterviewPrompt(prompt) {
  const p = String(prompt || '').toLowerCase();
  return (
    p.startsWith('explain ') && p.includes('in your own words') ||
    p.includes('short hands-on example') ||
    p.includes('common pitfalls')
  );
}

function buildMCQ({ prompt, correct, distractors, explanation }) {
  const opts = uniqOptions([correct, ...(distractors || [])]).slice(0, 4);
  const seed = `${prompt}||${correct}`;
  const shuffled = shuffleWithSeed(opts, seed);
  const answerIndex = shuffled.findIndex(o => String(o).trim().toLowerCase() === String(correct).trim().toLowerCase());
  return {
    prompt,
    options: shuffled,
    answerIndex: answerIndex === -1 ? 0 : answerIndex,
    explanation: explanation || ''
  };
}

function buildShortAnswer({ prompt, expectedAnswer, explanation }) {
  return {
    prompt: String(prompt || '').trim(),
    expectedAnswer: String(expectedAnswer || '').trim(),
    explanation: String(explanation || '').trim()
  };
}

function rewritePromptToDirect(prompt, expectedAnswer) {
  const p = String(prompt || '').trim();
  const a = String(expectedAnswer || '').trim();
  if (!p) return p;

  const lower = p.toLowerCase();
  if (lower.startsWith('which of the following')) {
    if (lower.includes('correct example')) {
      const tail = p.replace(/^Which of the following is a correct example of\s*/i, '').replace(/\?$/, '');
      return `Write one correct example of ${tail}.`;
    }
    if (lower.includes('can be used as a dictionary key')) {
      return 'Give one example of a valid dictionary key in Python.';
    }
    if (lower.includes('is hashable') && lower.includes('dictionary key')) {
      return 'Give one example of a hashable object that can be used as a dictionary key.';
    }
    if (lower.includes('identifier') && lower.includes('reserved word')) {
      return 'Name one identifier that is invalid because it is a reserved word.';
    }
    if (lower.includes('keyword') && lower.includes('not lowercase')) {
      return 'Name one Python keyword that is not lowercase.';
    }
    if (lower.includes('conversion') && lower.includes('typeerror')) {
      return 'Give one example of a type conversion that raises `TypeError` in Python.';
    }
    if (lower.includes('true about') && lower.includes('find()')) {
      return 'State one true fact about the `find()` method.';
    }
    if (lower.includes('starts with')) {
      const m = p.match(/starts with\s*'([^']+)'/i);
      if (m) return `Give one example of a string that starts with '${m[1]}'.`;
      return 'Give one example of a string that matches the stated condition.';
    }
    if (a) {
      return `Provide the correct answer: ${p.replace(/^Which of the following\s*/i, '').replace(/\?$/, '')}.`;
    }
    return p.replace(/^Which of the following\s*/i, '').replace(/\?$/, '?');
  }

  if (lower.startsWith('which expression')) {
    return p.replace(/^Which expression\s*/i, 'Write the expression that ').replace(/\?$/, '.');
  }
  if (lower.startsWith('which method type')) {
    return p.replace(/^Which method type\s*/i, 'Name the method type that ').replace(/\?$/, '.');
  }
  if (lower.startsWith('which methods')) {
    return p.replace(/^Which methods\s*/i, 'Name the methods that ').replace(/\?$/, '.');
  }
  if (lower.startsWith('which method')) {
    return p.replace(/^Which method\s*/i, 'Name the method that ').replace(/\?$/, '.');
  }
  if (lower.startsWith('which operation')) {
    return p.replace(/^Which operation\s*/i, 'Write the operation that ').replace(/\?$/, '.');
  }
  if (lower.startsWith('which check')) {
    return p.replace(/^Which check\s*/i, 'What is an appropriate check ').replace(/\?$/, '?');
  }
  if (lower.startsWith('which statement about')) {
    return p.replace(/^Which statement about\s*/i, 'State one correct statement about ').replace(/\?$/, '.');
  }

  return p;
}

function quizToShortAnswer(quiz) {
  if (!quiz || !Array.isArray(quiz.questions)) return quiz;

  const questions = quiz.questions.map((q) => {
    const prompt = String(q?.prompt || '').trim();
    const explanation = String(q?.explanation || '').trim();

    // Already short-answer style
    if (typeof q?.expectedAnswer === 'string' && q.expectedAnswer.trim()) {
      const expectedAnswer = q.expectedAnswer.trim();
      return { prompt: rewritePromptToDirect(prompt, expectedAnswer), expectedAnswer, explanation };
    }

    // Convert MCQ -> short-answer using the correct option
    let expectedAnswer = '';
    if (Array.isArray(q?.options) && q.options.length) {
      const ai = Number.isInteger(q?.answerIndex) ? q.answerIndex : 0;
      expectedAnswer = String(q.options[ai] ?? q.options[0] ?? '').trim();
    }
    if (!expectedAnswer) expectedAnswer = String(q?.correct || '').trim();

    return {
      prompt: rewritePromptToDirect(prompt, expectedAnswer),
      expectedAnswer,
      explanation
    };
  });

  return {
    title: quiz.title,
    questions
  };
}

function looksDummyOrTemplate(text) {
  const t = String(text || '').toLowerCase().trim();
  if (!t) return true;
  return (
    t.includes('a related but different concept') ||
    t.includes('a low-level implementation detail') ||
    t.includes('an unrelated tool or command') ||
    t.includes('a related but weaker statement') ||
    t.includes('a concept related to') ||
    t.includes('an unrelated option') ||
    t.includes('a common mistake about') ||
    t.includes('a fact that sounds correct') ||
    t.includes('a detail from another topic') ||
    t.includes('which statement best describes') ||
    t.startsWith('true or false:') ||
    t.includes('practical use-case') ||
    t.includes('question about')
  );
}

function ensureThreeShortAnswerQuestions(quiz, title, content) {
  if (!quiz || !Array.isArray(quiz.questions)) return quiz;

  const cleaned = quiz.questions
    .map(q => ({
      prompt: String(q?.prompt || '').trim(),
      expectedAnswer: String(q?.expectedAnswer || '').trim(),
      explanation: String(q?.explanation || '').trim()
    }))
    .filter(q => q.prompt && q.expectedAnswer)
    .filter(q => !looksDummyOrTemplate(q.prompt) && !looksDummyOrTemplate(q.expectedAnswer));

  const out = [...cleaned];
  const baseAnswer = String(content || '').trim() || `Core idea of ${title}`;

  const fallbacks = [
    buildShortAnswer({
      prompt: `In one sentence, define: ${title}.`,
      expectedAnswer: baseAnswer,
      explanation: ''
    }),
    buildShortAnswer({
      prompt: `State one key rule/property of: ${title}.`,
      expectedAnswer: baseAnswer,
      explanation: ''
    }),
    buildShortAnswer({
      prompt: `Write one small example related to: ${title}.`,
      expectedAnswer: baseAnswer,
      explanation: ''
    })
  ];

  for (const f of fallbacks) {
    if (out.length >= 3) break;
    out.push(f);
  }

  return { title: quiz.title, questions: out.slice(0, 3) };
}

function generateDictionaryQuiz(title, content) {
  const t = String(title || '').toLowerCase();

  // copy() + nested + shallow copy
  if (t.includes('copy') && (t.includes('nested') || t.includes('shallow'))) {
    return [
      buildShortAnswer({
        prompt: 'What kind of copy does `dict.copy()` create when values include nested mutable objects?',
        expectedAnswer: 'A shallow copy (top-level dict is new, nested mutable objects are still shared by reference).',
        explanation: 'Only the outer dict is copied; nested objects keep the same identity.'
      }),
      buildShortAnswer({
        prompt: 'If `d2 = d1.copy()` and `d1["a"]` is a nested dict, what happens after `d2["a"]["x"] = 99`?',
        expectedAnswer: 'It also affects `d1` because the nested dict is shared in a shallow copy.',
        explanation: 'Shallow copy shares nested object references.'
      }),
      buildShortAnswer({
        prompt: 'How do you deep-copy a nested dictionary using the standard library?',
        expectedAnswer: '`copy.deepcopy(d)`',
        explanation: '`deepcopy` recursively copies nested objects.'
      })
    ];
  }

  // keys: hashable
  if (t.includes('keys') && t.includes('hash')) {
    return [
      buildShortAnswer({
        prompt: 'What requirement must a dictionary key satisfy in Python?',
        expectedAnswer: 'It must be hashable (i.e., have a stable hash and be effectively immutable).',
        explanation: 'Hash stability is required for correct key lookups.'
      }),
      buildShortAnswer({
        prompt: 'Why can’t a list be used as a dictionary key?',
        expectedAnswer: 'Because lists are mutable and therefore not hashable.',
        explanation: 'Mutable objects do not have a stable hash.'
      }),
      buildShortAnswer({
        prompt: 'How can you test whether an object is hashable?',
        expectedAnswer: 'Call `hash(obj)`; if it raises `TypeError`, it is not hashable.',
        explanation: 'Hashable objects implement `__hash__`.'
      })
    ];
  }

  // get vs []
  if (t.includes('get') || t.includes('access')) {
    return [
      buildShortAnswer({
        prompt: 'What happens when you access a missing key with `d[key]`?',
        expectedAnswer: 'It raises a `KeyError`.',
        explanation: '`d[key]` requires the key to exist.'
      }),
      buildShortAnswer({
        prompt: 'How do you safely return a default value for a missing key?',
        expectedAnswer: 'Use `d.get(key, default)`.',
        explanation: '`get` avoids `KeyError`.'
      }),
      buildShortAnswer({
        prompt: 'What is a pitfall of using `d[key] or default` as a fallback?',
        expectedAnswer: 'It returns the default even when the key exists if the value is falsy (e.g., 0, "", False).',
        explanation: 'It mixes “missing key” with “present but falsy value”.'
      })
    ];
  }

  // setdefault
  if (t.includes('setdefault')) {
    return [
      buildShortAnswer({
        prompt: 'What does `d.setdefault(key, default)` do when `key` is missing?',
        expectedAnswer: 'It inserts `key` with `default` and returns the inserted value.',
        explanation: 'It is a “read-or-insert” helper.'
      }),
      buildShortAnswer({
        prompt: 'Does `setdefault` overwrite an existing value for the key?',
        expectedAnswer: 'No. If the key exists, it returns the existing value and does not overwrite it.',
        explanation: 'Only missing keys get inserted.'
      }),
      buildShortAnswer({
        prompt: 'Give one practical use-case for `setdefault`.',
        expectedAnswer: 'Grouping values by key (e.g., building a list per key without repeated `if key not in d`).',
        explanation: 'It reduces boilerplate around initializing container values.'
      })
    ];
  }

  // generic dictionary fallback
  return [
    buildShortAnswer({
      prompt: 'What is the average-case time complexity of dictionary key lookup, and why?',
      expectedAnswer: 'Typically $O(1)$ on average, because dictionaries use hashing (hash table).',
      explanation: 'Hash tables provide fast average-case lookups.'
    }),
    buildShortAnswer({
      prompt: 'Which method returns an iterable of `(key, value)` pairs from a dictionary `d`?',
      expectedAnswer: '`d.items()`',
      explanation: '`items()` yields key-value pairs.'
    }),
    buildShortAnswer({
      prompt: 'What is the difference between `d.clear()` and `del d`?',
      expectedAnswer: '`clear()` removes all items but keeps the dict object; `del d` deletes the name binding.',
      explanation: '`del` affects the variable name; `clear` mutates the dictionary in-place.'
    })
  ];
}

function generateTupleQuiz(title, content) {
  const t = String(title || '').toLowerCase();

  if (t.includes('access') || t.includes('indexing') || t.includes('slicing')) {
    return [
      buildMCQ({
        prompt: 'What does tuple indexing like `t[0]` return?',
        correct: 'The element at index 0 (the first element)',
        distractors: ['The tuple length', 'The last element only', 'A sub-tuple containing all elements'],
        explanation: 'Indexing returns the element at that position.'
      }),
      buildMCQ({
        prompt: 'What does negative indexing like `t[-1]` return for a tuple?',
        correct: 'The last element of the tuple',
        distractors: ['An error in Python', 'The first element', 'A sorted copy of the tuple'],
        explanation: 'Negative indices count from the end.'
      }),
      buildMCQ({
        prompt: 'What is the result type of slicing a tuple like `t[1:3]`?',
        correct: 'A new tuple containing the sliced elements',
        distractors: ['A list', 'A generator', 'A view into the original tuple'],
        explanation: 'Tuple slicing returns a new tuple (not a view).' 
      })
    ];
  }

  if (t.includes('immutability')) {
    return [
      buildMCQ({
        prompt: 'What happens if you run `t[0] = 99` on a tuple `t`?',
        correct: 'It raises a `TypeError` because tuples do not support item assignment',
        distractors: ['It updates the tuple in-place', 'It creates a new tuple automatically', 'It raises an `IndexError`'],
        explanation: 'Tuples are immutable sequences.'
      }),
      buildMCQ({
        prompt: 'Can a tuple contain a mutable object like a list?',
        correct: 'Yes, and the mutable object can still be mutated',
        distractors: ['No, tuples can only contain immutable types', 'Yes, but the list becomes immutable inside a tuple', 'No, Python raises a `TypeError` at creation time'],
        explanation: 'Immutability applies to the tuple container (references), not to the mutability of referenced objects.'
      }),
      buildMCQ({
        prompt: 'Which statement is correct about tuple immutability?',
        correct: 'You cannot reassign tuple elements, but you can create a new tuple with different elements',
        distractors: ['You cannot iterate a tuple', 'You cannot store strings in a tuple', 'Tuples automatically deep-copy nested objects'],
        explanation: 'Tuples cannot be modified in-place, but you can build new tuples.'
      })
    ];
  }

  if (t.includes('operators') || t.includes('membership') || t.includes('comparison')) {
    return [
      buildMCQ({
        prompt: 'What does the `in` operator do for a tuple?',
        correct: 'Checks whether a value is present in the tuple',
        distractors: ['Checks whether an index exists', 'Adds a value to the tuple', 'Returns the index of the value'],
        explanation: '`x in t` performs membership testing.'
      }),
      buildMCQ({
        prompt: 'What does tuple concatenation `(1, 2) + (3, 4)` produce?',
        correct: '`(1, 2, 3, 4)`',
        distractors: ['`(1, 2, (3, 4))`', '`[1, 2, 3, 4]`', '`(3, 4, 1, 2)`'],
        explanation: '`+` concatenates tuples into a new tuple.'
      }),
      buildMCQ({
        prompt: 'How are tuples compared in Python (e.g., `(1,2) < (1,3)`) ?',
        correct: 'Lexicographically (element by element from the start)',
        distractors: ['By length only', 'By memory address', 'Tuples cannot be compared'],
        explanation: 'Sequence comparison is lexicographic.'
      })
    ];
  }

  if (t.includes('packing') || t.includes('unpacking') || t.includes('including *') || t.includes('including `*`')) {
    return [
      buildMCQ({
        prompt: 'What does tuple unpacking do in Python?',
        correct: 'Assigns elements from an iterable to multiple variables in one statement',
        distractors: [
          'Converts a tuple into a list automatically',
          'Sorts the tuple elements in-place',
          'Makes the tuple mutable'
        ],
        explanation: 'Unpacking maps positions in the iterable to variables, e.g., `a, b = (1, 2)`.'
      }),
      buildMCQ({
        prompt: 'What is the role of `*` in extended unpacking (e.g., `a, *rest = values`)?',
        correct: '`rest` receives the remaining items as a list',
        distractors: [
          '`rest` receives the remaining items as a tuple',
          '`*` forces values to be copied deeply',
          '`*` can only be used in function calls, not assignment'
        ],
        explanation: 'Extended unpacking collects leftovers into a list.'
      }),
      buildMCQ({
        prompt: 'Which statement about tuple unpacking is correct?',
        correct: 'The number of variables must match the number of items unless you use `*` extended unpacking',
        distractors: [
          'Unpacking works only for tuples, not lists',
          'Unpacking always ignores extra values automatically',
          'Unpacking changes the original iterable'
        ],
        explanation: 'Without `*`, counts must match; otherwise you get `ValueError`.'
      })
    ];
  }

  if (
    t.includes('useful function') ||
    t.includes('len') ||
    t.includes('count') ||
    (t.includes('index') && !t.includes('indexing')) ||
    t.includes('sorted') ||
    t.includes('min') ||
    t.includes('max')
  ) {
    return [
      buildMCQ({
        prompt: 'What does `len(t)` return for a tuple `t`?',
        correct: 'The number of elements in the tuple',
        distractors: ['The number of unique elements only', 'The memory size in bytes', 'The index of the last element'],
        explanation: '`len` returns the total element count.'
      }),
      buildMCQ({
        prompt: 'What does `t.count(x)` do for a tuple `t`?',
        correct: 'Returns how many times `x` occurs in `t`',
        distractors: ['Returns the index of `x`', 'Removes all occurrences of `x`', 'Counts only unique values'],
        explanation: '`count` counts occurrences.'
      }),
      buildMCQ({
        prompt: 'Which statement about `sorted(t)` is correct?',
        correct: 'It returns a new list containing the sorted items from the tuple',
        distractors: ['It sorts the tuple in-place', 'It returns a sorted tuple object', 'It works only for numeric tuples'],
        explanation: '`sorted` always returns a list, not a tuple.'
      })
    ];
  }

  if (t.includes('tuple comprehension') || t.includes('generator')) {
    return [
      buildMCQ({
        prompt: 'What does `(x*x for x in range(5))` create?',
        correct: 'A generator object',
        distractors: ['A tuple', 'A list', 'A set'],
        explanation: 'Parentheses with a comprehension-like form create a generator, not a tuple.'
      }),
      buildMCQ({
        prompt: 'How do you create a tuple from a generator expression?',
        correct: 'Wrap it with `tuple(...)`',
        distractors: ['Wrap it with `{...}`', 'Use `list(...)` and it becomes a tuple automatically', 'Use `.toTuple()`'],
        explanation: '`tuple(gen)` exhausts the generator and builds a tuple.'
      }),
      buildMCQ({
        prompt: 'What is a key benefit of using a generator expression?',
        correct: 'It can be more memory-efficient because it produces values lazily',
        distractors: ['It always runs faster than lists', 'It makes code statically typed', 'It automatically parallelizes loops'],
        explanation: 'Generators yield values on-demand.'
      })
    ];
  }

  if (t.includes('tuple vs list') || (t.includes('tuple') && t.includes('list'))) {
    return [
      buildMCQ({
        prompt: 'What is a key difference between a tuple and a list in Python?',
        correct: 'Tuples are immutable, lists are mutable',
        distractors: ['Tuples can hold only numbers', 'Lists are always faster than tuples', 'Tuples cannot be iterated'],
        explanation: 'Immutability is the main semantic difference.'
      }),
      buildMCQ({
        prompt: 'When is a tuple usually a better choice than a list?',
        correct: 'When the collection should not change (fixed record-like data)',
        distractors: ['When you need to append often', 'When you need to remove items frequently', 'When you need random writes'],
        explanation: 'Immutability helps express “fixed data”.'
      }),
      buildMCQ({
        prompt: 'Which of the following is hashable and can be used as a dictionary key (assuming elements are hashable)?',
        correct: 'A tuple',
        distractors: ['A list', 'A dictionary', 'A set'],
        explanation: 'Tuples can be hashable if they contain only hashable elements.'
      })
    ];
  }

  // Generic tuple fallback
  return [
    buildMCQ({
      prompt: 'Which statement about tuples is correct?',
      correct: 'Tuples preserve order and can contain mixed types',
      distractors: ['Tuples are unordered collections', 'Tuples can be modified in-place', 'Tuples require all elements to be the same type'],
      explanation: 'Tuples are ordered and can store heterogeneous values.'
    }),
    buildMCQ({
      prompt: 'How do you create a single-element tuple?',
      correct: 'Use a trailing comma, e.g., `(42,)`',
      distractors: ['Use `(42)`', 'Use `[42]`', 'Use `{42}`'],
      explanation: '`(42)` is just an int in parentheses; `(42,)` is a tuple.'
    }),
    buildMCQ({
      prompt: 'What does tuple indexing `t[0]` return?',
      correct: 'The first element of the tuple',
      distractors: ['The last element', 'The tuple length', 'A sub-tuple containing all elements'],
      explanation: 'Indexing returns the element at that position.'
    })
  ];
}

function generateSetQuiz(title, content) {
  const t = String(title || '').toLowerCase();

  if (t.includes('creation') || t.includes('empty set')) {
    return [
      buildMCQ({
        prompt: 'How do you create an empty set in Python?',
        correct: 'Use `set()`',
        distractors: ['Use `{}`', 'Use `[]`', 'Use `()`'],
        explanation: '`{}` creates an empty dict; `set()` creates an empty set.'
      }),
      buildMCQ({
        prompt: 'What is the type of `{}` in Python?',
        correct: 'dict',
        distractors: ['set', 'tuple', 'list'],
        explanation: 'Curly braces with no items default to a dictionary.'
      }),
      buildMCQ({
        prompt: 'What is a core property of a set?',
        correct: 'It stores unique elements (no duplicates)',
        distractors: ['It preserves duplicates and order', 'It stores key-value pairs', 'It allows indexing like lists'],
        explanation: 'Sets are collections of unique elements.'
      })
    ];
  }

  if (t.includes('add') && t.includes('update')) {
    return [
      buildMCQ({
        prompt: 'What does `s.add(x)` do?',
        correct: 'Adds a single element `x` to the set',
        distractors: ['Adds all elements of `x` if `x` is iterable', 'Returns a new set without modifying `s`', 'Removes `x` if present'],
        explanation: '`add` inserts one element.'
      }),
      buildMCQ({
        prompt: 'What does `s.update(iterable)` do?',
        correct: 'Adds each element from the iterable into the set',
        distractors: ['Adds the iterable itself as one element', 'Clears the set then adds elements', 'Updates only if elements are numeric'],
        explanation: '`update` merges elements from an iterable.'
      }),
      buildMCQ({
        prompt: 'Which call adds the characters of a string into a set?',
        correct: '`s.update("abc")`',
        distractors: ['`s.add("abc")`', '`s.append("abc")`', '`s.extend("abc")`'],
        explanation: '`update` iterates over the string and adds each char; `add` adds the whole string as one element.'
      })
    ];
  }

  if (t.includes('copy') || t.includes('pop') || t.includes('remove') || t.includes('discard') || t.includes('clear')) {
    return [
      buildMCQ({
        prompt: 'What does `s.copy()` return for a set `s`?',
        correct: 'A shallow copy (a new set object with the same elements)',
        distractors: [
          'A deep copy that recursively copies nested objects',
          'A reference to the same set object',
          'A sorted list of the set elements'
        ],
        explanation: '`copy()` creates a new set object; elements themselves are not deep-copied.'
      }),
      buildMCQ({
        prompt: 'What is the difference between `remove(x)` and `discard(x)` on a set?',
        correct: '`remove(x)` raises `KeyError` if `x` is missing; `discard(x)` does not',
        distractors: [
          '`discard(x)` raises `KeyError` if `x` is missing; `remove(x)` does not',
          'They both raise `IndexError` if missing',
          '`remove(x)` removes by index; `discard(x)` removes by value'
        ],
        explanation: 'Missing-element behavior is the key difference.'
      }),
      buildMCQ({
        prompt: 'What does `s.pop()` do for a set `s`?',
        correct: 'Removes and returns an arbitrary element (not by index)',
        distractors: [
          'Removes and returns the last inserted element',
          'Returns an element without removing it',
          'Sorts the set and returns the smallest element'
        ],
        explanation: 'Sets are unordered; `pop()` removes some element.'
      })
    ];
  }

  if (t.includes('union') || t.includes('intersection') || t.includes('difference') || t.includes('mathematical')) {
    return [
      buildMCQ({
        prompt: 'What does `a | b` represent for sets `a` and `b`?',
        correct: 'Union (all elements in either set)',
        distractors: ['Intersection', 'Difference', 'Symmetric difference'],
        explanation: '`|` is union.'
      }),
      buildMCQ({
        prompt: 'What does `a & b` represent for sets `a` and `b`?',
        correct: 'Intersection (elements common to both)',
        distractors: ['Union', 'Difference', 'Complement'],
        explanation: '`&` is intersection.'
      }),
      buildMCQ({
        prompt: 'Which operation returns elements in `a` but not in `b`?',
        correct: '`a - b` (difference)',
        distractors: ['`a | b`', '`a & b`', '`a ^ b`'],
        explanation: '`-` is set difference.'
      })
    ];
  }

  if (t.includes('membership') || t.includes('no indexing')) {
    return [
      buildMCQ({
        prompt: 'How do you test membership in a set?',
        correct: 'Use `x in s`',
        distractors: ['Use `s[x]`', 'Use `s.get(x)`', 'Use `s.index(x)`'],
        explanation: 'Sets support membership testing with `in`.'
      }),
      buildMCQ({
        prompt: 'Why don’t sets support indexing like `s[0]`?',
        correct: 'Sets are unordered collections',
        distractors: ['Sets are immutable', 'Sets can only store numbers', 'Indexing would be too fast'],
        explanation: 'No stable order means no meaningful index.'
      }),
      buildMCQ({
        prompt: 'Which statement about set iteration is correct?',
        correct: 'Iteration order is not guaranteed to be predictable across runs',
        distractors: ['Iteration is always sorted', 'Iteration is insertion-ordered for all Python versions', 'Iteration returns indices'],
        explanation: 'Set order is not defined like lists/tuples.'
      })
    ];
  }

  if (t.includes('comprehension')) {
    return [
      buildMCQ({
        prompt: 'What does a set comprehension like `{x*x for x in range(5)}` produce?',
        correct: 'A set of unique computed values',
        distractors: ['A list', 'A tuple', 'A generator object'],
        explanation: 'Curly braces with an expression-and-for form produce a set comprehension.'
      }),
      buildMCQ({
        prompt: 'Why might a set comprehension produce fewer elements than the input iterable length?',
        correct: 'Because duplicate results are automatically removed',
        distractors: ['Because sets cap size at 10 elements', 'Because comprehensions skip odd numbers by default', 'Because sets preserve only the first 3 items'],
        explanation: 'Sets store unique elements only.'
      }),
      buildMCQ({
        prompt: 'Which syntax creates a dictionary comprehension (not a set comprehension)?',
        correct: '`{k: v for k, v in pairs}`',
        distractors: ['`{x for x in items}`', '`(x for x in items)`', '`[x for x in items]`'],
        explanation: 'A dict comprehension includes a `key: value` pair.'
      })
    ];
  }

  // Generic set fallback
  return [
    buildShortAnswer({
      prompt: 'What does `s.pop()` do for a set `s`?',
      expectedAnswer: 'Removes and returns an arbitrary element (not by index).',
      explanation: 'Sets are unordered.'
    }),
    buildShortAnswer({
      prompt: 'What is the difference between `remove(x)` and `discard(x)` for a set?',
      expectedAnswer: '`remove(x)` raises `KeyError` if missing; `discard(x)` does not.',
      explanation: 'Missing-element behavior is the key difference.'
    }),
    buildShortAnswer({
      prompt: 'Which data structure is best for eliminating duplicates from a list?',
      expectedAnswer: 'A set.',
      explanation: 'Sets store unique elements.'
    })
  ];
}

function generateListQuiz(title, content) {
  const t = String(title || '').toLowerCase();

  if (t.includes('creation') || t.includes('common ways')) {
    return [
      buildMCQ({
        prompt: 'Which expression creates a list in Python?',
        correct: 'Using square brackets, e.g., `[1, 2, 3]`',
        distractors: ['Using curly braces, e.g., `{1, 2, 3}`', 'Using parentheses, e.g., `(1, 2, 3)`', 'Using `"[1,2,3]"` (a string)'],
        explanation: 'Square brackets create a list literal; `{}` creates a set/dict depending on content, `()` creates a tuple.'
      }),
      buildMCQ({
        prompt: 'What does `list("abc")` return?',
        correct: "`['a', 'b', 'c']`",
        distractors: ['`["abc"]`', '`{"a","b","c"}`', '`("a","b","c")`'],
        explanation: '`list(iterable)` iterates over the iterable and collects elements into a new list.'
      }),
      buildMCQ({
        prompt: 'Which is a common way to create a list of numbers 0..4?',
        correct: '`list(range(5))`',
        distractors: ['`range([5])`', '`[range(5)]`', '`range(0, 4)`'],
        explanation: '`range(5)` produces 0..4; wrapping with `list(...)` materializes it.'
      })
    ];
  }

  if (t.includes('access') || t.includes('indexing') || t.includes('slicing')) {
    return [
      buildMCQ({
        prompt: 'What does negative indexing like `lst[-1]` return?',
        correct: 'The last element of the list',
        distractors: ['An error in Python', 'The first element', 'A sub-list of all elements'],
        explanation: 'Negative indices count from the end.'
      }),
      buildMCQ({
        prompt: 'What does slicing `lst[1:3]` return?',
        correct: 'A new list containing elements at indices 1 and 2',
        distractors: ['A single element at index 3', 'A view into the same list (no copy)', 'A tuple of elements'],
        explanation: 'Slicing returns a new list; stop index is exclusive.'
      }),
      buildMCQ({
        prompt: 'What happens if you access an out-of-range index like `lst[100]` on a shorter list?',
        correct: 'It raises an `IndexError`',
        distractors: ['It returns `None`', 'It returns the last element', 'It automatically extends the list with `None`'],
        explanation: 'Indexing past the end raises `IndexError`.'
      })
    ];
  }

  if (t.includes('mutability') || t.includes('editing')) {
    return [
      buildShortAnswer({
        prompt: 'What does it mean that lists are mutable?',
        expectedAnswer: 'You can change a list in-place (e.g., assign to indices, append, remove).',
        explanation: 'Mutability means the object can be modified after creation.'
      }),
      buildMCQ({
        prompt: 'Which operation replaces the element at index 0 with 99?',
        correct: '`lst[0] = 99`',
        distractors: ['`lst(0) = 99`', '`lst.add(99)`', '`lst.replace(0,99)`'],
        explanation: 'Lists support assignment by index.'
      }),
      buildMCQ({
        prompt: 'If `a = [1,2]` and you do `b = a`, then you run `b.append(3)`. What is `a` now?',
        correct: '`[1, 2, 3]` because `a` and `b` refer to the same list',
        distractors: ['`[1, 2]` (no change)', '`[1, 2, 3]` but only in `b`', '`[1, 2, [3]]`'],
        explanation: 'Assignment copies the reference; both names point to the same list.'
      })
    ];
  }

  if (t.includes('traversal') || t.includes('while') || t.includes('for')) {
    return [
      buildMCQ({
        prompt: 'Which loop pattern gives you both index and value while iterating a list?',
        correct: '`for i, x in enumerate(lst): ...`',
        distractors: ['`for i in lst:`', '`for x in range(lst):`', '`for (i) in lst.values():`'],
        explanation: '`enumerate` yields `(index, value)` pairs.'
      }),
      buildMCQ({
        prompt: 'In a `while` loop over list indices, which update is essential to avoid an infinite loop?',
        correct: 'Increment the index each iteration (e.g., `i += 1`)',
        distractors: ['Call `len(lst)` repeatedly', 'Convert the list to a tuple', 'Sort the list first'],
        explanation: 'A `while` loop must update its loop variable.'
      }),
      buildMCQ({
        prompt: 'Which statement about iterating a list is correct?',
        correct: '`for x in lst` iterates over elements, not indices',
        distractors: ['`for x in lst` iterates over indices', '`for x in lst` works only for numeric lists', '`for x in lst` modifies the list automatically'],
        explanation: 'Direct iteration yields each element.'
      })
    ];
  }

  if (t.includes('info methods') || t.includes('len') || t.includes('count') || t.includes('index')) {
    return [
      buildMCQ({
        prompt: 'What does `len(lst)` return for a list `lst`?',
        correct: 'The number of elements in the list',
        distractors: ['The number of unique elements only', 'The memory size in bytes', 'The index of the last element'],
        explanation: '`len` returns the total element count.'
      }),
      buildMCQ({
        prompt: 'What does `lst.count(x)` do?',
        correct: 'Returns how many times `x` occurs in the list',
        distractors: ['Returns the index of `x`', 'Removes all occurrences of `x`', 'Counts only unique values'],
        explanation: '`count` counts occurrences.'
      }),
      buildMCQ({
        prompt: 'What happens if you call `lst.index(x)` when `x` is not present?',
        correct: 'It raises a `ValueError`',
        distractors: ['It returns `-1`', 'It returns `None`', 'It raises a `KeyError`'],
        explanation: '`index` raises `ValueError` if the value is not found.'
      })
    ];
  }

  if (t.includes('append') && t.includes('extend')) {
    return [
      buildMCQ({
        prompt: 'What does `lst.append(x)` do?',
        correct: 'Adds `x` as a single element at the end of the list',
        distractors: ['Adds each element of `x` if `x` is iterable', 'Inserts `x` at the start', 'Returns a new list without modifying the original'],
        explanation: '`append` adds one element.'
      }),
      buildMCQ({
        prompt: 'What does `lst.extend(iterable)` do?',
        correct: 'Adds each element from the iterable to the end of the list',
        distractors: ['Adds the iterable itself as one element', 'Clears list then adds items', 'Works only with tuples'],
        explanation: '`extend` concatenates elements from an iterable.'
      }),
      buildMCQ({
        prompt: 'If `lst = [1,2]`, what is the result of `lst.append([3,4])`?',
        correct: '`[1, 2, [3, 4]]`',
        distractors: ['`[1, 2, 3, 4]`', '`[3, 4, 1, 2]`', '`[1, 2]` (no change)'],
        explanation: 'Appending a list inserts it as a nested list element.'
      })
    ];
  }

  if (t.includes('insert') || t.includes('grow list')) {
    return [
      buildMCQ({
        prompt: 'What does `lst.insert(i, x)` do?',
        correct: 'Inserts `x` at position `i`, shifting later elements to the right',
        distractors: ['Replaces the element at index `i` without shifting', 'Appends `x` only if `i` is valid', 'Returns a new list and does not modify `lst`'],
        explanation: '`insert` mutates the list and shifts elements.'
      }),
      buildMCQ({
        prompt: 'Which operation is typically most efficient for adding one element to the end of a list?',
        correct: '`lst.append(x)`',
        distractors: ['`lst.insert(0, x)`', '`lst = [x] + lst`', '`lst.sort(); lst.append(x)`'],
        explanation: 'Appending at the end is generally efficient for Python lists.'
      }),
      buildMCQ({
        prompt: 'If you want to add multiple elements from another iterable, which is the idiomatic method?',
        correct: '`lst.extend(iterable)`',
        distractors: ['`lst.append(iterable)`', '`lst.add(iterable)`', '`lst.push(iterable)`'],
        explanation: '`extend` concatenates elements from an iterable.'
      })
    ];
  }

  if (t.includes('shrink') || t.includes('remove') || t.includes('pop') || t.includes('clear')) {
    return [
      buildMCQ({
        prompt: 'What is the difference between `remove(x)` and `pop(i)` for lists?',
        correct: '`remove(x)` deletes by value; `pop(i)` deletes by index and returns the removed element',
        distractors: ['Both delete by index', '`pop(i)` deletes by value', '`remove(x)` returns the removed element'],
        explanation: '`remove` targets a value; `pop` targets an index and returns the element.'
      }),
      buildMCQ({
        prompt: 'What happens if you call `lst.remove(x)` when `x` is not in the list?',
        correct: 'It raises a `ValueError`',
        distractors: ['It raises a `KeyError`', 'It returns `False`', 'It silently does nothing'],
        explanation: 'Missing values cause `ValueError` for `remove`.'
      }),
      buildMCQ({
        prompt: 'What does `lst.clear()` do?',
        correct: 'Removes all elements from the list in-place',
        distractors: ['Deletes the variable name', 'Returns a new empty list without modifying the original', 'Converts the list into a tuple'],
        explanation: '`clear` empties the list object.'
      })
    ];
  }

  if (t.includes('ordering') || t.includes('reverse') || t.includes('sort')) {
    return [
      buildMCQ({
        prompt: 'What is the difference between `sorted(lst)` and `lst.sort()`?',
        correct: '`sorted(lst)` returns a new list; `lst.sort()` sorts in-place and returns `None`',
        distractors: ['Both return a new sorted list', '`lst.sort()` returns the sorted list', '`sorted(lst)` sorts in-place'],
        explanation: '`sorted` is a function that returns a new list; `.sort()` mutates the list.'
      }),
      buildMCQ({
        prompt: 'What does `lst.reverse()` do?',
        correct: 'Reverses the list in-place',
        distractors: ['Returns a new reversed list without modifying `lst`', 'Sorts the list descending', 'Reverses only strings inside the list'],
        explanation: '`reverse()` mutates the list order.'
      }),
      buildMCQ({
        prompt: 'Which expression returns a reversed iterator over a list?',
        correct: '`reversed(lst)`',
        distractors: ['`lst.reversed()`', '`reverse(lst)`', '`lst[::-1]` (this returns a new list, not an iterator)'],
        explanation: '`reversed` returns an iterator; `lst[::-1]` produces a new list.'
      })
    ];
  }

  if (t.includes('alias') || t.includes('clone') || t.includes('copy')) {
    return [
      buildMCQ({
        prompt: 'Which expression creates a shallow copy of a list `a`?',
        correct: '`a.copy()`',
        distractors: ['`b = a`', '`copy.deepcopy(a)` (deep copy)', '`a = a`'],
        explanation: '`a.copy()` and `a[:]` create a new list object (shallow copy).' 
      }),
      buildMCQ({
        prompt: 'If `a = [[1],[2]]` and `b = a.copy()`, what happens when you do `b[0].append(99)`?',
        correct: 'It also affects `a` because nested lists are shared in a shallow copy',
        distractors: ['It affects only `b` because `.copy()` deep-copies', 'It raises `TypeError` because `b` is read-only', 'It replaces `b[0]` with a new list automatically'],
        explanation: 'Shallow copy copies the outer list; nested objects are still shared.'
      }),
      buildMCQ({
        prompt: 'Which approach is appropriate for deep-copying a nested list?',
        correct: '`copy.deepcopy(a)`',
        distractors: ['`a.copy()`', '`list(a)`', '`a[:]`'],
        explanation: '`copy.deepcopy` recursively copies nested objects.'
      })
    ];
  }

  if (t.includes('operators') || t.includes('comparisons') || t.includes('membership')) {
    return [
      buildMCQ({
        prompt: 'What does the `in` operator do for a list?',
        correct: 'Checks whether a value is present in the list',
        distractors: ['Checks whether an index exists', 'Adds a value to the list', 'Returns the index of the value'],
        explanation: '`x in lst` performs membership testing.'
      }),
      buildMCQ({
        prompt: 'What does list concatenation `[1,2] + [3,4]` produce?',
        correct: '`[1, 2, 3, 4]`',
        distractors: ['`[1, 2, [3, 4]]`', '`[3, 4, 1, 2]`', '`[1, 2]` (no change)'],
        explanation: '`+` concatenates lists to a new list.'
      }),
      buildMCQ({
        prompt: 'How are lists compared in Python (e.g., `[1,2] < [1,3]`)?',
        correct: 'Lexicographically (element by element from the start)',
        distractors: ['By length only', 'By memory address', 'They cannot be compared in Python'],
        explanation: 'Sequence comparison is lexicographic.'
      })
    ];
  }

  if (t.includes('nested') || t.includes('matrix')) {
    return [
      buildMCQ({
        prompt: 'How do you access the element in row `i`, column `j` of a nested list (matrix) `m`?',
        correct: '`m[i][j]`',
        distractors: ['`m(i,j)`', '`m[i,j]`', '`m[j][i]` always works'],
        explanation: 'Nested lists are indexed step-by-step.'
      }),
      buildMCQ({
        prompt: 'What is a common pitfall of creating a matrix like `m = [[0]*3]*2`?',
        correct: 'Both rows reference the same inner list; changing one row changes the other',
        distractors: ['It creates a tuple, not a list', 'It creates independent rows automatically', 'It raises a `TypeError`'],
        explanation: 'List multiplication can duplicate references for nested lists.'
      }),
      buildMCQ({
        prompt: 'Which is a safer way to create a 2x3 zero matrix?',
        correct: '`[[0 for _ in range(3)] for _ in range(2)]`',
        distractors: ['`[[0]*3]*2`', '`[0]*6`', '`{0 for _ in range(6)}`'],
        explanation: 'A nested comprehension creates distinct inner lists.'
      })
    ];
  }

  if (t.includes('comprehension')) {
    return [
      buildMCQ({
        prompt: 'What does a list comprehension like `[x*x for x in range(5)]` produce?',
        correct: 'A new list of computed values',
        distractors: ['A generator object', 'A tuple', 'A set'],
        explanation: 'Square brackets with a comprehension produce a list.'
      }),
      buildMCQ({
        prompt: 'How do you add a condition in a list comprehension?',
        correct: 'Place an `if` at the end, e.g., `[x for x in items if x > 0]`',
        distractors: ['Use `if` before the `for`', 'Use `where` keyword', 'Conditions are not allowed in comprehensions'],
        explanation: 'Filtering uses a trailing `if`.'
      }),
      buildMCQ({
        prompt: 'Which expression produces a generator instead of a list?',
        correct: '`(x for x in items)`',
        distractors: ['`[x for x in items]`', '`{x for x in items}`', '`{k: v for k, v in pairs}`'],
        explanation: 'Parentheses produce a generator expression.'
      })
    ];
  }

  if (t.includes('unique vowels') || (t.includes('program') && t.includes('vowel'))) {
    return [
      buildMCQ({
        prompt: 'Which data structure is most suitable for tracking unique vowels seen in a word?',
        correct: 'A set',
        distractors: ['A tuple', 'A string', 'A dict with numeric keys'],
        explanation: 'Sets naturally store unique elements.'
      }),
      buildMCQ({
        prompt: 'Which expression converts a string to a list of characters?',
        correct: '`list(word)`',
        distractors: ['`word.list()`', '`chars(word)`', '`[word]`'],
        explanation: '`list(iterable)` collects elements from the iterable.'
      }),
      buildMCQ({
        prompt: 'Which check is appropriate when counting vowels in a string?',
        correct: '`ch.lower() in "aeiou"`',
        distractors: ['`ch in ["aeiou"]`', '`ch == "aeiou"`', '`"aeiou" in ch`'],
        explanation: 'Lowercasing avoids missing uppercase vowels.'
      })
    ];
  }

  // Generic list fallback
  return [
    buildShortAnswer({
      prompt: 'What is a list in Python?',
      expectedAnswer: 'A mutable, ordered sequence type.',
      explanation: 'Lists can be modified in-place.'
    }),
    buildShortAnswer({
      prompt: 'What does slicing like `lst[1:3]` return?',
      expectedAnswer: 'A new list containing elements at indices 1 and 2 (stop index is exclusive).',
      explanation: 'Slicing returns a new list.'
    }),
    buildShortAnswer({
      prompt: 'How do you replace the first element of a list `lst` with 99?',
      expectedAnswer: '`lst[0] = 99`',
      explanation: 'Lists support assignment by index.'
    })
  ];
}

function generateProfessionalQuiz(title, content) {
  const t = String(title || '').toLowerCase();

  const module1 = generateModule1Quiz(title, content);
  if (module1 && module1.length) return module1;

  // Use prefix/word-boundary matching to avoid false positives (e.g., "setters").
  if (/^dictionary\b/.test(t) || /^dict\b/.test(t)) return generateDictionaryQuiz(title, content);
  if (/^tuple\b/.test(t)) return generateTupleQuiz(title, content);
  if (/^set\b/.test(t)) return generateSetQuiz(title, content);
  if (/^list\b/.test(t)) return generateListQuiz(title, content);
  return null;
}

function titleKey(title) {
  return String(title || '')
    .trim()
    .toLowerCase()
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ');
}

function generateModule1Quiz(title, content) {
  const k = titleKey(title);

  if (k === 'introduction') {
    return [
      buildShortAnswer({
        prompt: 'Who created Python, and around what year did development begin?',
        expectedAnswer: 'Python was created by Guido van Rossum; development began around 1989.',
        explanation: 'The early work started in the late 1980s and public releases followed in the early 1990s.'
      }),
      buildShortAnswer({
        prompt: 'What does “high-level language” mean in the context of Python?',
        expectedAnswer: 'Python abstracts away low-level details (like manual memory management) so you write code closer to human reasoning than machine instructions.',
        explanation: 'You typically focus on logic instead of CPU/memory details.'
      }),
      buildShortAnswer({
        prompt: 'Give two reasons Python is commonly chosen as a first programming language.',
        expectedAnswer: 'Readable syntax and fast feedback/rapid prototyping (you can write working programs with minimal boilerplate).',
        explanation: 'Beginners can focus on concepts; professionals benefit from productivity.'
      })
    ];
  }

  if (k === 'identifiers') {
    return [
      buildShortAnswer({
        prompt: 'What characters are allowed in a Python identifier?',
        expectedAnswer: 'Letters, digits, and underscore `_` (and it cannot start with a digit).',
        explanation: 'Valid pattern: starts with a letter/underscore, then letters/digits/underscore.'
      }),
      buildShortAnswer({
        prompt: 'Why is `ca$h` an invalid identifier in Python?',
        expectedAnswer: 'Because `$` is not an allowed character in identifiers.',
        explanation: 'Only letters/digits/underscore are allowed.'
      }),
      buildShortAnswer({
        prompt: 'What does a leading underscore in a name (e.g., `_value`) usually indicate by convention?',
        expectedAnswer: 'It indicates an internal/private implementation detail by convention.',
        explanation: 'This is a convention, not strict access control.'
      })
    ];
  }

  if (k === 'reserved words') {
    return [
      buildShortAnswer({
        prompt: 'What is a reserved word (keyword) in Python?',
        expectedAnswer: 'A word with special meaning in the language syntax that cannot be used as an identifier name.',
        explanation: 'Examples include `def`, `class`, `return`.'
      }),
      buildShortAnswer({
        prompt: 'Why can’t you use a keyword like `class` as a variable name?',
        expectedAnswer: 'Because Python needs it for syntax; using it as a variable would make code ambiguous or invalid.',
        explanation: 'Keywords are part of Python grammar.'
      }),
      buildShortAnswer({
        prompt: 'How can you check whether a string is a Python keyword?',
        expectedAnswer: 'Use the `keyword` module, e.g., `import keyword; keyword.iskeyword("class")`.',
        explanation: '`keyword.iskeyword` returns True/False.'
      })
    ];
  }

  if (k === 'data types') {
    return [
      buildShortAnswer({
        prompt: 'How do you check the type of a value or variable in Python?',
        expectedAnswer: 'Use `type(x)`.',
        explanation: '`type` returns the class/type object.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `int` and `float`?',
        expectedAnswer: '`int` stores whole numbers; `float` stores numbers with a fractional part (floating-point).',
        explanation: 'Floats can represent decimals but have precision limits.'
      }),
      buildShortAnswer({
        prompt: 'What prefixes denote binary, octal, and hexadecimal integer literals?',
        expectedAnswer: 'Binary: `0b`, octal: `0o`, hexadecimal: `0x`.',
        explanation: 'These prefixes tell Python how to interpret the digits.'
      })
    ];
  }

  if (k === 'type casting') {
    return [
      buildShortAnswer({
        prompt: 'What happens if you run `int("10.5")`?',
        expectedAnswer: 'It raises `ValueError` because "10.5" is not a valid integer literal.',
        explanation: 'Convert to float first, then to int if needed: `int(float("10.5"))`.'
      }),
      buildShortAnswer({
        prompt: 'What is the result of `float(True)` in Python?',
        expectedAnswer: '`1.0`',
        explanation: 'Booleans act like integers: True→1, False→0.'
      }),
      buildShortAnswer({
        prompt: 'Give one example of a conversion that raises `TypeError` with `int(...)`.',
        expectedAnswer: '`int(3+4j)` raises `TypeError` (complex cannot be converted to int).',
        explanation: 'Complex numbers do not have a single integer value.'
      })
    ];
  }

  if (k === 'fundamental data types vs immutability') {
    return [
      buildShortAnswer({
        prompt: 'What does “immutable” mean in Python?',
        expectedAnswer: 'An immutable object cannot be changed in-place after it is created.',
        explanation: 'To “change” it, you create a new object and rebind the variable.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `==` and `is`?',
        expectedAnswer: '`==` compares values (equality); `is` compares object identity (same object in memory).',
        explanation: 'Use `is` for identity checks like `x is None`.'
      }),
      buildShortAnswer({
        prompt: 'If `s = "hi"` and you do `s += "!"`, does Python mutate the same string object?',
        expectedAnswer: 'No. Strings are immutable; Python creates a new string object and rebinds `s`.',
        explanation: 'The variable points to a new object after concatenation.'
      })
    ];
  }

  if (k === 'escape characters') {
    return [
      buildShortAnswer({
        prompt: 'What does the escape sequence `\\n` represent in a Python string?',
        expectedAnswer: 'A newline character (line break).',
        explanation: 'Printing a string containing `\\n` moves output to the next line.'
      }),
      buildShortAnswer({
        prompt: 'How do you include a double quote inside a double-quoted string literal?',
        expectedAnswer: 'Escape it with a backslash: `\\"` (example: `"He said \\\"hi\\\""`).',
        explanation: 'Escaping prevents the quote from ending the string literal.'
      }),
      buildShortAnswer({
        prompt: 'What is a raw string (e.g., `r"C:\\temp"`) commonly used for?',
        expectedAnswer: 'To avoid interpreting backslashes as escape sequences (useful for Windows paths and regex patterns).',
        explanation: 'Raw strings treat backslashes literally (with a few edge-case rules).' 
      })
    ];
  }

  if (k === 'constants') {
    return [
      buildShortAnswer({
        prompt: 'How do Python developers conventionally define constants?',
        expectedAnswer: 'By using UPPERCASE names (e.g., `MAX_RETRIES = 3`).',
        explanation: 'It is a convention; Python does not enforce constants.'
      }),
      buildShortAnswer({
        prompt: 'Can a “constant” name be reassigned in Python?',
        expectedAnswer: 'Yes. Python will allow reassignment; the uppercase name is only a convention.',
        explanation: 'Avoid reassignment to maintain readability and correctness.'
      }),
      buildShortAnswer({
        prompt: 'How can you make a collection effectively constant (not modifiable) in Python?',
        expectedAnswer: 'Use immutable types like `tuple` (instead of list) or `frozenset` (instead of set).',
        explanation: 'Immutability prevents in-place changes.'
      })
    ];
  }

  if (k === 'operators') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `/` and `//` in Python?',
        expectedAnswer: '`/` is true division (returns float). `//` is floor division (rounds down to an integer result for ints).',
        explanation: 'Example: `5/2 == 2.5`, `5//2 == 2`.'
      }),
      buildShortAnswer({
        prompt: 'What does the modulo operator `%` return?',
        expectedAnswer: 'The remainder of a division.',
        explanation: 'Example: `10 % 3 == 1`.'
      }),
      buildShortAnswer({
        prompt: 'How do you force a specific evaluation order in an expression?',
        expectedAnswer: 'Use parentheses `(...)`.',
        explanation: 'Parentheses override default operator precedence.'
      })
    ];
  }

  if (k === 'reading dynamic input from the keyboard') {
    return [
      buildShortAnswer({
        prompt: 'What type does `input()` return in Python?',
        expectedAnswer: 'A string (`str`).',
        explanation: 'Convert to `int`/`float` if you need numeric input.'
      }),
      buildShortAnswer({
        prompt: 'Write one line of code that reads an integer from the user into `n`.',
        expectedAnswer: '`n = int(input("Enter a number: "))`',
        explanation: '`int(...)` converts the returned string into an integer.'
      }),
      buildShortAnswer({
        prompt: 'Why is `.strip()` commonly used on user input?',
        expectedAnswer: 'To remove leading/trailing whitespace (including newlines/spaces) before validation or parsing.',
        explanation: 'This helps avoid bugs caused by accidental spaces.'
      })
    ];
  }

  if (k === 'command line arguments') {
    return [
      buildShortAnswer({
        prompt: 'What is `sys.argv` and what does it typically contain?',
        expectedAnswer: '`sys.argv` is a list of strings containing the command-line arguments; `sys.argv[0]` is the script name/path.',
        explanation: 'All values arrive as strings; you parse/convert them as needed.'
      }),
      buildShortAnswer({
        prompt: 'How do you avoid `IndexError` when reading a required positional argument from `sys.argv`?',
        expectedAnswer: 'Check the length first, e.g., `if len(sys.argv) < 2: print("Usage: ..."); sys.exit(1)`.',
        explanation: '`len(sys.argv)` tells you how many tokens were passed.'
      }),
      buildShortAnswer({
        prompt: 'How do you pass a single argument that contains spaces to a Python script?',
        expectedAnswer: 'Quote it in the shell (e.g., `--name "Ada Lovelace"`), so it becomes one element in `sys.argv`.',
        explanation: 'Quoting rules depend on the shell, but the idea is “one token in argv”.'
      })
    ];
  }

  if (k === 'output statements') {
    return [
      buildShortAnswer({
        prompt: 'What are the defaults of `print(..., sep=..., end=...)`?',
        expectedAnswer: '`sep=" "` and `end="\\n"`.',
        explanation: 'Multiple arguments are separated by spaces and end with a newline by default.'
      }),
      buildShortAnswer({
        prompt: 'How do you print `"Loading..."` without moving to the next line afterward?',
        expectedAnswer: '`print("Loading...", end="")` (or `end="\\r"` for overwriting).',
        explanation: '`end` controls what is printed after the content.'
      }),
      buildShortAnswer({
        prompt: 'How do you format a floating value `x` to 2 decimal places using an f-string?',
        expectedAnswer: '`f"{x:.2f}"`',
        explanation: 'The format specifier `.2f` rounds to two digits after the decimal point.'
      })
    ];
  }

  if (k === 'flow control (overview)') {
    return [
      buildShortAnswer({
        prompt: 'Name the three main categories of flow control statements in Python.',
        expectedAnswer: 'Selection (if/elif/else), iteration (for/while), and transfer/jump (break/continue/return/pass).',
        explanation: 'They decide which code runs, how many times it runs, and when to exit/skip.'
      }),
      buildShortAnswer({
        prompt: 'What must an `if` statement condition evaluate to in Python?',
        expectedAnswer: 'A truth value (truthy/falsy), effectively `True` or `False`.',
        explanation: 'Many objects are truthy/falsy (e.g., empty list is falsy).'
      }),
      buildShortAnswer({
        prompt: 'When is `pass` useful in flow control?',
        expectedAnswer: 'When syntax requires a block but you intentionally want a no-op placeholder.',
        explanation: 'Example: scaffolding an `if` or `while` block before implementation.'
      })
    ];
  }

  if (k === 'conditional statements (if / if-else / if-elif-else)') {
    return [
      buildShortAnswer({
        prompt: 'Write a Python condition that checks whether `n` is between 1 and 100 inclusive.',
        expectedAnswer: '`1 <= n <= 100`',
        explanation: 'Python supports chained comparisons.'
      }),
      buildShortAnswer({
        prompt: 'In an `if/elif/else` chain, how many blocks can run for one execution?',
        expectedAnswer: 'At most one block: the first `if/elif` condition that is true; otherwise the `else` block.',
        explanation: 'Once a condition matches, the rest are skipped.'
      }),
      buildShortAnswer({
        prompt: 'What happens if none of the `if/elif` conditions match and there is no `else`?',
        expectedAnswer: 'Nothing happens; execution continues after the chain.',
        explanation: 'No branch is taken, so the chain does no work.'
      })
    ];
  }

  if (k === 'iterative statements (for / while)') {
    return [
      buildShortAnswer({
        prompt: 'When would you choose a `for` loop vs a `while` loop in Python?',
        expectedAnswer: '`for` when iterating a known iterable; `while` when repeating until a condition changes.',
        explanation: '`for` is idiomatic for sequences; `while` fits sentinel/unknown iteration counts.'
      }),
      buildShortAnswer({
        prompt: 'What values does `range(5)` produce?',
        expectedAnswer: '0, 1, 2, 3, 4',
        explanation: 'The stop value is exclusive.'
      }),
      buildShortAnswer({
        prompt: 'How do you loop over a sequence and get both index and value?',
        expectedAnswer: 'Use `enumerate`, e.g., `for i, x in enumerate(items): ...`',
        explanation: '`enumerate` yields (index, item) pairs.'
      })
    ];
  }

  if (k === 'transfer statements (break / continue / pass)') {
    return [
      buildShortAnswer({
        prompt: 'What does `break` do inside a loop?',
        expectedAnswer: 'It immediately exits the nearest enclosing loop.',
        explanation: 'Execution continues after the loop.'
      }),
      buildShortAnswer({
        prompt: 'What does `continue` do inside a loop?',
        expectedAnswer: 'It skips the rest of the current iteration and moves to the next iteration.',
        explanation: 'Useful for filtering/early-skip patterns.'
      }),
      buildShortAnswer({
        prompt: 'What does `pass` do?',
        expectedAnswer: 'Nothing (no operation).',
        explanation: 'It’s a syntactic placeholder for an empty block.'
      })
    ];
  }

  if (k === 'del statement and del vs none') {
    return [
      buildShortAnswer({
        prompt: 'After `del x`, what typically happens if you try to use `x` again?',
        expectedAnswer: 'You get a `NameError` because the name `x` is unbound in the current scope.',
        explanation: '`del` removes the name binding, not “zeros out” the value.'
      }),
      buildShortAnswer({
        prompt: 'What is the key difference between `del x` and `x = None`?',
        expectedAnswer: '`del x` unbinds the name; `x = None` keeps the name but points it to `None`.',
        explanation: '`x = None` is often used to mean “intentionally empty/no value”.'
      }),
      buildShortAnswer({
        prompt: 'How can you delete a slice of a list in-place?',
        expectedAnswer: 'Use `del lst[a:b]` (or `del lst[:]` to clear the list).',
        explanation: '`del` supports list element and slice deletion.'
      })
    ];
  }

  if (k === 'string (overview + literals)') {
    return [
      buildShortAnswer({
        prompt: 'How do you create a multi-line string literal in Python?',
        expectedAnswer: 'Use triple quotes: `"""..."""` (or `\'\'\'...\'\'\'`).',
        explanation: 'Triple-quoted strings can span lines.'
      }),
      buildShortAnswer({
        prompt: 'Is there a type difference between a “character” and a string in Python?',
        expectedAnswer: 'No. A single character is still a `str` (e.g., `type("a") is str`).',
        explanation: 'Python does not have a separate `char` type.'
      }),
      buildShortAnswer({
        prompt: 'What is one important limitation of raw strings (prefix `r`)?',
        expectedAnswer: 'A raw string literal cannot end with a single trailing backslash (it would escape the quote).',
        explanation: 'Example: `r"C:\\temp\\"` is invalid as a literal; use `"C:\\\\temp\\\\"` or append `"\\"`.'
      })
    ];
  }

  if (k === 'string - indexing (positive and negative)') {
    return [
      buildShortAnswer({
        prompt: 'How do you access the last character of a non-empty string `s`?',
        expectedAnswer: '`s[-1]`',
        explanation: 'Negative indices count from the end.'
      }),
      buildShortAnswer({
        prompt: 'What happens if you do `s[999]` when `s` is shorter than 1000 characters?',
        expectedAnswer: 'Python raises `IndexError`.',
        explanation: 'String indexing must be within `0..len(s)-1` (or negative equivalents).' 
      }),
      buildShortAnswer({
        prompt: 'How do you access the second-to-last character in `"abcde"`?',
        expectedAnswer: '`"abcde"[-2]`',
        explanation: '`-1` is last, so `-2` is second last.'
      })
    ];
  }

  if (k === 'string - slicing (substrings)') {
    return [
      buildShortAnswer({
        prompt: 'In slicing `s[a:b]`, is `b` included in the result?',
        expectedAnswer: 'No. `b` is exclusive; the slice includes indices `a` through `b-1`.',
        explanation: 'This rule makes slices compose cleanly.'
      }),
      buildShortAnswer({
        prompt: 'How do you reverse a string `s` using slicing?',
        expectedAnswer: '`s[::-1]`',
        explanation: 'A step of `-1` traverses from end to start.'
      }),
      buildShortAnswer({
        prompt: 'How do you take the substring from index 3 to the end of `s`?',
        expectedAnswer: '`s[3:]`',
        explanation: 'Omitting `b` means “until the end”.'
      })
    ];
  }

  if (k === 'string - slicing (rules + tricky cases)') {
    return [
      buildShortAnswer({
        prompt: 'What happens if you use a step of 0 in a slice, like `s[1:5:0]`?',
        expectedAnswer: 'Python raises `ValueError` because a slice step cannot be zero.',
        explanation: 'A step of 0 would never move, so Python disallows it.'
      }),
      buildShortAnswer({
        prompt: 'Why is `"abcdef"[2:5]` non-empty, but `"abcdef"[5:2]` empty?',
        expectedAnswer: 'With a positive step (default), slicing moves forward, so `start` must be less than `stop` to collect characters.',
        explanation: 'Direction must match the step sign.'
      }),
      buildShortAnswer({
        prompt: 'What is the result of `"abcdef"[5:2:-1]`?',
        expectedAnswer: '`"fed"`',
        explanation: 'Negative step moves backward: indices 5,4,3 (stop 2 is excluded).' 
      })
    ];
  }

  if (k === 'string - operators, len(), membership, comparison') {
    return [
      buildShortAnswer({
        prompt: 'What does the `in` operator do for strings, and what does it return?',
        expectedAnswer: 'It checks substring membership and returns `True` or `False` (e.g., `"py" in "python"` is `True`).',
        explanation: '`in` is a boolean membership test.'
      }),
      buildShortAnswer({
        prompt: 'What is the result of `len("hello")` and what does `len` count for strings?',
        expectedAnswer: '`5`; it counts the number of characters in the string.',
        explanation: 'For `str`, `len` returns character count, not bytes.'
      }),
      buildShortAnswer({
        prompt: 'How are strings compared in Python (e.g., `"abc" < "abd"`)?',
        expectedAnswer: 'Lexicographically (character by character using Unicode code points) until a difference is found.',
        explanation: 'The first differing character determines the result.'
      })
    ];
  }

  if (k === 'string - removing spaces (strip family)') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `strip()`, `lstrip()`, and `rstrip()`?',
        expectedAnswer: '`strip()` removes from both ends, `lstrip()` from the left, and `rstrip()` from the right (whitespace by default).',
        explanation: 'They remove leading/trailing characters, not “inside” spaces.'
      }),
      buildShortAnswer({
        prompt: 'What is the result of `"  hi  ".strip()`?',
        expectedAnswer: '`"hi"`',
        explanation: 'Default behavior removes surrounding whitespace.'
      }),
      buildShortAnswer({
        prompt: 'How do you remove only trailing newlines from a line read from a file?',
        expectedAnswer: 'Use `rstrip("\\n")` (or `rstrip("\\r\\n")` if needed).',
        explanation: 'This avoids removing other meaningful leading/trailing spaces.'
      })
    ];
  }

  if (k === 'string - finding substrings (find/index/rfind/rindex)') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `s.find(sub)` and `s.index(sub)` when `sub` is not found?',
        expectedAnswer: '`find` returns `-1`; `index` raises `ValueError`.',
        explanation: 'Use `find` when “not found” is expected; use `index` when absence is exceptional.'
      }),
      buildShortAnswer({
        prompt: 'Which method finds the last occurrence of a substring in a string?',
        expectedAnswer: '`rfind` (or `rindex`, which raises if not found).',
        explanation: '`r*` methods search from the right.'
      }),
      buildShortAnswer({
        prompt: 'How do you check if a substring exists without caring about its position?',
        expectedAnswer: 'Use `sub in s`.',
        explanation: '`in` is the simplest membership test for substrings.'
      })
    ];
  }

  if (k === 'string - count() and replace() + immutability') {
    return [
      buildShortAnswer({
        prompt: 'What does `s.count("ab")` return?',
        expectedAnswer: 'The number of non-overlapping occurrences of the substring `"ab"` in `s`.',
        explanation: 'Counting does not change the original string.'
      }),
      buildShortAnswer({
        prompt: 'Does `s.replace("a", "b")` modify `s` in-place?',
        expectedAnswer: 'No. Strings are immutable; `replace` returns a new string.',
        explanation: 'You must assign: `s = s.replace(...)` if you want to keep the result.'
      }),
      buildShortAnswer({
        prompt: 'What is a safe way to swap `a` and `b` characters in a string without double-replacing?',
        expectedAnswer: 'Use a temporary placeholder, e.g., `s.replace("a", "#").replace("b", "a").replace("#", "b")`.',
        explanation: 'Direct chained replace can overwrite results unless you use a placeholder.'
      })
    ];
  }

  if (k === 'string - split() and join()') {
    return [
      buildShortAnswer({
        prompt: 'What does `s.split()` (with no argument) split on?',
        expectedAnswer: 'Runs of whitespace (spaces/tabs/newlines); multiple spaces are treated as a single separator.',
        explanation: '`split()` without a separator is whitespace-aware.'
      }),
      buildShortAnswer({
        prompt: 'What does `"-".join(["a", "b", "c"])` produce?',
        expectedAnswer: '`"a-b-c"`',
        explanation: '`join` inserts the separator between elements.'
      }),
      buildShortAnswer({
        prompt: 'What error happens if the list passed to `join` contains non-strings (e.g., `["a", 1]`)?',
        expectedAnswer: 'A `TypeError` (all elements must be `str`).',
        explanation: 'Convert non-strings first (e.g., `map(str, items)`).'
      })
    ];
  }

  if (k === 'string - case conversion + startswith/endswith') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `lower()` and `casefold()`?',
        expectedAnswer: '`casefold()` is a more aggressive, Unicode-aware normalization for case-insensitive comparisons.',
        explanation: 'Use `casefold()` when comparing human text case-insensitively.'
      }),
      buildShortAnswer({
        prompt: 'How do you test whether `s` starts with any of several prefixes?',
        expectedAnswer: 'Use a tuple: `s.startswith(("pre1", "pre2"))`.',
        explanation: '`startswith` and `endswith` accept tuples of strings.'
      }),
      buildShortAnswer({
        prompt: 'What does `"hello world".title()` return?',
        expectedAnswer: '`"Hello World"`',
        explanation: '`title()` capitalizes words (with some edge cases around apostrophes).' 
      })
    ];
  }

  if (k === 'string - character checks (isalpha, isdigit, ...)') {
    return [
      buildShortAnswer({
        prompt: 'What does `s.isdigit()` return for `"123"` and for `"-123"`?',
        expectedAnswer: '`"123".isdigit()` is `True`; `"-123".isdigit()` is `False`.',
        explanation: 'The minus sign is not a digit character.'
      }),
      buildShortAnswer({
        prompt: 'What does `s.isspace()` check?',
        expectedAnswer: 'It returns `True` if all characters are whitespace and the string is non-empty.',
        explanation: '`"   ".isspace()` is True; `"".isspace()` is False.'
      }),
      buildShortAnswer({
        prompt: 'How can you validate that a string contains only letters and digits (no spaces)?',
        expectedAnswer: 'Use `s.isalnum()`.',
        explanation: '`isalnum` checks all characters are alphanumeric and string is non-empty.'
      })
    ];
  }

  if (k === 'string - formatting with format() (incl. numbers)') {
    return [
      buildShortAnswer({
        prompt: 'What does `"{:05d}".format(42)` produce?',
        expectedAnswer: '`"00042"`',
        explanation: 'Width 5, pad with zeros, integer format.'
      }),
      buildShortAnswer({
        prompt: 'How do you format `3.14159` to exactly 2 decimal places using `format()`?',
        expectedAnswer: '`"{:.2f}".format(3.14159)` which yields `"3.14"`.',
        explanation: '`.2f` rounds to 2 digits after the decimal.'
      }),
      buildShortAnswer({
        prompt: 'How do you use named placeholders with `format()`?',
        expectedAnswer: 'Example: `"Hello {name}".format(name="Ada")` → `"Hello Ada"`.',
        explanation: 'Named fields improve readability for multiple values.'
      })
    ];
  }

  if (k === 'string - practice programs (1)') {
    return [
      buildShortAnswer({
        prompt: 'Write one expression that reverses a string `s`.',
        expectedAnswer: '`s[::-1]`',
        explanation: 'Slicing with step -1 reverses.'
      }),
      buildShortAnswer({
        prompt: 'How can you check if a string `s` is a palindrome (ignoring case) in one line?',
        expectedAnswer: '`s.casefold() == s.casefold()[::-1]`',
        explanation: 'Normalize case first, then compare with the reversed string.'
      }),
      buildShortAnswer({
        prompt: 'How do you count vowels in a string `s` (case-insensitive) using a loop condition?',
        expectedAnswer: 'Check `ch.lower() in "aeiou"` (and increment a counter).',
        explanation: 'Lowercasing handles both uppercase and lowercase letters.'
      })
    ];
  }

  if (k === 'string - practice programs (2)') {
    return [
      buildShortAnswer({
        prompt: 'Write a one-liner that counts vowels in a string `s` (case-insensitive).',
        expectedAnswer: '`sum(ch in "aeiou" for ch in s.casefold())`',
        explanation: '`casefold()` is a robust lowercasing for comparisons; `sum(bool)` counts True values.'
      }),
      buildShortAnswer({
        prompt: 'How do you reverse the word order in a sentence `s` (normalize extra spaces)?',
        expectedAnswer: '`" ".join(s.split()[::-1])`',
        explanation: '`split()` collapses whitespace; reversing the word list flips the order.'
      }),
      buildShortAnswer({
        prompt: 'Give a simple anagram check for strings `a` and `b` (ignore case and spaces).',
        expectedAnswer: '`sorted(a.replace(" ", "").casefold()) == sorted(b.replace(" ", "").casefold())`',
        explanation: 'Normalize then compare sorted characters; for large strings, a frequency counter is faster.'
      })
    ];
  }

  if (k === 'string - practice programs (3)') {
    return [
      buildShortAnswer({
        prompt: 'Write a one-liner that removes all digits from a string `s`.',
        expectedAnswer: '`"".join(ch for ch in s if not ch.isdigit())`',
        explanation: '`isdigit()` filters numeric characters; `join` rebuilds the string.'
      }),
      buildShortAnswer({
        prompt: 'How do you validate that a string `name` is a valid Python identifier and not a keyword?',
        expectedAnswer: '`name.isidentifier() and (not keyword.iskeyword(name))`',
        explanation: '`isidentifier()` checks syntax; `keyword.iskeyword` excludes reserved words.'
      }),
      buildShortAnswer({
        prompt: 'How do you collapse multiple spaces/tabs/newlines in `s` to single spaces?',
        expectedAnswer: '`" ".join(s.split())`',
        explanation: '`split()` without args splits on any whitespace and drops repeats.'
      })
    ];
  }

  if (k === 'list (overview)') {
    return [
      buildShortAnswer({
        prompt: 'What is a list in Python (mention ordering + mutability)?',
        expectedAnswer: 'A list is an ordered, mutable sequence; it can hold mixed types and duplicates.',
        explanation: '“Ordered” means index-based access; “mutable” means you can change it in-place.'
      }),
      buildShortAnswer({
        prompt: 'Give one key difference between a list and a tuple.',
        expectedAnswer: 'Lists are mutable; tuples are immutable (so tuples are safer for fixed records).',
        explanation: 'Mutability affects whether you can edit elements after creation.'
      }),
      buildShortAnswer({
        prompt: 'What does `lst[1:999]` do if `lst` is shorter than 999 elements?',
        expectedAnswer: 'It returns elements from index 1 to the end; slicing does not raise `IndexError` for out-of-range bounds.',
        explanation: 'Indexing can raise `IndexError`, but slicing clamps to valid bounds.'
      })
    ];
  }

  if (k === 'list - creation (common ways)') {
    return [
      buildShortAnswer({
        prompt: 'Create a list of integers 0..4 in one expression.',
        expectedAnswer: '`list(range(5))`',
        explanation: '`range(5)` generates 0..4; `list(...)` materializes it.'
      }),
      buildShortAnswer({
        prompt: 'What does `list("abc")` return?',
        expectedAnswer: "`['a', 'b', 'c']`",
        explanation: '`list(iterable)` collects each element from the iterable.'
      }),
      buildShortAnswer({
        prompt: 'Write a list comprehension that returns squares of even numbers from 0..9.',
        expectedAnswer: '`[x*x for x in range(10) if x % 2 == 0]`',
        explanation: 'Comprehensions combine mapping (x*x) and filtering (if condition).' 
      })
    ];
  }

  if (k === 'list - accessing elements (indexing + slicing)') {
    return [
      buildShortAnswer({
        prompt: 'What does `lst[-1]` return for a non-empty list `lst`?',
        expectedAnswer: 'The last element of the list.',
        explanation: 'Negative indices count from the end.'
      }),
      buildShortAnswer({
        prompt: 'Give one expression that makes a shallow copy of a list `lst`.',
        expectedAnswer: '`lst[:]` (or `lst.copy()`) ',
        explanation: 'A shallow copy creates a new list object but shares nested objects.'
      }),
      buildShortAnswer({
        prompt: 'What does slicing with a step like `lst[::2]` return?',
        expectedAnswer: 'A new list containing every second element (indices 0,2,4,...)',
        explanation: 'The step controls how indices advance.'
      })
    ];
  }

  if (k === 'list - mutability (editing elements)') {
    return [
      buildShortAnswer({
        prompt: 'Replace the element at index 0 with 99 in list `lst`.',
        expectedAnswer: '`lst[0] = 99`',
        explanation: 'Lists support assignment by index.'
      }),
      buildShortAnswer({
        prompt: 'What does slice assignment do? Give one example that changes multiple elements at once.',
        expectedAnswer: 'Example: `lst[1:3] = [9, 9]` replaces indices 1 and 2 with 9,9.',
        explanation: 'Slice assignment can replace a whole range and may change list length.'
      }),
      buildShortAnswer({
        prompt: 'What is a practical difference between `lst += [x]` and `lst = lst + [x]` when aliases exist?',
        expectedAnswer: '`lst += [x]` mutates the existing list object; `lst = lst + [x]` creates a new list and rebinds the name.',
        explanation: 'If another variable references the same list, in-place mutation affects both.'
      })
    ];
  }

  if (k === 'list - traversal (while/for)') {
    return [
      buildShortAnswer({
        prompt: 'Which loop pattern gives you both index and value while iterating a list?',
        expectedAnswer: '`for i, x in enumerate(lst): ...`',
        explanation: '`enumerate` yields `(index, value)` pairs.'
      }),
      buildShortAnswer({
        prompt: 'State one common bug when removing items from a list while iterating it.',
        expectedAnswer: 'You can skip elements because indices shift after removal.',
        explanation: 'Use a new list (comprehension) or iterate over a copy when filtering/removing.'
      }),
      buildShortAnswer({
        prompt: 'How do you iterate over list indices explicitly (when you truly need indices)?',
        expectedAnswer: '`for i in range(len(lst)):`',
        explanation: 'Prefer `enumerate` unless you specifically need index arithmetic.'
      })
    ];
  }

  if (k === 'list - info methods (len, count, index)') {
    return [
      buildShortAnswer({
        prompt: 'Differentiate: `len(lst)`, `lst.count(x)`, and `lst.index(x)`.',
        expectedAnswer: '`len` returns size; `count` returns occurrences of x; `index` returns the first index of x (or raises `ValueError`).',
        explanation: 'They answer different questions: size vs frequency vs position.'
      }),
      buildShortAnswer({
        prompt: 'How can you safely get the index of `x` only if it exists in the list?',
        expectedAnswer: 'Use `if x in lst: i = lst.index(x)` else handle missing.',
        explanation: '`in` prevents a `ValueError` from `index` when missing.'
      }),
      buildShortAnswer({
        prompt: 'State the time complexity of `len(lst)` vs `x in lst` for Python lists.',
        expectedAnswer: '`len(lst)` is O(1); `x in lst` is O(n) in the worst case.',
        explanation: 'Lists are dynamic arrays; membership is a linear scan.'
      })
    ];
  }

  if (k === 'list - grow list (append, insert, extend)') {
    return [
      buildShortAnswer({
        prompt: 'Explain `append(x)` vs `extend(iterable)` in one sentence.',
        expectedAnswer: '`append` adds one element; `extend` adds each element from an iterable.',
        explanation: '`append([3,4])` nests; `extend([3,4])` concatenates.'
      }),
      buildShortAnswer({
        prompt: 'What is the typical time cost of `lst.insert(0, x)` and why?',
        expectedAnswer: 'O(n) because elements must be shifted right to make room at the front.',
        explanation: 'Inserting near the start moves many elements in an array-backed list.'
      }),
      buildShortAnswer({
        prompt: 'Given `lst=[1,2]`, what is the result of `lst.extend([3,4])`?',
        expectedAnswer: '`[1, 2, 3, 4]`',
        explanation: '`extend` iterates the argument and appends each element.'
      })
    ];
  }

  if (k === 'list - shrink list (remove, pop, clear)') {
    return [
      buildShortAnswer({
        prompt: 'Differentiate `remove(x)` vs `pop(i)` for lists.',
        expectedAnswer: '`remove(x)` deletes the first matching value; `pop(i)` deletes by index and returns the removed element.',
        explanation: '`remove` raises `ValueError` if missing; `pop` raises `IndexError` if index invalid.'
      }),
      buildShortAnswer({
        prompt: 'How do you remove all occurrences of a value `x` from a list `lst`?',
        expectedAnswer: '`lst = [v for v in lst if v != x]`',
        explanation: 'Filtering builds a new list without the unwanted value(s).' 
      }),
      buildShortAnswer({
        prompt: 'What does `lst.clear()` do, and why does it matter if other variables reference `lst`?',
        expectedAnswer: 'It empties the same list object in-place, so all references see the list become empty.',
        explanation: 'This is different from rebinding a name to a new list.'
      })
    ];
  }

  if (k === 'list - ordering (reverse, sort)') {
    return [
      buildShortAnswer({
        prompt: 'Explain `sorted(lst)` vs `lst.sort()` (return value + mutation) and give one example.',
        expectedAnswer: '`sorted(lst)` returns a new sorted list and keeps `lst` unchanged; `lst.sort()` sorts in-place and returns `None`.\n\nExample: `nums=[3,1,2]`; `sorted(nums)` gives `[1,2,3]` but `nums` stays `[3,1,2]`. After `nums.sort()`, `nums` becomes `[1,2,3]`.',
        explanation: 'Use `sorted(...)` when you need a sorted copy or when the input is any iterable; use `.sort()` when you can mutate the original list.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `reversed(lst)` and `lst[::-1]`?',
        expectedAnswer: '`reversed(lst)` returns an iterator that yields elements in reverse order; `lst[::-1]` creates a new reversed list immediately.',
        explanation: '`reversed` is lazy (memory-friendly). Slicing materializes a new list.'
      }),
      buildShortAnswer({
        prompt: 'How do you sort a list of strings case-insensitively without changing the originals?',
        expectedAnswer: 'Use `sorted(words, key=str.casefold)`.\n\nExample: `sorted(["b", "A", "a"], key=str.casefold)` returns `["A", "a", "b"]`.',
        explanation: '`key=` transforms each element to a comparison key; `casefold()` is safer than `lower()` for general Unicode.'
      })
    ];
  }

  if (k === 'list - aliasing vs cloning (copy)') {
    return [
      buildShortAnswer({
        prompt: 'Explain aliasing vs cloning for lists in one or two sentences.',
        expectedAnswer: 'Aliasing means two variables refer to the same list object (`b = a`), so mutations through either name affect the same underlying list. Cloning creates a new list object (e.g., `a.copy()` or `a[:]`) so top-level mutations do not affect the original.',
        explanation: 'Most “mysterious list changes” come from aliasing, not from Python copying values automatically.'
      }),
      buildShortAnswer({
        prompt: 'Given `a = [[1],[2]]` and `b = a.copy()`, what happens after `b[0].append(99)` and why?',
        expectedAnswer: 'Both `a` and `b` show the change in the first inner list because the copy is shallow: the outer list is new, but inner lists are shared references.\n\nAfter the append: `a == [[1, 99], [2]]` and `b == [[1, 99], [2]]`.',
        explanation: 'Shallow copy copies only the container, not nested mutable elements.'
      }),
      buildShortAnswer({
        prompt: 'How do you deep-copy a nested list when you truly need complete independence?',
        expectedAnswer: 'Use `import copy; b = copy.deepcopy(a)`.',
        explanation: '`deepcopy` recursively copies nested objects, which can be slower but prevents shared nested references.'
      })
    ];
  }

  if (k === 'list - operators, comparisons, membership') {
    return [
      buildShortAnswer({
        prompt: 'Explain membership testing `x in lst` for lists and its typical complexity.',
        expectedAnswer: '`x in lst` linearly scans the list to check equality against elements, so it is O(n) in the worst case.',
        explanation: 'Lists are not hash-based; for frequent membership tests, a `set` is usually better (average O(1)).'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `lst + [x]` and `lst.append(x)`?',
        expectedAnswer: '`lst + [x]` creates and returns a new list; `lst.append(x)` mutates `lst` in-place and returns `None`.',
        explanation: 'In loops, prefer `append` for performance (avoids repeated copying).' 
      }),
      buildShortAnswer({
        prompt: 'How does Python compare lists (e.g., `[1,2,10] < [1,3]`), and what is one common misunderstanding?',
        expectedAnswer: 'Lists are compared lexicographically: compare first elements, then second, etc. `[1,2,10] < [1,3]` is True because 2 < 3 at the first differing position.',
        explanation: 'It does not compare by length first; it compares element-by-element like strings.'
      })
    ];
  }

  if (k === 'list - nested lists + matrix idea') {
    return [
      buildShortAnswer({
        prompt: 'How do you access and update the element at row `i`, column `j` in a matrix `m` (nested lists)?',
        expectedAnswer: 'Access: `m[i][j]`. Update: `m[i][j] = new_value`.',
        explanation: 'You index the outer list to get a row, then index the row to get the cell.'
      }),
      buildShortAnswer({
        prompt: 'Why is `m = [[0]*3]*2` a bug for matrices, and what observable symptom does it produce?',
        expectedAnswer: 'It creates two references to the same inner list. Symptom: changing `m[0][0]` also changes `m[1][0]` because both rows are the same object.',
        explanation: 'List multiplication duplicates references for nested mutables, not deep copies.'
      }),
      buildShortAnswer({
        prompt: 'Write a correct 2x3 zero matrix creation expression.',
        expectedAnswer: '`[[0 for _ in range(3)] for _ in range(2)]`',
        explanation: 'The inner list is created fresh each iteration, so rows are independent.'
      })
    ];
  }

  if (k === 'list - list comprehensions (expanded)') {
    return [
      buildShortAnswer({
        prompt: 'Rewrite this loop as a list comprehension: collect squares of even numbers from 0..9.',
        expectedAnswer: '`[x*x for x in range(10) if x % 2 == 0]`',
        explanation: 'Comprehensions combine mapping (`x*x`) and filtering (`if ...`) in one readable expression.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `[expr for x in it]` and `(expr for x in it)`?',
        expectedAnswer: 'Square brackets build a list immediately; parentheses create a generator expression (lazy iterator).',
        explanation: 'Generators are more memory-efficient for large data when you iterate once.'
      }),
      buildShortAnswer({
        prompt: 'State one readability rule of thumb for comprehensions in production code.',
        expectedAnswer: 'Use comprehensions for simple transformations/filters; if it becomes nested or hard to read, switch to a normal loop for clarity.',
        explanation: 'Readable code is easier to debug and maintain than a “clever” one-liner.'
      })
    ];
  }

  if (k === 'list - program: unique vowels in a word') {
    return [
      buildShortAnswer({
        prompt: 'Write a function that returns the unique vowels in a word, in the order they first appear.',
        expectedAnswer: 'Example:\n\n```python\ndef unique_vowels(word):\n    seen = set()\n    out = []\n    for ch in word.casefold():\n        if ch in "aeiou" and ch not in seen:\n            seen.add(ch)\n            out.append(ch)\n    return out\n```\n\nThis returns a list like `["a", "e"]`.',
        explanation: 'A `set` tracks uniqueness (fast membership), while a list preserves first-seen order.'
      }),
      buildShortAnswer({
        prompt: 'Why is a `set` typically better than a list for “have we seen this already?” checks?',
        expectedAnswer: 'Set membership is average O(1), while list membership is O(n) because it scans linearly.',
        explanation: 'For long strings or many checks, the complexity difference matters.'
      }),
      buildShortAnswer({
        prompt: 'How would you adapt the program to return unique vowels sorted alphabetically instead?',
        expectedAnswer: 'Collect into a set and then sort: `sorted({ch for ch in word.casefold() if ch in "aeiou"})`.',
        explanation: 'Sorting loses first-seen order but produces a stable alphabetical output.'
      })
    ];
  }

  if (k === 'tuple (overview)') {
    return [
      buildShortAnswer({
        prompt: 'What is a tuple in Python, and what does “immutable” mean for tuples?',
        expectedAnswer: 'A tuple is an ordered sequence type like a list, but immutable: you cannot reassign its elements (no item assignment).',
        explanation: 'Immutability applies to the tuple container (its element references), not necessarily to objects stored inside it.'
      }),
      buildShortAnswer({
        prompt: 'How do you create a single-element tuple, and why is the comma required?',
        expectedAnswer: 'Use a trailing comma: `(42,)`. The comma makes it a tuple; `(42)` is just the value 42 in parentheses.',
        explanation: 'This prevents subtle bugs where code expects a tuple but receives a scalar.'
      }),
      buildShortAnswer({
        prompt: 'Give two situations where a tuple is preferable to a list.',
        expectedAnswer: 'Use tuples for fixed records (e.g., `(x, y)` coordinates) and for hashable keys in dictionaries/sets (tuples of hashable items can be keys).',
        explanation: 'Tuples communicate “this should not change” and can be used as keys when elements are hashable.'
      })
    ];
  }

  if (k === 'tuple - creation + the single-item tuple trap') {
    return [
      buildShortAnswer({
        prompt: 'Show three different ways to create a tuple.',
        expectedAnswer: 'Examples: literal `(1, 2, 3)`, constructor `tuple([1,2,3])`, packing without parentheses: `t = 1, 2, 3`.',
        explanation: 'Tuple packing is common in returns and assignments.'
      }),
      buildShortAnswer({
        prompt: 'What is the “single-item tuple trap”? Give the correct syntax.',
        expectedAnswer: 'The trap is writing `(42)` and thinking it is a tuple. Correct single-item tuple is `(42,)` (comma required).',
        explanation: 'Parentheses alone do not create a tuple; commas do.'
      }),
      buildShortAnswer({
        prompt: 'What does `tuple("abc")` produce and why?',
        expectedAnswer: "`('a', 'b', 'c')` because `tuple(iterable)` iterates and collects each element into the tuple.",
        explanation: 'It behaves like `list("abc")` but returns a tuple instead of a list.'
      })
    ];
  }

  if (k === 'tuple - accessing (indexing + slicing)') {
    return [
      buildShortAnswer({
        prompt: 'What does `t[-1]` return for a non-empty tuple `t`?',
        expectedAnswer: 'The last element.',
        explanation: 'Negative indexing counts from the end.'
      }),
      buildShortAnswer({
        prompt: 'What is the type of `t[1:3]` when `t` is a tuple?',
        expectedAnswer: 'A new tuple containing the sliced elements.',
        explanation: 'Slicing a tuple returns a tuple (not a view).' 
      }),
      buildShortAnswer({
        prompt: 'How can you safely access the first element of a tuple `t` that may be empty?',
        expectedAnswer: 'Check before indexing: `t[0] if t else None` (or handle the empty case explicitly).',
        explanation: 'Indexing an empty tuple raises `IndexError`.'
      })
    ];
  }

  if (k === 'tuple - immutability (what it means in practice)') {
    return [
      buildShortAnswer({
        prompt: 'What happens if you try `t[0] = 99` on a tuple `t`, and what error do you get?',
        expectedAnswer: 'It fails with `TypeError` because tuples do not support item assignment.',
        explanation: 'Tuples are immutable sequences: you cannot modify elements in-place.'
      }),
      buildShortAnswer({
        prompt: 'Can a tuple contain a list, and if so, can that list be mutated?',
        expectedAnswer: 'Yes. The tuple can reference a list, and the list can still be mutated (e.g., append). The tuple reference itself is what is immutable.',
        explanation: 'Immutability applies to the tuple container; referenced objects may be mutable.'
      }),
      buildShortAnswer({
        prompt: 'If you “need to change” a tuple, what is the idiomatic approach?',
        expectedAnswer: 'Create a new tuple (e.g., `t = t[:i] + (new_value,) + t[i+1:]`), or convert to a list, modify, then convert back.',
        explanation: 'Since you cannot mutate a tuple, you rebuild it or work in a mutable representation.'
      })
    ];
  }

  if (k === 'tuple - operators, membership, comparisons') {
    return [
      buildShortAnswer({
        prompt: 'Explain `x in t` for a tuple `t` and give the typical time complexity.',
        expectedAnswer: '`x in t` scans the tuple left-to-right and compares for equality until it finds a match, so it is O(n) in the worst case.',
        explanation: 'Tuples are sequences (not hash tables). If you need many membership tests, use a `set` for average O(1) membership.'
      }),
      buildShortAnswer({
        prompt: 'What happens with tuple concatenation like `(1, 2) + (3,)`, and why is `(3,)` written with a comma?',
        expectedAnswer: 'It creates a new tuple `(1, 2, 3)`; tuples are immutable so concatenation returns a new object. `(3,)` is the 1-item tuple syntax (comma required), otherwise `(3)` is just the integer 3.',
        explanation: 'Commas create tuples; parentheses mainly group expressions.'
      }),
      buildShortAnswer({
        prompt: 'How are tuples compared in Python (lexicographic), and what can cause a `TypeError` during comparison?',
        expectedAnswer: 'Tuples compare element-by-element (lexicographically) until a difference is found. A `TypeError` can occur if Python reaches elements that cannot be ordered with `<` (e.g., comparing `"a" < 1`).',
        explanation: 'In Python 3, ordering between unrelated types is not defined; only comparable element pairs can be ordered.'
      })
    ];
  }

  if (k === 'tuple - useful functions (len, count, index, sorted, min/max)') {
    return [
      buildShortAnswer({
        prompt: 'What do `len(t)`, `t.count(x)`, and `t.index(x)` do, and what error can `index` raise?',
        expectedAnswer: '`len(t)` returns the number of elements. `t.count(x)` returns how many times `x` appears. `t.index(x)` returns the first index of `x` and raises `ValueError` if `x` is not present.',
        explanation: '`index` finds a position; it is not a safe membership test by itself.'
      }),
      buildShortAnswer({
        prompt: 'What does `sorted(t)` return when `t` is a tuple, and how do you get a tuple back?',
        expectedAnswer: '`sorted(t)` returns a new list. To get a tuple, wrap it: `tuple(sorted(t))`.',
        explanation: '`sorted(...)` always returns a list, regardless of input type.'
      }),
      buildShortAnswer({
        prompt: 'How do `min(t)` / `max(t)` work for tuples, and how do you customize the comparison?',
        expectedAnswer: '`min`/`max` select the smallest/largest element using normal ordering. Customize with `key=...`, e.g., `max(items, key=len)` to pick the longest string.',
        explanation: '`key` lets you compare by a derived value without modifying the original data.'
      })
    ];
  }

  if (k === 'tuple - packing and unpacking (including *)') {
    return [
      buildShortAnswer({
        prompt: 'What is tuple unpacking? Give a short example.',
        expectedAnswer: 'Unpacking assigns elements from an iterable into multiple variables by position, e.g., `a, b = (10, 20)` sets `a=10`, `b=20`.',
        explanation: 'It is positional destructuring: the left side pattern must match the iterable shape.'
      }),
      buildShortAnswer({
        prompt: 'What does `*rest` do in extended unpacking (e.g., `first, *mid, last = values`)?',
        expectedAnswer: '`*rest` collects the “remaining” items into a list. Example: `first, *mid, last = [1,2,3,4]` gives `first=1`, `mid=[2,3]`, `last=4`.',
        explanation: 'Extended unpacking solves variable-length sequences without manual slicing.'
      }),
      buildShortAnswer({
        prompt: 'What error occurs if counts do not match during unpacking (without `*`), and what is a common real-world use of unpacking?',
        expectedAnswer: 'You get `ValueError` (“too many values to unpack” / “not enough values to unpack”). Common uses: swapping `a, b = b, a` and iterating pairs `for k, v in d.items()`.',
        explanation: 'Unpacking is frequent in loops, returns, and parsing structured data.'
      })
    ];
  }

  if (k === 'tuple - "tuple comprehension" vs generator') {
    return [
      buildShortAnswer({
        prompt: 'What does `(x*x for x in range(5))` create?',
        expectedAnswer: 'A generator object (lazy iterator), not a tuple.',
        explanation: 'A comprehension-like form inside parentheses produces a generator expression.'
      }),
      buildShortAnswer({
        prompt: 'How do you create a tuple from a generator expression?',
        expectedAnswer: 'Wrap it: `tuple(x*x for x in range(5))`.',
        explanation: '`tuple(...)` consumes the generator and builds a concrete tuple.'
      }),
      buildShortAnswer({
        prompt: 'Give one practical benefit of a generator expression over building a full list/tuple.',
        expectedAnswer: 'It is memory-efficient because it produces items on-demand (streaming), e.g., `sum(x*x for x in data)`.',
        explanation: 'You avoid allocating a large intermediate collection when you only need a single pass.'
      })
    ];
  }

  if (k === 'tuple - program: sum and average') {
    return [
      buildShortAnswer({
        prompt: 'Write a function that returns both the sum and average of a tuple of numbers.',
        expectedAnswer: 'Example:\n\n```python\ndef sum_and_avg(nums):\n    total = sum(nums)\n    avg = total / len(nums)\n    return total, avg\n```',
        explanation: 'Returning `(total, avg)` is natural because functions can return tuples.'
      }),
      buildShortAnswer({
        prompt: 'How do you handle the empty-tuple case to avoid errors?',
        expectedAnswer: 'Guard against `len(nums) == 0` (otherwise you get `ZeroDivisionError`). For example, return `(0, None)` or raise a clear exception.',
        explanation: 'Empty input is a common edge case; decide a consistent contract for your function.'
      }),
      buildShortAnswer({
        prompt: 'If the tuple contains integers, what type is the average and why?',
        expectedAnswer: 'The average is a `float` because `/` performs true division in Python (even for integers).',
        explanation: 'Use `//` only if you specifically want floor division (which changes the meaning of “average”).'
      })
    ];
  }

  if (k === 'tuple vs list (when to use which)') {
    return [
      buildShortAnswer({
        prompt: 'Give the most important semantic difference between a tuple and a list.',
        expectedAnswer: 'Lists are mutable (can be changed in-place); tuples are immutable (cannot reassign elements).',
        explanation: 'Mutability is the key design signal: “this may change” (list) vs “this is fixed” (tuple).' 
      }),
      buildShortAnswer({
        prompt: 'Give two cases where a tuple is the better choice.',
        expectedAnswer: '1) Fixed record-like data (e.g., `(x, y)` coordinates). 2) As a dictionary key / set element when it contains only hashable items.',
        explanation: 'Tuples communicate intent and can be hashable, enabling their use as keys.'
      }),
      buildShortAnswer({
        prompt: 'Give two cases where a list is the better choice.',
        expectedAnswer: '1) When you need to add/remove/reorder items. 2) When you build up a collection incrementally (append/extend) in a loop.',
        explanation: 'Lists are designed for dynamic collections and in-place edits.'
      })
    ];
  }

  if (k === 'set (overview)') {
    return [
      buildShortAnswer({
        prompt: 'What is a set in Python, and what are its two most important properties?',
        expectedAnswer: 'A set is an unordered collection of unique elements. It automatically removes duplicates and supports fast membership tests.',
        explanation: 'Sets model “membership” well: is an element present or not?' 
      }),
      buildShortAnswer({
        prompt: 'Why are sets typically fast for `x in s`, and what is the average time complexity?',
        expectedAnswer: 'Sets are hash-based, so membership is average O(1).',
        explanation: 'Hashing jumps directly to a bucket instead of scanning a sequence.'
      }),
      buildShortAnswer({
        prompt: 'Name one type that cannot be added to a set and explain why.',
        expectedAnswer: 'A list cannot be added because it is unhashable (mutable, no stable hash).',
        explanation: 'Set elements must be hashable so the set can store/find them reliably.'
      })
    ];
  }

  if (k === 'set - creation (and the empty set pitfall)') {
    return [
      buildShortAnswer({
        prompt: 'How do you create an empty set, and what does `{}` create?',
        expectedAnswer: 'Use `set()` for an empty set. `{}` creates an empty dictionary (dict).',
        explanation: 'This is a very common beginner pitfall.'
      }),
      buildShortAnswer({
        prompt: 'Show two ways to create a non-empty set.',
        expectedAnswer: 'Examples: `{1, 2, 3}` and `set([1, 2, 2, 3])`.',
        explanation: 'The constructor accepts any iterable; duplicates are removed.'
      }),
      buildShortAnswer({
        prompt: 'What does `set("banana")` produce, and why?',
        expectedAnswer: "It produces a set of unique characters like `{'b', 'a', 'n'}` because strings are iterables of characters.",
        explanation: 'Sets store unique items, so repeated letters collapse into one.'
      })
    ];
  }

  if (k === 'set - add() vs update() (very important)') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `s.add(x)` and `s.update(iterable)`?',
        expectedAnswer: '`add` inserts exactly one element `x`. `update` iterates over its argument(s) and adds each element produced by the iteration.',
        explanation: 'Think: add one thing vs merge many things.'
      }),
      buildShortAnswer({
        prompt: 'What is the result of `s=set(); s.add("abc")` vs `s=set(); s.update("abc")`?',
        expectedAnswer: '`add("abc")` adds the whole string as one element: `{ "abc" }`. `update("abc")` adds characters: `{ "a", "b", "c" }`.',
        explanation: 'Because `update` iterates over the string character-by-character.'
      }),
      buildShortAnswer({
        prompt: 'Give one example where `add` is correct but `update` would be a bug (or vice versa).',
        expectedAnswer: 'If you want to add a tuple as a single element: `s.add((1, 2))` is correct; `s.update((1, 2))` would add `1` and `2` separately.',
        explanation: 'Use `add` when the value itself is the element; use `update` when the iterable’s items should become elements.'
      })
    ];
  }

  if (k === 'set - copy(), pop(), remove(), discard(), clear()') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `remove(x)` and `discard(x)` on a set?',
        expectedAnswer: '`remove(x)` raises `KeyError` if `x` is missing; `discard(x)` does nothing if `x` is missing.',
        explanation: 'Use `discard` when “missing is OK”; use `remove` when missing should be treated as an error.'
      }),
      buildShortAnswer({
        prompt: 'What does `s.pop()` do for a set `s`, and what happens if the set is empty?',
        expectedAnswer: 'It removes and returns an arbitrary element (sets are unordered). If the set is empty, it raises `KeyError`.',
        explanation: '`pop` is not “pop last” like lists; it removes some element.'
      }),
      buildShortAnswer({
        prompt: 'Explain `s.copy()` vs `s2 = s` for sets.',
        expectedAnswer: '`s.copy()` makes a new set object with the same elements (shallow copy). `s2 = s` is aliasing: both names refer to the same set, so mutations through either name affect the same object.',
        explanation: 'Aliasing vs copying matters a lot when data is shared across functions/modules.'
      })
    ];
  }

  if (k === 'set - mathematical operations (union, intersection, ...)') {
    return [
      buildShortAnswer({
        prompt: 'Name the four common set operations (union, intersection, difference, symmetric difference) and the Python operators for each.',
        expectedAnswer: 'Union: `a | b`, intersection: `a & b`, difference: `a - b`, symmetric difference: `a ^ b`.',
        explanation: 'These operators have method equivalents like `a.union(b)` and `a.intersection(b)`.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `a | b` and `a |= b` for sets?',
        expectedAnswer: '`a | b` returns a new set (does not modify `a`). `a |= b` updates `a` in-place (mutates `a`).',
        explanation: 'In-place operators are convenient but can cause bugs if other code shares the same set reference.'
      }),
      buildShortAnswer({
        prompt: 'How do you check subset/superset relationships and disjointness?',
        expectedAnswer: 'Use `a <= b` / `a.issubset(b)` for subset, `a >= b` / `a.issuperset(b)` for superset, and `a.isdisjoint(b)` to test if they share no elements.',
        explanation: 'Subset checks are common in validation (required permissions, allowed tags, etc.).'
      })
    ];
  }

  if (k === 'set - membership and "no indexing"') {
    return [
      buildShortAnswer({
        prompt: 'Why does a set not support indexing like `s[0]`?',
        expectedAnswer: 'Because sets are unordered collections; there is no stable position for an element.',
        explanation: 'A set is optimized for membership and uniqueness, not for positional access.'
      }),
      buildShortAnswer({
        prompt: 'What is the typical (average) time complexity of `x in s` for a set, and why?',
        expectedAnswer: 'Average O(1) because sets are hash tables and membership uses hashing.',
        explanation: 'Worst-case can degrade with many hash collisions, but typical usage is effectively constant time.'
      }),
      buildShortAnswer({
        prompt: 'If you need deterministic ordering when iterating unique items, what are two common approaches?',
        expectedAnswer: '1) Sort: `for x in sorted(s): ...` 2) Preserve insertion order separately (e.g., build a list while tracking a `seen` set, or use `dict.fromkeys(items)` to deduplicate while preserving order).',
        explanation: 'Pick sorting when you want order by value; pick order-preserving dedupe when you want first-seen order.'
      })
    ];
  }

  if (k === 'set - comprehensions (with examples)') {
    return [
      buildShortAnswer({
        prompt: 'What does a set comprehension like `{x*x for x in range(5)}` produce?',
        expectedAnswer: 'A set of computed values with duplicates removed (unique results only).',
        explanation: 'Even if the expression repeats values, the set keeps only one copy.'
      }),
      buildShortAnswer({
        prompt: 'Why might a set comprehension return fewer elements than the input iterable length?',
        expectedAnswer: 'Because duplicates collapse: if multiple inputs produce the same result, the set stores it once.',
        explanation: 'Example: `{x % 3 for x in range(10)}` yields only `{0, 1, 2}`.'
      }),
      buildShortAnswer({
        prompt: 'Which comprehension syntax creates a dictionary (not a set), and how can you tell?',
        expectedAnswer: 'A dict comprehension uses `key: value`, e.g., `{k: v for k, v in pairs}`. A set comprehension has no colon, e.g., `{v for v in values}`.',
        explanation: 'The colon is the visual signal for dict comprehensions.'
      })
    ];
  }

  if (k === 'set - program: different vowels in a word') {
    return [
      buildShortAnswer({
        prompt: 'Write a function that returns the set of different vowels present in a word (case-insensitive).',
        expectedAnswer: 'Example:\n\n```python\ndef different_vowels(word):\n    vowels = set("aeiou")\n    return set(ch for ch in word.lower() if ch in vowels)\n```',
        explanation: 'Lowercasing normalizes input; the set removes duplicates automatically.'
      }),
      buildShortAnswer({
        prompt: 'How would you return the count of unique vowels as well as the vowels themselves?',
        expectedAnswer: 'Compute the set first, then return both: `v = different_vowels(word); return v, len(v)`.',
        explanation: 'Computing the set once avoids repeated membership work.'
      }),
      buildShortAnswer({
        prompt: 'What is the typical time complexity of this approach in terms of the word length?',
        expectedAnswer: 'O(n) where n is the length of the word (single pass over characters).',
        explanation: 'Set membership for vowels is O(1) average, so the loop dominates.'
      })
    ];
  }

  if (k === 'set - program: remove duplicates from a list') {
    return [
      buildShortAnswer({
        prompt: 'How do you remove duplicates from a list quickly if you do not care about preserving order?',
        expectedAnswer: 'Convert to a set: `unique = list(set(items))` (order is not guaranteed).',
        explanation: 'This is concise and usually fast, but it can reorder the results.'
      }),
      buildShortAnswer({
        prompt: 'How do you remove duplicates while preserving the original order?',
        expectedAnswer: 'Use `dict.fromkeys`: `unique = list(dict.fromkeys(items))` (preserves first-seen order).',
        explanation: 'In modern Python, dicts preserve insertion order, so this is a clean pattern.'
      }),
      buildShortAnswer({
        prompt: 'Explain the time complexity tradeoff of the order-preserving approach.',
        expectedAnswer: 'It is still O(n) average time with O(n) extra space: you do one pass and store seen items in a hash table (dict or set).',
        explanation: 'This is much better than nested loops, which are O(n^2).'
      })
    ];
  }

  if (k === 'set - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Given two lists `a` and `b`, how do you compute (1) common elements and (2) elements only in `a`?',
        expectedAnswer: 'Convert to sets: `sa=set(a); sb=set(b)`. Common: `sa & sb`. Only in a: `sa - sb`.',
        explanation: 'Set operations express the intent directly and are typically faster than nested loops.'
      }),
      buildShortAnswer({
        prompt: 'A beginner writes `s.update("abc")` expecting `{ "abc" }`. What do they get, and what is the correct method?',
        expectedAnswer: 'They get `{ "a", "b", "c" }` because strings iterate by characters. Use `s.add("abc")` to add the whole string as one element.',
        explanation: 'The key rule is: `add` adds one element; `update` iterates.'
      }),
      buildShortAnswer({
        prompt: 'When is it better to keep both a list and a set for the same data?',
        expectedAnswer: 'When you need both order (list) and fast membership/uniqueness checks (set). A common pattern is `seen=set()` and `out=[]` while iterating.',
        explanation: 'A set alone loses ordering; a list alone makes membership checks slow.'
      })
    ];
  }

  if (k === 'dictionary (overview)') {
    return [
      buildShortAnswer({
        prompt: 'What is a dictionary in Python, and what is the basic structure of its data?',
        expectedAnswer: 'A dictionary (`dict`) maps keys to values: `{key: value}` pairs.',
        explanation: 'It is the standard key-value data structure for fast lookup by key.'
      }),
      buildShortAnswer({
        prompt: 'What requirement must a dictionary key satisfy, and why?',
        expectedAnswer: 'Keys must be hashable (stable hash and equality) so the dict can store and find entries reliably.',
        explanation: 'Mutable containers like lists/dicts/sets are not hashable.'
      }),
      buildShortAnswer({
        prompt: 'What is the typical time complexity of `d[key]` lookup and `key in d`?',
        expectedAnswer: 'Average O(1) for both because dicts are hash tables.',
        explanation: 'This is why dicts are widely used for indexing and counting.'
      })
    ];
  }

  if (k === 'dictionary - creating dictionaries') {
    return [
      buildShortAnswer({
        prompt: 'Show three ways to create a dictionary.',
        expectedAnswer: 'Examples: `{}`; `{ "a": 1, "b": 2 }`; `dict([("a", 1), ("b", 2)])`.',
        explanation: 'Use the literal for readability; use `dict(...)` when you already have pairs.'
      }),
      buildShortAnswer({
        prompt: 'How do you build a dictionary from two lists: `keys` and `values`?',
        expectedAnswer: 'Use `zip`: `d = dict(zip(keys, values))`.',
        explanation: '`zip` pairs items positionally; extra items are ignored if lengths differ.'
      }),
      buildShortAnswer({
        prompt: 'What does `dict.fromkeys(keys, 0)` do, and when is it useful?',
        expectedAnswer: 'It creates a dict with each key mapped to the same initial value, e.g. all zeros.',
        explanation: 'Useful for initializing counters or flags for a known set of keys.'
      })
    ];
  }

  if (k === 'dictionary - keys: what is allowed (hashable)') {
    return [
      buildShortAnswer({
        prompt: 'Give three examples of valid dictionary keys and two examples of invalid keys.',
        expectedAnswer: 'Valid: `"name"`, `42`, `(1, "a")` (tuple of hashables). Invalid: `[1, 2]` (list), `{ "a": 1 }` (dict).',
        explanation: 'Validity depends on hashability; mutable containers are not allowed.'
      }),
      buildShortAnswer({
        prompt: 'Why can a tuple be a dictionary key sometimes, but not always?',
        expectedAnswer: 'A tuple is hashable only if all its elements are hashable. `(1, 2)` works; `([1,2], 3)` fails because the list is unhashable.',
        explanation: 'The tuple hash depends on element hashes.'
      }),
      buildShortAnswer({
        prompt: 'What can go wrong if you use an object as a key and then mutate the parts used for hashing?',
        expectedAnswer: 'The key may become unreachable because its hash/equality changes relative to the dict buckets.',
        explanation: 'This is why keys should be effectively immutable with respect to hashing.'
      })
    ];
  }

  if (k === 'dictionary - accessing values ([], in, get)') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `d[key]` and `d.get(key)` when the key is missing?',
        expectedAnswer: '`d[key]` raises `KeyError`. `d.get(key)` returns `None` (or a provided default) and does not raise.',
        explanation: '`get` is safer when missing keys are expected.'
      }),
      buildShortAnswer({
        prompt: 'What does `key in d` test for a dictionary `d`?',
        expectedAnswer: 'It tests membership in keys (not values).',
        explanation: 'Use `value in d.values()` if you truly need a value search (which is O(n)).'
      }),
      buildShortAnswer({
        prompt: 'Show an idiomatic pattern to count occurrences using `get`.',
        expectedAnswer: 'Example:\n\n```python\ncounts = {}\nfor ch in text:\n    counts[ch] = counts.get(ch, 0) + 1\n```',
        explanation: '`get` provides a clean default without a separate if-check.'
      })
    ];
  }

  if (k === 'dictionary - updating entries (assignment, update)') {
    return [
      buildShortAnswer({
        prompt: 'Show two ways to update/add a key in a dictionary: direct assignment and `update()`.',
        expectedAnswer: 'Direct assignment: `d["age"] = 21`. With update: `d.update({"age": 21})`.',
        explanation: 'Both set the key to the value; assignment is most common for a single key.'
      }),
      buildShortAnswer({
        prompt: 'What does `d.update(other)` return, and what happens when keys overlap?',
        expectedAnswer: '`update` returns `None` and mutates `d` in-place. If keys overlap, values from `other` overwrite existing values in `d`.',
        explanation: 'Overwriting behavior is important when merging configs or defaults.'
      }),
      buildShortAnswer({
        prompt: 'In Python 3.9+, how can you merge dictionaries without mutating the original?',
        expectedAnswer: 'Use the union operator: `merged = d1 | d2` (keys in `d2` win on conflict).',
        explanation: 'Use `|=` for in-place merge: `d1 |= d2`.'
      })
    ];
  }

  if (k === 'dictionary - setdefault() (read-or-insert)') {
    return [
      buildShortAnswer({
        prompt: 'What does `d.setdefault(key, default)` do when the key is missing, and what does it return?',
        expectedAnswer: 'If the key is missing, it inserts `key: default` into the dict and returns the inserted value. If the key exists, it returns the existing value.',
        explanation: 'It is a “read-or-insert” helper.'
      }),
      buildShortAnswer({
        prompt: 'Write a one-liner to group names by department using `setdefault`.',
        expectedAnswer: 'Example:\n\n```python\ngroups = {}\nfor name, dept in rows:\n    groups.setdefault(dept, []).append(name)\n```',
        explanation: 'The list is created only for departments that appear.'
      }),
      buildShortAnswer({
        prompt: 'When might `collections.defaultdict(list)` be preferable to `setdefault`?',
        expectedAnswer: 'When you are doing many “grouping” insertions and want cleaner code: `groups = defaultdict(list)` and then `groups[dept].append(name)`.',
        explanation: '`defaultdict` centralizes the default-creation logic.'
      })
    ];
  }

  if (k === 'dictionary - deleting entries (del, pop, popitem, clear)') {
    return [
      buildShortAnswer({
        prompt: 'Compare `del d[key]` and `d.pop(key)` when the key is missing.',
        expectedAnswer: '`del d[key]` raises `KeyError` if missing. `d.pop(key)` also raises `KeyError` unless you provide a default: `d.pop(key, None)`.',
        explanation: '`pop` can be used safely with a default for optional keys.'
      }),
      buildShortAnswer({
        prompt: 'What does `popitem()` do and when is it useful?',
        expectedAnswer: '`d.popitem()` removes and returns a `(key, value)` pair. In modern Python it removes the last inserted item (LIFO). Useful for implementing simple stack-like consumption or cache eviction.',
        explanation: 'It is a fast way to remove an arbitrary/last item without specifying a key.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `d.clear()` and `del d`?',
        expectedAnswer: '`d.clear()` empties the existing dictionary object in-place. `del d` deletes the variable binding (the name), not necessarily the object if other references exist.',
        explanation: 'Choose `clear()` when other references should see an emptied dict.'
      })
    ];
  }

  if (k === 'dictionary - iteration (keys, values, items)') {
    return [
      buildShortAnswer({
        prompt: 'When you loop `for x in d:`, what do you get by default?',
        expectedAnswer: 'You get keys by default (same as iterating `d.keys()`).',
        explanation: 'Use `for k, v in d.items():` to iterate key-value pairs.'
      }),
      buildShortAnswer({
        prompt: 'What do `d.keys()`, `d.values()`, and `d.items()` return?',
        expectedAnswer: 'They return dynamic view objects: keys view, values view, and items view (pairs).',
        explanation: 'Views reflect changes in the dictionary.'
      }),
      buildShortAnswer({
        prompt: 'Why is it unsafe to change a dictionary’s size while iterating it, and what is a safe pattern if you must modify?',
        expectedAnswer: 'Mutating dict size during iteration can raise `RuntimeError` or skip items. Safe pattern: iterate over a snapshot like `for k in list(d): ...` or build a new dict.',
        explanation: 'Snapshot iteration separates reading from mutation.'
      })
    ];
  }

  if (k === 'dictionary - copy() and nested dictionaries (shallow copy)') {
    return [
      buildShortAnswer({
        prompt: 'What does `dict.copy()` do for a dictionary that contains nested mutable objects?',
        expectedAnswer: 'It makes a shallow copy: the outer dict is new, but nested mutable values (like inner dicts/lists) are shared references.',
        explanation: 'Mutating a nested object affects both dictionaries.'
      }),
      buildShortAnswer({
        prompt: 'Given `d1 = {"a": {"x": 1}}; d2 = d1.copy()`, what happens after `d2["a"]["x"] = 99`?',
        expectedAnswer: '`d1["a"]["x"]` also becomes `99` because the inner dict is shared in a shallow copy.',
        explanation: 'Shallow copy duplicates only the top-level mapping.'
      }),
      buildShortAnswer({
        prompt: 'How do you make an actual deep copy of a nested dictionary?',
        expectedAnswer: 'Use `copy.deepcopy(d)` (after `import copy`).',
        explanation: 'Deep copy recursively copies nested objects.'
      })
    ];
  }

  if (k === 'dictionary - program: store students and percentages') {
    return [
      buildShortAnswer({
        prompt: 'Write a small program that stores student name -> percentage in a dictionary from a list of (name, scored, total) tuples.',
        expectedAnswer: 'Example:\n\n```python\nrecords = [("Asha", 45, 50), ("Ben", 72, 80)]\nperc = {}\nfor name, scored, total in records:\n    perc[name] = round((scored / total) * 100, 2)\n```',
        explanation: 'Compute percentage per student and store by name as the key.'
      }),
      buildShortAnswer({
        prompt: 'What input validations are important for this program?',
        expectedAnswer: 'Ensure `total` is not 0, ensure `scored` and `total` are numbers, and optionally validate `0 <= scored <= total`.',
        explanation: 'This prevents `ZeroDivisionError` and unrealistic percentages.'
      }),
      buildShortAnswer({
        prompt: 'If two records have the same student name, what happens and how can you handle it?',
        expectedAnswer: 'A later assignment overwrites the previous value. You can reject duplicates (`if name in perc: ...`) or store a list of attempts per student.',
        explanation: 'The right choice depends on the business requirement.'
      })
    ];
  }

  if (k === 'dictionary - program: sum of values (safe input)') {
    return [
      buildShortAnswer({
        prompt: 'Given a dictionary of values, how do you compute the sum of numeric values only (ignore non-numeric)?',
        expectedAnswer: 'Example:\n\n```python\ntotal = 0\nfor v in d.values():\n    try:\n        total += float(v)\n    except (TypeError, ValueError):\n        pass\n```',
        explanation: 'This safely skips values that cannot be converted to numbers.'
      }),
      buildShortAnswer({
        prompt: 'If the dict values are guaranteed numeric, what is the most direct way to sum them?',
        expectedAnswer: 'Use `sum(d.values())`.',
        explanation: '`sum` is concise and fast when types are consistent.'
      }),
      buildShortAnswer({
        prompt: 'Why is using `int(v)` sometimes risky compared to `float(v)` when parsing input?',
        expectedAnswer: '`int("2.5")` raises `ValueError`, while `float("2.5")` works. Real input may include decimals.',
        explanation: 'Choose parsing based on expected input format.'
      })
    ];
  }

  if (k === 'dictionary - program: count letter frequency') {
    return [
      buildShortAnswer({
        prompt: 'Write code to count frequency of each letter in a string (case-insensitive, ignore non-letters).',
        expectedAnswer: 'Example:\n\n```python\ncounts = {}\nfor ch in text.casefold():\n    if not ch.isalpha():\n        continue\n    counts[ch] = counts.get(ch, 0) + 1\n```',
        explanation: '`casefold()` normalizes case; `isalpha()` filters letters.'
      }),
      buildShortAnswer({
        prompt: 'What is the time complexity of building this frequency dictionary in terms of input length n?',
        expectedAnswer: 'O(n) time and O(k) space where k is the number of distinct letters.',
        explanation: 'You do one pass; dict updates are O(1) average.'
      }),
      buildShortAnswer({
        prompt: 'How can you print the results in alphabetical order of letters?',
        expectedAnswer: 'Iterate `for ch in sorted(counts): print(ch, counts[ch])`.',
        explanation: 'Sorting keys gives deterministic output.'
      })
    ];
  }

  if (k === 'dictionary - program: count vowels (sorted output)') {
    return [
      buildShortAnswer({
        prompt: 'Write code that counts vowels in a string and prints them in `a, e, i, o, u` order.',
        expectedAnswer: 'Example:\n\n```python\nvowels = "aeiou"\ncounts = dict.fromkeys(vowels, 0)\nfor ch in text.casefold():\n    if ch in counts:\n        counts[ch] += 1\nfor v in vowels:\n    print(v, counts[v])\n```',
        explanation: 'Initialize all vowels to 0 so missing vowels still appear in output.'
      }),
      buildShortAnswer({
        prompt: 'Why is `dict.fromkeys("aeiou", 0)` safe here even though all keys share the same value object?',
        expectedAnswer: 'Because `0` is immutable; sharing the same integer object has no mutation risk.',
        explanation: 'The shared-mutable pitfall applies to lists/dicts, not immutable numbers.'
      }),
      buildShortAnswer({
        prompt: 'If you want only vowels that actually appear (skip zeros), what change would you make?',
        expectedAnswer: 'Print only where count > 0: `if counts[v] > 0: print(v, counts[v])`.',
        explanation: 'This filters the output based on computed counts.'
      })
    ];
  }

  if (k === 'dictionary - program: student marks lookup (loop + get)') {
    return [
      buildShortAnswer({
        prompt: 'Write a loop that repeatedly asks for a student name and prints marks using a dictionary. Stop on input "exit".',
        expectedAnswer: 'Example:\n\n```python\nmarks = {"asha": 90, "ben": 0}\nwhile True:\n    name = input("Name: ").strip().casefold()\n    if name == "exit":\n        break\n    if name in marks:\n        print(marks[name])\n    else:\n        print("Not found")\n```',
        explanation: 'Use `in` when 0 is a valid value and you must distinguish missing from falsy.'
      }),
      buildShortAnswer({
        prompt: 'Why is `print(marks.get(name) or "Not found")` sometimes incorrect?',
        expectedAnswer: 'If a valid mark is `0`, `marks.get(name)` returns 0 which is falsy, so `or` prints "Not found" incorrectly.',
        explanation: 'Use `if name in marks` or a sentinel default.'
      }),
      buildShortAnswer({
        prompt: 'Show a safe `get`-based pattern that distinguishes missing keys from a 0 value.',
        expectedAnswer: 'Use a sentinel:\n\n```python\nmissing = object()\nval = marks.get(name, missing)\nif val is missing:\n    print("Not found")\nelse:\n    print(val)\n```',
        explanation: 'A unique sentinel avoids conflating missing keys with real values.'
      })
    ];
  }

  if (k === 'dictionary - dictionary comprehension') {
    return [
      buildShortAnswer({
        prompt: 'What is the general syntax of a dictionary comprehension? Give a small example.',
        expectedAnswer: 'Syntax: `{key_expr: value_expr for x in iterable}`. Example: `{n: n*n for n in range(5)}`.',
        explanation: 'The colon `:` is what makes it a dict comprehension (unlike set/list comprehensions).'
      }),
      buildShortAnswer({
        prompt: 'If two items in a dict comprehension produce the same key, what happens?',
        expectedAnswer: 'The later value overwrites the earlier one because dict keys are unique.',
        explanation: 'This is important when transforming data where collisions are possible.'
      }),
      buildShortAnswer({
        prompt: 'Write a dict comprehension that keeps only items from `d` with values >= 10.',
        expectedAnswer: 'Example: `{k: v for k, v in d.items() if v >= 10}`.',
        explanation: 'Use `d.items()` to access both keys and values.'
      })
    ];
  }

  if (k === 'dictionary - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Given two dicts `a` and `b`, how do you build a new dict containing only keys present in both, keeping values from `b`?',
        expectedAnswer: 'Example:\n\n```python\nout = {k: b[k] for k in a.keys() & b.keys()}\n```',
        explanation: 'Intersect keys with `&` (set operation on dict key views) then build a dict.'
      }),
      buildShortAnswer({
        prompt: 'Write code to count word frequency from a list of words using `get`.',
        expectedAnswer: 'Example:\n\n```python\ncounts = {}\nfor w in words:\n    w = w.strip().casefold()\n    if not w:\n        continue\n    counts[w] = counts.get(w, 0) + 1\n```',
        explanation: 'Normalize input so "Apple" and "apple" count as the same word.'
      }),
      buildShortAnswer({
        prompt: 'When do you prefer `in` over `get` when reading a dict value?',
        expectedAnswer: 'Prefer `in` when missing vs falsy values must be distinguished (e.g., 0 is valid): `if key in d: ...`.',
        explanation: '`get` is great, but `get(key) or default` can mis-handle falsy-but-valid values.'
      })
    ];
  }

  if (k === 'functions (overview)') {
    return [
      buildShortAnswer({
        prompt: 'What is a function in Python and why do we use functions?',
        expectedAnswer: 'A function is a named, reusable block of code that can take inputs (parameters) and return an output. We use functions to avoid repetition and to make code easier to test and maintain.',
        explanation: 'Functions let you express “what” you want to do at a higher level.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `print()` inside a function and `return` from a function?',
        expectedAnswer: '`print()` displays output to the console, while `return` sends a value back to the caller so it can be used in further computation.',
        explanation: 'A function can return a value without printing anything.'
      }),
      buildShortAnswer({
        prompt: 'What is scope in the context of functions (local vs global)?',
        expectedAnswer: 'Variables defined inside a function are local by default and cannot be accessed outside. Global variables live outside functions and can be read inside, but assignment creates a new local unless you use `global`.',
        explanation: 'Understanding scope prevents bugs where you think you updated a global but only changed a local.'
      })
    ];
  }

  if (k === 'functions - creating functions (def, docstring)') {
    return [
      buildShortAnswer({
        prompt: 'Write a function `add(a, b)` with a one-line docstring that returns the sum.',
        expectedAnswer: 'Example:\n\n```python\ndef add(a, b):\n    """Return the sum of a and b."""\n    return a + b\n```',
        explanation: 'Docstrings describe what the function does; `return` provides the output.'
      }),
      buildShortAnswer({
        prompt: 'What is a docstring, and how is it different from a comment?',
        expectedAnswer: 'A docstring is a string literal placed as the first statement in a function/class/module; it is stored in `__doc__` and used by `help()`. A comment is ignored by Python at runtime.',
        explanation: 'Docstrings are part of the object metadata; comments are not.'
      }),
      buildShortAnswer({
        prompt: 'How do you quickly view a function’s docstring in Python?',
        expectedAnswer: 'Use `help(func)` or print `func.__doc__`.',
        explanation: '`help` formats the documentation nicely.'
      })
    ];
  }

  if (k === 'functions - parameters vs arguments') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between parameters and arguments?',
        expectedAnswer: 'Parameters are names in the function definition; arguments are the actual values passed when calling the function.',
        explanation: 'Example: in `def f(x): ...`, `x` is a parameter; in `f(10)`, `10` is an argument.'
      }),
      buildShortAnswer({
        prompt: 'In `def greet(name, msg): ...` and the call `greet("Asha", "Hi")`, list parameters and arguments.',
        expectedAnswer: 'Parameters: `name`, `msg`. Arguments: `"Asha"`, `"Hi"`.',
        explanation: 'Same positions, but the terminology is different for definition vs call.'
      }),
      buildShortAnswer({
        prompt: 'Why do keyword arguments often improve readability?',
        expectedAnswer: 'They make it clear which parameter each value belongs to, especially when there are many parameters: `send(email="a@x.com", retry=3)`.',
        explanation: 'This reduces mistakes from mis-ordered positional arguments.'
      })
    ];
  }

  if (k === 'functions - returning values (and none default)') {
    return [
      buildShortAnswer({
        prompt: 'What does a Python function return if it has no `return` statement?',
        expectedAnswer: 'It returns `None` implicitly.',
        explanation: 'Even “procedures” in Python still return a value: `None`.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `return` and `return None`?',
        expectedAnswer: 'No functional difference: both return `None`.',
        explanation: 'Use `return` for early exit; use `return None` only if it improves clarity.'
      }),
      buildShortAnswer({
        prompt: 'Why is it a common bug to forget to return a value from a function?',
        expectedAnswer: 'The caller may expect a real value, but gets `None` and then fails later (e.g., `TypeError` when doing math with `None`).',
        explanation: 'Always design functions with clear return behavior and test the return value.'
      })
    ];
  }

  if (k === 'functions - program: even or odd') {
    return [
      buildShortAnswer({
        prompt: 'Write a function `is_even(n)` that returns `True` for even numbers and `False` for odd numbers.',
        expectedAnswer: 'Example:\n\n```python\ndef is_even(n):\n    return n % 2 == 0\n```',
        explanation: '`n % 2` computes the remainder when dividing by 2.'
      }),
      buildShortAnswer({
        prompt: 'How would you handle user input so the function receives an integer?',
        expectedAnswer: 'Read string input and convert: `n = int(input())` (optionally inside try/except).',
        explanation: 'Validation avoids crashing on non-integer input.'
      }),
      buildShortAnswer({
        prompt: 'Give two quick test cases (inputs and expected outputs) for `is_even`.',
        expectedAnswer: '`is_even(0) -> True`, `is_even(7) -> False` (also test negative numbers like `-4 -> True`).',
        explanation: 'Testing 0 and negatives catches common edge cases.'
      })
    ];
  }

  if (k === 'functions - program: factorial (iterative)') {
    return [
      buildShortAnswer({
        prompt: 'Write an iterative function `factorial(n)` that returns n! for n >= 0.',
        expectedAnswer: 'Example:\n\n```python\ndef factorial(n):\n    if n < 0:\n        raise ValueError("n must be >= 0")\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n```',
        explanation: 'The loop multiplies numbers 2..n; 0! and 1! remain 1.'
      }),
      buildShortAnswer({
        prompt: 'What are the correct values of 0! and 1!, and why?',
        expectedAnswer: '0! = 1 and 1! = 1 by definition (empty product and base case).',
        explanation: 'These base cases make many combinatorics formulas work consistently.'
      }),
      buildShortAnswer({
        prompt: 'What is the time complexity of the iterative factorial algorithm?',
        expectedAnswer: 'O(n) multiplications.',
        explanation: 'The loop runs from 2 to n once.'
      })
    ];
  }

  if (k === 'functions - returning multiple values') {
    return [
      buildShortAnswer({
        prompt: 'How can a function return multiple values in Python?',
        expectedAnswer: 'By returning a tuple (packing): `return a, b`.',
        explanation: 'The caller can unpack: `x, y = func()`.'
      }),
      buildShortAnswer({
        prompt: 'Write a function that returns both min and max of a list of numbers.',
        expectedAnswer: 'Example:\n\n```python\ndef min_max(nums):\n    return min(nums), max(nums)\n```',
        explanation: 'The function returns a 2-tuple.'
      }),
      buildShortAnswer({
        prompt: 'If you do `result = min_max(nums)`, what is the type of `result`?',
        expectedAnswer: 'It is a tuple.',
        explanation: 'Multiple values are bundled into a tuple when assigned to one variable.'
      })
    ];
  }

  if (k === 'functions - argument types (positional, keyword)') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between positional arguments and keyword arguments?',
        expectedAnswer: 'Positional arguments are matched by position in the call; keyword arguments are matched by parameter name.',
        explanation: 'Keyword arguments improve clarity and reduce ordering mistakes.'
      }),
      buildShortAnswer({
        prompt: 'Given `def f(a, b, c): ...`, show one positional call and one keyword call.',
        expectedAnswer: 'Positional: `f(1, 2, 3)`. Keyword: `f(a=1, b=2, c=3)`.',
        explanation: 'You can also mix, but positional must come before keywords.'
      }),
      buildShortAnswer({
        prompt: 'Why is `f(a=1, 2, 3)` invalid in Python?',
        expectedAnswer: 'Because positional arguments cannot follow keyword arguments in a function call.',
        explanation: 'Once you start using keywords in a call, the remaining arguments must be keyword arguments too.'
      })
    ];
  }

  if (k === 'functions - default arguments (and common pitfalls)') {
    return [
      buildShortAnswer({
        prompt: 'What is a default argument in Python? Give a quick example.',
        expectedAnswer: 'A default argument provides a value when the caller does not pass one. Example: `def greet(name, msg="Hi"): return f"{msg} {name}"`.',
        explanation: 'Call `greet("Asha")` uses the default; `greet("Asha", "Hello")` overrides it.'
      }),
      buildShortAnswer({
        prompt: 'What is the classic mutable-default-argument bug? Show the wrong code and a correct fix.',
        expectedAnswer: 'Wrong:\n\n```python\ndef add_item(x, items=[]):\n    items.append(x)\n    return items\n```\n\nFix:\n\n```python\ndef add_item(x, items=None):\n    if items is None:\n        items = []\n    items.append(x)\n    return items\n```',
        explanation: 'Mutable defaults are created once at function definition time, so they get reused across calls.'
      }),
      buildShortAnswer({
        prompt: 'When are default argument expressions evaluated: at call time or at function definition time?',
        expectedAnswer: 'At function definition time.',
        explanation: 'That is why mutable defaults (like `[]` or `{}`) are dangerous.'
      })
    ];
  }

  if (k === 'functions - variable-length arguments (*args)') {
    return [
      buildShortAnswer({
        prompt: 'What does `*args` mean in a function definition?',
        expectedAnswer: '`*args` collects extra positional arguments into a tuple.',
        explanation: 'It lets a function accept any number of positional arguments.'
      }),
      buildShortAnswer({
        prompt: 'Write a function `sum_all(*args)` that returns the sum of all numeric positional arguments.',
        expectedAnswer: 'Example:\n\n```python\ndef sum_all(*args):\n    total = 0\n    for x in args:\n        total += x\n    return total\n```',
        explanation: '`args` is a tuple; you can iterate it like any sequence.'
      }),
      buildShortAnswer({
        prompt: 'How do you pass a list of numbers to `sum_all` as separate arguments?',
        expectedAnswer: 'Use unpacking: `sum_all(*nums)`.',
        explanation: '`*` in a call expands a sequence into positional arguments.'
      })
    ];
  }

  if (k === 'functions - keyword-only parameters (after *)') {
    return [
      buildShortAnswer({
        prompt: 'What is a keyword-only parameter and how do you define it?',
        expectedAnswer: 'A keyword-only parameter must be passed by name. Define it by putting `*` in the signature: `def f(a, *, retry=3): ...`.',
        explanation: 'After `*`, all parameters are keyword-only unless captured by `**kwargs`.'
      }),
      buildShortAnswer({
        prompt: 'Given `def connect(host, *, timeout=5): ...`, show a valid call and an invalid call.',
        expectedAnswer: 'Valid: `connect("example.com", timeout=10)`. Invalid: `connect("example.com", 10)`.',
        explanation: 'The invalid call tries to pass `timeout` positionally.'
      }),
      buildShortAnswer({
        prompt: 'Why are keyword-only parameters useful in real code?',
        expectedAnswer: 'They make calls self-documenting and prevent accidental mis-ordering for optional settings (timeouts, retries, flags).',
        explanation: 'This is especially helpful when a function has many optional parameters.'
      })
    ];
  }

  if (k === 'functions - keyword varargs (**kwargs)') {
    return [
      buildShortAnswer({
        prompt: 'What does `**kwargs` mean in a function definition?',
        expectedAnswer: '`**kwargs` collects extra keyword arguments into a dictionary.',
        explanation: 'It lets the function accept arbitrary named options.'
      }),
      buildShortAnswer({
        prompt: 'Write a function `show(**kwargs)` that prints all key-value pairs in sorted key order.',
        expectedAnswer: 'Example:\n\n```python\ndef show(**kwargs):\n    for k in sorted(kwargs):\n        print(k, kwargs[k])\n```',
        explanation: 'Sorting keys makes output deterministic.'
      }),
      buildShortAnswer({
        prompt: 'How do you pass an existing dictionary as keyword arguments to a function?',
        expectedAnswer: 'Use unpacking: `func(**options)`.',
        explanation: '`**` in a call expands a dict into keyword arguments.'
      })
    ];
  }

  if (k === 'functions - mini case study (argument rules)') {
    return [
      buildShortAnswer({
        prompt: 'In a function call, what is the rule about ordering positional and keyword arguments?',
        expectedAnswer: 'All positional arguments must come before any keyword arguments.',
        explanation: 'This avoids ambiguity in mapping values to parameters.'
      }),
      buildShortAnswer({
        prompt: 'Given `def f(a, b=2, *args, c, **kwargs): ...`, identify which parameters are keyword-only.',
        expectedAnswer: '`c` is keyword-only (it appears after `*args`).',
        explanation: 'Parameters after `*args` are keyword-only unless captured by `**kwargs`.'
      }),
      buildShortAnswer({
        prompt: 'Give one valid call and one invalid call for `def f(a, *, c): ...`.',
        expectedAnswer: 'Valid: `f(1, c=3)`. Invalid: `f(1, 3)`.',
        explanation: '`c` must be provided as a keyword argument.'
      })
    ];
  }

  if (k === 'functions - function vs module vs library') {
    return [
      buildShortAnswer({
        prompt: 'Define function, module, and library (one line each).',
        expectedAnswer: 'Function: reusable block of code. Module: a Python file (`.py`) that can define functions/classes/variables. Library: a collection of modules/packages providing functionality (often installed or part of the standard library).',
        explanation: 'A library can be the Python standard library or third-party.'
      }),
      buildShortAnswer({
        prompt: 'Give an example of importing a module and calling a function from it.',
        expectedAnswer: 'Example:\n\n```python\nimport math\nprint(math.sqrt(9))\n```',
        explanation: '`math` is a module in the standard library; `sqrt` is a function inside it.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `import math` and `from math import sqrt`?',
        expectedAnswer: '`import math` requires `math.sqrt(...)`. `from math import sqrt` lets you call `sqrt(...)` directly in the current namespace.',
        explanation: 'Explicit module names (`math.sqrt`) often improve readability.'
      })
    ];
  }

  if (k === 'functions - scope: global vs local') {
    return [
      buildShortAnswer({
        prompt: 'If you assign to a variable name inside a function, is it local or global by default?',
        expectedAnswer: 'Local by default.',
        explanation: 'Assignment in a function creates a local variable unless `global` or `nonlocal` is used.'
      }),
      buildShortAnswer({
        prompt: 'Why can this raise `UnboundLocalError`?\n\n```python\nx = 10\ndef f():\n    print(x)\n    x = 5\n```',
        expectedAnswer: 'Because `x = 5` makes `x` local in `f`, so `print(x)` tries to read the local `x` before it is assigned.',
        explanation: 'Python decides scope at compile time based on assignments.'
      }),
      buildShortAnswer({
        prompt: 'What does LEGB stand for in Python name lookup?',
        expectedAnswer: 'Local, Enclosing, Global, Built-in.',
        explanation: 'Python searches these scopes in order when resolving a name.'
      })
    ];
  }

  if (k === 'functions - global keyword (when you must modify)') {
    return [
      buildShortAnswer({
        prompt: 'What does the `global` keyword do inside a function?',
        expectedAnswer: 'It tells Python that assignments to a name refer to the global variable, not a new local.',
        explanation: 'It affects binding (assignment), not simple reading.'
      }),
      buildShortAnswer({
        prompt: 'Give a small example where `global` is required to modify a global counter.',
        expectedAnswer: 'Example:\n\n```python\ncount = 0\ndef inc():\n    global count\n    count += 1\n```',
        explanation: 'Without `global`, `count += 1` would try to modify a local `count`.'
      }),
      buildShortAnswer({
        prompt: 'What is usually a better alternative to using `global` in most programs?',
        expectedAnswer: 'Return the updated value and store it outside, or store state in an object and update attributes.',
        explanation: 'Avoiding globals makes code easier to test and reason about.'
      })
    ];
  }

  if (k === 'functions - recursion (with factorial)') {
    return [
      buildShortAnswer({
        prompt: 'What is recursion?',
        expectedAnswer: 'Recursion is when a function calls itself to solve a problem by reducing it to smaller subproblems.',
        explanation: 'A correct recursive function needs a base case to stop.'
      }),
      buildShortAnswer({
        prompt: 'Write a recursive factorial function with a correct base case.',
        expectedAnswer: 'Example:\n\n```python\ndef fact(n):\n    if n < 0:\n        raise ValueError\n    if n in (0, 1):\n        return 1\n    return n * fact(n - 1)\n```',
        explanation: 'The base case prevents infinite recursion.'
      }),
      buildShortAnswer({
        prompt: 'Why is recursion sometimes risky in Python for large inputs?',
        expectedAnswer: 'Deep recursion can hit Python’s recursion limit and cause `RecursionError`.',
        explanation: 'Iteration is often safer for very deep repetition.'
      })
    ];
  }

  if (k === 'functions - lambda (anonymous) functions') {
    return [
      buildShortAnswer({
        prompt: 'What is a lambda function in Python?',
        expectedAnswer: 'A small anonymous function written as `lambda args: expression`.',
        explanation: 'It can only contain an expression (not multiple statements).' 
      }),
      buildShortAnswer({
        prompt: 'Give an example of using a lambda as a `key` in `sorted`.',
        expectedAnswer: 'Example: `sorted(words, key=lambda w: len(w))` sorts by length.',
        explanation: 'Lambdas are common for short “key” functions.'
      }),
      buildShortAnswer({
        prompt: 'When should you prefer `def` over `lambda`?',
        expectedAnswer: 'Prefer `def` when the function is non-trivial, needs a docstring, or will be reused; `def` is more readable.',
        explanation: 'Use lambda for short, one-off expressions.'
      })
    ];
  }

  if (k === 'functions - filter(), map(), reduce() (with lambdas)') {
    return [
      buildShortAnswer({
        prompt: 'In Python 3, what do `map(...)` and `filter(...)` return, and why can that matter in debugging?',
        expectedAnswer: 'They return iterators (lazy objects), not lists. If you print them you see something like `<map object ...>`, and they can be consumed only once unless you recreate them.',
        explanation: 'Wrap with `list(...)` to materialize results when needed.'
      }),
      buildShortAnswer({
        prompt: 'Given `nums = [1, 2, 3, 4, 5]`, produce `[4, 16]` using `filter` + `map` with lambdas.',
        expectedAnswer: 'Example:\n\n```python\nnums = [1, 2, 3, 4, 5]\nout = list(map(lambda x: x*x, filter(lambda x: x % 2 == 0, nums)))\nprint(out)  # [4, 16]\n```',
        explanation: '`filter` keeps evens; `map` squares; `list(...)` materializes the iterator.'
      }),
      buildShortAnswer({
        prompt: 'How do you use `reduce` to compute the product of a list, and what initializer would you use to handle an empty list?',
        expectedAnswer: 'Example:\n\n```python\nfrom functools import reduce\nnums = [2, 3, 4]\nprod = reduce(lambda acc, x: acc * x, nums, 1)\n```\n\nInitializer `1` makes the empty-list product return 1 instead of raising an error.',
        explanation: '`reduce` lives in `functools` in Python 3; the initializer prevents `TypeError` on empty input.'
      })
    ];
  }

  if (k === 'functions - functions are objects (aliasing)') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `f` and `f()` in Python, and how does that relate to “functions are objects”?',
        expectedAnswer: '`f` refers to the function object; `f()` calls it and produces its return value. Because functions are objects, you can assign them to variables, pass them around, and store them in data structures.',
        explanation: 'Mistaking `f` for `f()` is a common source of bugs when passing callbacks.'
      }),
      buildShortAnswer({
        prompt: 'Write a function `apply(fn, x)` that calls the function argument on `x`, and show calling it with both a named function and a lambda.',
        expectedAnswer: 'Example:\n\n```python\ndef apply(fn, x):\n    return fn(x)\n\ndef square(n):\n    return n * n\n\nprint(apply(square, 5))\nprint(apply(lambda n: n + 1, 5))\n```',
        explanation: 'Passing callables enables flexible and reusable code.'
      }),
      buildShortAnswer({
        prompt: 'Create an `ops` dictionary that maps strings to functions for basic arithmetic and use it to evaluate `"mul"` for inputs 3 and 4.',
        expectedAnswer: 'Example:\n\n```python\ndef add(a, b): return a + b\ndef mul(a, b): return a * b\n\nops = {"add": add, "mul": mul}\nprint(ops["mul"](3, 4))  # 12\n```',
        explanation: 'A dict-of-functions is a simple strategy/dispatch pattern.'
      })
    ];
  }

  if (k === 'functions - nested functions and returning functions') {
    return [
      buildShortAnswer({
        prompt: 'What is a closure? Give an example using a function that returns another function.',
        expectedAnswer: 'A closure is a function that “remembers” values from its enclosing scope. Example:\n\n```python\ndef make_multiplier(n):\n    def mul(x):\n        return x * n\n    return mul\n\ntimes3 = make_multiplier(3)\nprint(times3(10))  # 30\n```',
        explanation: '`mul` closes over `n` from the outer function.'
      }),
      buildShortAnswer({
        prompt: 'Why does this code raise an error, and how do you fix it?\n\n```python\ndef outer():\n    x = 0\n    def inc():\n        x += 1\n        return x\n    return inc\n```',
        expectedAnswer: 'It raises `UnboundLocalError` because assigning to `x` makes it local in `inc`. Fix with `nonlocal x`:\n\n```python\ndef outer():\n    x = 0\n    def inc():\n        nonlocal x\n        x += 1\n        return x\n    return inc\n```',
        explanation: '`nonlocal` rebinds the variable in the enclosing function scope.'
      }),
      buildShortAnswer({
        prompt: 'What is the “late binding” pitfall when creating functions in a loop, and show one correct fix.',
        expectedAnswer: 'Pitfall: all returned functions may capture the same loop variable value. Fix by binding a default:\n\n```python\nfuncs = []\nfor i in range(3):\n    funcs.append(lambda x, i=i: x + i)\n```',
        explanation: 'Default arguments are evaluated at function definition time, capturing the current `i`.'
      })
    ];
  }

  if (k === 'functions - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Write `transform(nums, keep, map_fn)` that keeps items where `keep(x)` is True and then applies `map_fn(x)` to them (return a list).',
        expectedAnswer: 'Example:\n\n```python\ndef transform(nums, keep, map_fn):\n    return [map_fn(x) for x in nums if keep(x)]\n```\n\n(or with `filter` + `map` and `list(...)`).',
        explanation: 'This combines “functions as objects” with basic functional-style pipelines.'
      }),
      buildShortAnswer({
        prompt: 'You have `m = map(lambda x: x*2, [1,2,3])`. What does `list(m)` produce, and what does a second `list(m)` produce?',
        expectedAnswer: 'First `list(m)` produces `[2, 4, 6]`. The second `list(m)` produces `[]` because the iterator has been exhausted.',
        explanation: 'Iterators are single-pass; recreate `map(...)` if you need to iterate again.'
      }),
      buildShortAnswer({
        prompt: 'When would you choose a list comprehension over `map`/`filter` in Python, and why?',
        expectedAnswer: 'Often for readability and debuggability. List comprehensions are idiomatic Python, make the logic visible in one place, and avoid nested lambdas.',
        explanation: '`map`/`filter` can still be fine when you already have a named function or want lazy iteration.'
      })
    ];
  }

  if (k === 'modules (overview)') {
    return [
      buildShortAnswer({
        prompt: 'What is a module in Python, and what is a package?',
        expectedAnswer: 'A module is a single `.py` file. A package is a directory of modules (typically with an `__init__.py`) that can be imported as a namespace.',
        explanation: 'Packages help organize larger codebases into namespaces.'
      }),
      buildShortAnswer({
        prompt: 'What does `if __name__ == "__main__":` mean, and why is it useful?',
        expectedAnswer: 'It runs code only when the file is executed as a script, not when it is imported as a module.',
        explanation: 'It prevents import-time side effects and supports reuse + CLI execution.'
      }),
      buildShortAnswer({
        prompt: 'When you `import module`, does Python run the module code every time? Explain briefly.',
        expectedAnswer: 'No. On the first import, Python executes the module and caches it in `sys.modules`. Subsequent imports reuse the cached module object (unless you explicitly reload).',
        explanation: 'This is why import-time side effects happen once per process (normally).'
      })
    ];
  }

  if (k === 'modules - create your own module (example)') {
    return [
      buildShortAnswer({
        prompt: 'Create a simple module `mymath.py` with `add(a, b)` and show how to import and use it from `main.py`.',
        expectedAnswer: 'Example:\n\n```python\n# mymath.py\ndef add(a, b):\n    return a + b\n\n# main.py\nimport mymath\nprint(mymath.add(2, 3))\n```',
        explanation: 'The module name comes from the filename (`mymath.py` → `import mymath`).'
      }),
      buildShortAnswer({
        prompt: 'If you get `ModuleNotFoundError` when importing your own module, name one common cause and one fix.',
        expectedAnswer: 'Common cause: the module file is not on `sys.path` (wrong folder). Fix: run the script from the project root, ensure the file is in the same directory as the script, or install the package properly.',
        explanation: 'Python searches for modules using the directories listed in `sys.path`.'
      }),
      buildShortAnswer({
        prompt: 'Why is it usually a bad idea for a module to execute “real work” at import time?',
        expectedAnswer: 'Because importing should be safe and fast; import-time side effects (network calls, DB writes, prints) make code unpredictable and can break reuse/tests.',
        explanation: 'Put executable logic behind functions or a `__main__` guard.'
      })
    ];
  }

  if (k === 'modules - import and access members') {
    return [
      buildShortAnswer({
        prompt: 'Given `import math`, how do you access `sqrt` and `pi` from it?',
        expectedAnswer: 'Use attribute access: `math.sqrt(9)` and `math.pi`.',
        explanation: '`import math` binds the module object to the name `math`.'
      }),
      buildShortAnswer({
        prompt: 'How can you quickly see what names a module provides (for exploration/debugging)?',
        expectedAnswer: 'Use `dir(module)` (and `help(module)` for docs). Example: `dir(math)`. ',
        explanation: 'This helps discover functions/constants in a module.'
      }),
      buildShortAnswer({
        prompt: 'What’s a common reason `AttributeError: module ... has no attribute ...` happens after an import?',
        expectedAnswer: 'A common reason is importing the wrong thing due to a filename collision (e.g., you have a local `math.py` shadowing the standard library `math`).',
        explanation: 'Avoid naming your files the same as popular modules.'
      })
    ];
  }

  if (k === 'modules - module aliasing (import ... as ...)') {
    return [
      buildShortAnswer({
        prompt: 'What does `import module as alias` do?',
        expectedAnswer: 'It imports the module and binds it to a different name in the current namespace, e.g., `import math as m` then `m.sqrt(9)`. ',
        explanation: 'Aliasing is just a local name binding; it doesn’t rename the module itself.'
      }),
      buildShortAnswer({
        prompt: 'Why is aliasing commonly used with libraries like NumPy or pandas?',
        expectedAnswer: 'To make code shorter and follow widely recognized conventions (e.g., `import numpy as np`, `import pandas as pd`).',
        explanation: 'Consistent aliases improve readability across projects.'
      }),
      buildShortAnswer({
        prompt: 'If you do `import math as m` and later assign `m = 10`, what happens?',
        expectedAnswer: '`m` no longer refers to the module; you overwrote the name with an integer, so `m.sqrt(...)` will fail.',
        explanation: 'Names are just references; avoid reusing import aliases as variables.'
      })
    ];
  }

  if (k === 'modules - from ... import (import selected members)') {
    return [
      buildShortAnswer({
        prompt: 'What does `from math import sqrt, pi` change compared to `import math`?',
        expectedAnswer: 'It brings `sqrt` and `pi` directly into the current namespace, so you call `sqrt(9)` instead of `math.sqrt(9)`. ',
        explanation: 'It can be convenient but may cause name collisions.'
      }),
      buildShortAnswer({
        prompt: 'Show how to import a member with an alias using `from ... import ... as ...`.',
        expectedAnswer: 'Example: `from math import sqrt as msqrt` then `msqrt(9)`. ',
        explanation: 'Aliasing imported names helps avoid collisions and clarifies meaning.'
      }),
      buildShortAnswer({
        prompt: 'Give one realistic case where `from ... import ...` is considered idiomatic and safe.',
        expectedAnswer: 'Example: `from collections import Counter` or `from dataclasses import dataclass` (names are distinctive and commonly used).',
        explanation: 'Use it when the imported name is clear and unlikely to collide.'
      })
    ];
  }

  if (k === 'modules - importing everything (*) (why to avoid)') {
    return [
      buildShortAnswer({
        prompt: 'What does `from module import *` do?',
        expectedAnswer: 'It imports many names from the module into the current namespace (often controlled by `module.__all__` if defined).',
        explanation: 'It makes it unclear where names come from.'
      }),
      buildShortAnswer({
        prompt: 'Name two concrete problems caused by `import *`.',
        expectedAnswer: '1) Name collisions/shadowing (overwrites existing names). 2) Reduced readability/traceability (hard to know what module a name came from).',
        explanation: 'It also complicates static analysis and code navigation.'
      }),
      buildShortAnswer({
        prompt: 'What is a better alternative to `import *` in most codebases?',
        expectedAnswer: 'Explicit imports (`import module` or `from module import name1, name2`) and using `module.name` for clarity.',
        explanation: 'Explicitness improves maintainability.'
      })
    ];
  }

  if (k === 'modules - member aliasing (from ... import x as y)') {
    return [
      buildShortAnswer({
        prompt: 'What does `from math import sqrt as root` do, and what name do you use to call the function afterward?',
        expectedAnswer: 'It imports `sqrt` and binds it locally as `root`. You call it as `root(9)`.',
        explanation: '`as` creates an alias in the current namespace.'
      }),
      buildShortAnswer({
        prompt: 'Give one reason to alias an imported member, and one risk of doing it.',
        expectedAnswer: 'Reason: avoid name collisions or make the name clearer/shorter. Risk: over-aliasing can hurt readability because the original source becomes less obvious.',
        explanation: 'Use aliases when they clarify intent, not when they obscure it.'
      }),
      buildShortAnswer({
        prompt: 'If your file defines `sqrt = 123` and you later do `from math import sqrt`, what happens to `sqrt`?',
        expectedAnswer: 'The imported `sqrt` overwrites the existing `sqrt` name in that module’s namespace.',
        explanation: 'Imports bind names; later bindings override earlier ones.'
      })
    ];
  }

  if (k === 'modules - import caching and reloading') {
    return [
      buildShortAnswer({
        prompt: 'Where does Python cache imported modules, and how does that affect repeated `import` statements?',
        expectedAnswer: 'In `sys.modules`. After the first import, later imports reuse the cached module object and usually do not re-execute the module code.',
        explanation: 'This is why import-time side effects happen once per process (normally).' 
      }),
      buildShortAnswer({
        prompt: 'How do you reload a module during an interactive session, and what is the main caveat?',
        expectedAnswer: 'Use `import importlib; importlib.reload(mod)`. Caveat: existing references (e.g., `from mod import func`) still point to the old objects unless re-imported; state can also persist in surprising ways.',
        explanation: 'Reload is for debugging/dev loops, not a general design tool.'
      }),
      buildShortAnswer({
        prompt: 'Why is `from module import name` especially tricky when combined with reloading?',
        expectedAnswer: 'Because `name` is copied into your namespace at import time; reloading the module does not update that already-bound name. You must re-run the `from ... import ...` to refresh it.',
        explanation: 'Module-qualified access (`module.name`) is easier to refresh after reload.'
      })
    ];
  }

  if (k === 'modules - discovering module members (dir, help)') {
    return [
      buildShortAnswer({
        prompt: 'What does `dir(module)` return, and what is a common filtering step when exploring output?',
        expectedAnswer: '`dir(module)` returns a list of attribute names (strings) available on the object. A common filter is removing dunder names: `[n for n in dir(m) if not n.startswith("__")]`.',
        explanation: 'Filtering helps focus on the public API during exploration.'
      }),
      buildShortAnswer({
        prompt: 'What is `help(module_or_name)` used for, and what kind of information does it show?',
        expectedAnswer: '`help(...)` shows documentation: docstrings, functions/classes, signatures, and descriptions (pydoc-style).',
        explanation: 'It’s useful for learning how to call something correctly.'
      }),
      buildShortAnswer({
        prompt: 'Given `import math`, show one quick way to verify which file was imported (helpful when you suspect shadowing).',
        expectedAnswer: 'Use `math.__file__` (some built-in modules may not have one, but many do).',
        explanation: 'This helps diagnose importing a local file instead of the intended library.'
      })
    ];
  }

  if (k === 'modules - special variable __name__ (main guard)') {
    return [
      buildShortAnswer({
        prompt: 'What value does `__name__` have when a file is run directly vs imported?',
        expectedAnswer: 'Run directly: `__name__ == "__main__"`. Imported: `__name__` is the module’s name (e.g., `"mypkg.mymodule"`).',
        explanation: 'This is the basis of the “main guard”.'
      }),
      buildShortAnswer({
        prompt: 'Why do we write `if __name__ == "__main__": main()` in modules?',
        expectedAnswer: 'To prevent code from running at import time while still allowing the module to be executed as a script for demos/CLI entry points.',
        explanation: 'It separates reusable definitions from executable script behavior.'
      }),
      buildShortAnswer({
        prompt: 'What is one advantage of running a package module with `python -m package.module` instead of `python module.py`?',
        expectedAnswer: '`python -m` runs it in package context so relative imports work as intended and module resolution is consistent with the package structure.',
        explanation: 'It reduces import-path surprises in multi-module projects.'
      })
    ];
  }

  if (k === 'modules - working with math module (quick tour)') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `math.floor(x)` and `math.trunc(x)` for negative numbers? Give one example.',
        expectedAnswer: '`floor` rounds down (toward -∞); `trunc` rounds toward 0. Example: for `x = -1.7`, `floor(x) == -2` and `trunc(x) == -1`.',
        explanation: 'Negative numbers highlight the difference.'
      }),
      buildShortAnswer({
        prompt: 'What happens if you call `math.sqrt(-1)` and what should you use if you need complex results?',
        expectedAnswer: '`math.sqrt(-1)` raises `ValueError`. Use `cmath.sqrt(-1)` for complex numbers.',
        explanation: '`math` operates on real numbers; `cmath` supports complex.'
      }),
      buildShortAnswer({
        prompt: 'Why is `math.isclose(a, b)` often better than `a == b` for floats?',
        expectedAnswer: 'Because floating-point arithmetic has rounding error; `isclose` compares within a tolerance so tiny representation differences don’t cause false negatives.',
        explanation: 'Float equality is often unreliable for computed values.'
      })
    ];
  }

  if (k === 'modules - working with random module (common functions)') {
    return [
      buildShortAnswer({
        prompt: 'What does `random.seed(123)` do, and why is it useful in testing?',
        expectedAnswer: 'It makes the pseudo-random sequence deterministic/reproducible, which is useful for repeatable tests and debugging.',
        explanation: 'Seeding controls the PRNG state.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `random.randint(a, b)` and `random.randrange(a, b)` regarding the end value?',
        expectedAnswer: '`randint(a, b)` is inclusive of `b`. `randrange(a, b)` is exclusive of `b` (like `range`).',
        explanation: 'End-point inclusivity is a common off-by-one source.'
      }),
      buildShortAnswer({
        prompt: 'For generating security-sensitive tokens/password reset codes, should you use `random`? What should you use instead?',
        expectedAnswer: 'No. Use `secrets` (e.g., `secrets.token_urlsafe(...)`) for cryptographically secure randomness.',
        explanation: '`random` is not designed to be cryptographically secure.'
      })
    ];
  }

  if (k === 'packages (overview)') {
    return [
      buildShortAnswer({
        prompt: 'What makes a directory a Python package in the traditional sense, and what file is commonly present?',
        expectedAnswer: 'Traditionally, a package is a directory of modules that includes an `__init__.py` file.',
        explanation: '`__init__.py` marks the package and can run package initialization code.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between absolute imports and relative imports inside a package?',
        expectedAnswer: 'Absolute imports use the full package path (e.g., `from mypkg.utils import f`). Relative imports use dots relative to the current module (e.g., `from .utils import f`).',
        explanation: 'Relative imports help within a package but require running in package context.'
      }),
      buildShortAnswer({
        prompt: 'Why can relative imports fail when you run a package module as a plain script file?',
        expectedAnswer: 'Because running a file directly may not give it a proper package context, so relative import resolution breaks. Using `python -m package.module` fixes this.',
        explanation: '`-m` runs the module as part of its package.'
      })
    ];
  }

  if (k === 'packages - importing from packages (examples)') {
    return [
      buildShortAnswer({
        prompt: 'Given `mypkg/` with `__init__.py` and `helpers.py`, write the import to use `helpers.format_name` from outside the package.',
        expectedAnswer: 'Example: `from mypkg import helpers` then call `helpers.format_name(...)`, or `from mypkg.helpers import format_name`.',
        explanation: 'Both are valid; module-qualified access is often clearer.'
      }),
      buildShortAnswer({
        prompt: 'Inside `mypkg/service.py`, how do you import `helpers.py` using a relative import?',
        expectedAnswer: 'Use `from . import helpers` or `from .helpers import format_name`.',
        explanation: 'The leading dot means “from the same package”.'
      }),
      buildShortAnswer({
        prompt: 'How can `__init__.py` be used to expose a simpler import API for a package?',
        expectedAnswer: 'By importing selected names in `__init__.py`, e.g., `from .helpers import format_name`, enabling `from mypkg import format_name`.',
        explanation: 'This creates a curated, user-friendly package interface.'
      })
    ];
  }

  if (k === 'packages - subpackages and unique naming') {
    return [
      buildShortAnswer({
        prompt: 'What is a subpackage, and how does it differ from a submodule?',
        expectedAnswer: 'A subpackage is a nested package directory (e.g., `mypkg/subpkg/`). A submodule is a module file within a package (e.g., `mypkg/util.py`).',
        explanation: 'Both are importable; one is a directory package and the other is a file.'
      }),
      buildShortAnswer({
        prompt: 'Why should you avoid naming your own modules `random.py` or `math.py` inside a project?',
        expectedAnswer: 'Because they can shadow the standard library modules, causing confusing import behavior and missing attributes.',
        explanation: 'Import shadowing is a common beginner-to-intermediate pitfall.'
      }),
      buildShortAnswer({
        prompt: 'If you see `ImportError`/unexpected module contents due to shadowing, what is one quick diagnostic step?',
        expectedAnswer: 'Print the imported module’s `__file__` to see which path is being imported, then rename the conflicting local module/package.',
        explanation: 'Knowing the import path usually reveals the conflict immediately.'
      })
    ];
  }

  if (k === 'modules & packages - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'You have `project/` with `mypkg/` and `mypkg/utils.py`. Write a tiny entry point pattern that lets you run and import cleanly.',
        expectedAnswer: 'Example: put `main()` in `mypkg/app.py` and guard it:\n\n```python\n# mypkg/app.py\ndef main():\n    ...\n\nif __name__ == "__main__":\n    main()\n```\n\nRun with `python -m mypkg.app`.',
        explanation: 'The `-m` approach keeps package imports consistent.'
      }),
      buildShortAnswer({
        prompt: 'Explain why wildcard imports are a bad idea for maintainability in multi-module projects.',
        expectedAnswer: 'They hide dependencies, create name collisions, and make it hard to trace where symbols come from—hurting readability, refactoring, and tooling.',
        explanation: 'Explicit imports make dependencies and provenance clear.'
      }),
      buildShortAnswer({
        prompt: 'Given a circular import between `a.py` and `b.py`, name one refactor that typically breaks the cycle.',
        expectedAnswer: 'Move shared code into a third module (e.g., `common.py`) that both import, or reorganize responsibilities so only one direction of import remains.',
        explanation: 'Breaking cycles usually means reducing mutual dependency.'
      })
    ];
  }

  if (k === 'oop (part 1) - overview') {
    return [
      buildShortAnswer({
        prompt: 'In Python, what is the difference between a class and an object (instance)?',
        expectedAnswer: 'A class is a blueprint/type that defines behavior and data; an object (instance) is a concrete value created from that class with its own state.',
        explanation: 'Instances can share behavior (methods) but have different attribute values.'
      }),
      buildShortAnswer({
        prompt: 'What does it mean that variables “hold references” to objects in Python?',
        expectedAnswer: 'A variable name refers to an object; assignment rebinds the name to a different object rather than copying the object itself (unless you explicitly copy).',
        explanation: 'This matters for mutability and when multiple names point to the same object.'
      }),
      buildShortAnswer({
        prompt: 'Give one benefit of using classes in real projects (beyond “it organizes code”).',
        expectedAnswer: 'Classes can encapsulate invariants/state + behavior together, provide reusable abstractions, and enable polymorphism/composition for cleaner architecture.',
        explanation: 'They help manage complexity as programs grow.'
      })
    ];
  }

  if (k === 'oop - class, object, and reference variable') {
    return [
      buildShortAnswer({
        prompt: 'What does `a is b` test, and how is it different from `a == b` for objects?',
        expectedAnswer: '`is` tests identity (same object). `==` tests equality (same value/meaning), which may be implemented by `__eq__`.',
        explanation: 'Two distinct objects can be equal but not identical.'
      }),
      buildShortAnswer({
        prompt: 'If `x = []` and `y = x`, then you do `y.append(1)`, what is `x` now and why?',
        expectedAnswer: '`x` is now `[1]` because `x` and `y` refer to the same list object.',
        explanation: 'Assignment copies references, not objects.'
      }),
      buildShortAnswer({
        prompt: 'How can you create an independent copy of a list to avoid shared references?',
        expectedAnswer: 'Use `x.copy()`, `list(x)`, or slicing `x[:]` for a shallow copy (deep copy needed for nested mutables).',
        explanation: 'Shallow vs deep copy matters when elements are themselves mutable.'
      })
    ];
  }

  if (k === 'oop - defining a class (docstring + help)') {
    return [
      buildShortAnswer({
        prompt: 'Where do you put a class docstring, and how can you view it at runtime?',
        expectedAnswer: 'Put it as the first string literal inside the class body. View via `help(MyClass)` or `MyClass.__doc__`.',
        explanation: 'Docstrings become the `__doc__` attribute.'
      }),
      buildShortAnswer({
        prompt: 'Write a small class `Point` with a class docstring and an instance method `norm()` that returns the Euclidean norm.',
        expectedAnswer: 'Example:\n\n```python\nimport math\n\nclass Point:\n    """A 2D point with x and y coordinates."""\n\n    def __init__(self, x, y):\n        self.x = x\n        self.y = y\n\n    def norm(self):\n        return math.hypot(self.x, self.y)\n```',
        explanation: 'Docstring goes at the top of the class body; methods use `self`.'
      }),
      buildShortAnswer({
        prompt: 'What does `help(obj)` generally show for a user-defined class instance?',
        expectedAnswer: 'It shows the class documentation, methods, attributes (as discoverable), and docstrings/signatures when available.',
        explanation: '`help` is an interactive documentation tool.'
      })
    ];
  }

  if (k === 'oop - self (very important)') {
    return [
      buildShortAnswer({
        prompt: 'What is `self` in an instance method, and is it a keyword?',
        expectedAnswer: '`self` is the first parameter that receives the instance when you call an instance method. It is not a keyword; it is a convention.',
        explanation: 'Python passes the instance automatically for `obj.method(...)` calls.'
      }),
      buildShortAnswer({
        prompt: 'If you define `def f(self, x): ...` inside a class, what does `obj.f(10)` pass into `self` and `x`?',
        expectedAnswer: '`self` receives `obj` and `x` receives `10`.',
        explanation: 'This is method binding.'
      }),
      buildShortAnswer({
        prompt: 'What error typically occurs if you forget `self` in an instance method definition?',
        expectedAnswer: 'A `TypeError` about missing/extra positional arguments because the bound instance is still passed but your signature doesn’t accept it.',
        explanation: 'The method call semantics stay the same, so the signature mismatch triggers errors.'
      })
    ];
  }

  if (k === 'oop - constructor __init__ (when it runs)') {
    return [
      buildShortAnswer({
        prompt: 'When does `__init__` run, and what is it responsible for?',
        expectedAnswer: '`__init__` runs after an object is created (after `__new__`) when you instantiate a class. It initializes instance attributes/state.',
        explanation: 'It does not “create” the object; it configures it.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `__init__` returning `None` and returning a value?',
        expectedAnswer: '`__init__` must return `None`; returning any other value raises `TypeError`.',
        explanation: 'Constructors in Python initialize; object creation is separate.'
      }),
      buildShortAnswer({
        prompt: 'Give one example of a useful validation you might do inside `__init__`.',
        expectedAnswer: 'Validate invariants like non-negative values (e.g., `if radius < 0: raise ValueError`).',
        explanation: 'Enforcing invariants early prevents invalid objects from existing.'
      })
    ];
  }

  if (k === 'oop - methods vs constructors') {
    return [
      buildShortAnswer({
        prompt: 'In one sentence, contrast a constructor (`__init__`) and an instance method.',
        expectedAnswer: '`__init__` initializes a new instance at creation time; instance methods operate on an already-created instance and can be called any time.',
        explanation: 'Different lifecycle roles.'
      }),
      buildShortAnswer({
        prompt: 'Why is it usually a bad idea to do heavy I/O (network calls, DB writes) inside `__init__`?',
        expectedAnswer: 'It makes object creation slow and side-effectful, complicates testing, and can fail in constructors unexpectedly; prefer explicit methods like `.connect()` or factories.',
        explanation: 'Constructors should be lightweight and predictable.'
      }),
      buildShortAnswer({
        prompt: 'What is one valid reason to use a `@classmethod` factory instead of putting logic in `__init__`?',
        expectedAnswer: 'To support alternate constructors/parsing (e.g., `from_json`, `from_string`) while keeping `__init__` simple and invariant-focused.',
        explanation: 'Factories clarify intent and separate creation paths.'
      })
    ];
  }

  if (k === 'oop - instance variables (what/where/how)') {
    return [
      buildShortAnswer({
        prompt: 'What is an instance variable and where is it typically created?',
        expectedAnswer: 'An instance variable is data stored per object (per instance). It is typically created by assigning to `self.name` inside `__init__` (or other instance methods).',
        explanation: 'Each instance gets its own values.'
      }),
      buildShortAnswer({
        prompt: 'If two instances `a` and `b` of the same class both have `self.x`, do they share the same `x`?',
        expectedAnswer: 'No, each instance has its own `x` unless `x` refers to a shared mutable object intentionally stored at the class level.',
        explanation: 'Instance attributes live on the instance (`obj.__dict__`) by default.'
      }),
      buildShortAnswer({
        prompt: 'What is a common pitfall with storing a mutable default at the class level (e.g., `items = []`), and what is the fix?',
        expectedAnswer: 'All instances share the same list, causing cross-instance leakage. Fix: create the list per instance in `__init__` (`self.items = []`).',
        explanation: 'Class attributes are shared across instances.'
      })
    ];
  }

  if (k === 'oop - accessing and deleting instance variables') {
    return [
      buildShortAnswer({
        prompt: 'How do you access an instance variable, and what happens if it does not exist?',
        expectedAnswer: 'Access via `obj.attr`. If it doesn’t exist, Python raises `AttributeError` (unless `__getattr__` is implemented).',
        explanation: 'Attribute lookup falls back to class attributes and then errors.'
      }),
      buildShortAnswer({
        prompt: 'How do you delete an instance attribute, and what is a real-world use-case?',
        expectedAnswer: 'Use `del obj.attr`. Use-case: removing cached/computed attributes so they are recomputed later or freeing large temporary data.',
        explanation: 'Deleting changes subsequent attribute lookups.'
      }),
      buildShortAnswer({
        prompt: 'If a class also has a class attribute named `x`, what happens after `del obj.x` when you read `obj.x`?',
        expectedAnswer: 'Python will fall back to the class attribute `x` (if it exists) because the instance attribute binding is removed.',
        explanation: 'Attribute resolution checks instance before class.'
      })
    ];
  }

  if (k === 'oop - static (class) variables') {
    return [
      buildShortAnswer({
        prompt: 'What is a class variable, and where is it defined?',
        expectedAnswer: 'A class variable is an attribute stored on the class object and shared by all instances; it is defined in the class body (outside methods).',
        explanation: 'Instances can read it via attribute lookup on the class.'
      }),
      buildShortAnswer({
        prompt: 'Give a good use-case for a class variable.',
        expectedAnswer: 'Constants/config shared by all instances (e.g., default timeout), or a counter of created instances.',
        explanation: 'Shared values belong on the class.'
      }),
      buildShortAnswer({
        prompt: 'If `C.x = 10` and you set `obj.x = 99`, what does `C.x` remain and why?',
        expectedAnswer: '`C.x` remains `10` because `obj.x = 99` creates/overwrites an instance attribute that shadows the class attribute for that instance only.',
        explanation: 'Instance assignment does not mutate the class attribute.'
      })
    ];
  }

  if (k === 'oop - modifying static variables (and shadowing pitfall)') {
    return [
      buildShortAnswer({
        prompt: 'Given `class C: count = 0`, what is the correct way to increment the shared `count` from an instance method?',
        expectedAnswer: 'Use the class: `C.count += 1` or `type(self).count += 1` (not `self.count += 1`).',
        explanation: '`self.count += 1` creates/shadows an instance attribute instead of updating the class variable.'
      }),
      buildShortAnswer({
        prompt: 'What is the “shadowing” pitfall with class variables, and how can you detect it?',
        expectedAnswer: 'Assigning via `self.var = ...` creates an instance attribute that hides the class attribute. Detect by checking `obj.__dict__` or printing both `obj.var` and `Class.var`.',
        explanation: 'Shadowing causes per-instance divergence unexpectedly.'
      }),
      buildShortAnswer({
        prompt: 'Write a minimal example where `self.count += 1` breaks a shared counter, and show the fix.',
        expectedAnswer: 'Example:\n\n```python\nclass C:\n    count = 0\n    def bump(self):\n        self.count += 1  # BUG: shadows\n\nclass D:\n    count = 0\n    def bump(self):\n        type(self).count += 1  # OK\n```',
        explanation: 'The fix updates the attribute on the class, not the instance.'
      })
    ];
  }

  if (k === 'oop - local variables (method-level)') {
    return [
      buildShortAnswer({
        prompt: 'In an instance method, what is the difference between a local variable `x` and an instance attribute `self.x`?',
        expectedAnswer: '`x` is method-local and exists only during that call; `self.x` is stored on the object and persists across calls (and can be read by other methods).',
        explanation: 'Forgetting `self.` is a very common source of “state not saved” bugs.'
      }),
      buildShortAnswer({
        prompt: 'What happens in this code, and what is the fix?\n\n```python\nclass C:\n    def set_x(self, x):\n        x = x  # intended to store on the instance\n\nc = C()\nc.set_x(10)\nprint(c.x)\n```',
        expectedAnswer: 'It raises `AttributeError` because `c.x` was never set; fix by assigning `self.x = x` inside `set_x`.',
        explanation: 'Assigning to a bare name creates/updates a local variable, not an attribute.'
      }),
      buildShortAnswer({
        prompt: 'Why does this method raise `UnboundLocalError`, and how do you fix it?\n\n```python\nclass Counter:\n    total = 0\n    def bump(self):\n        total += 1\n```',
        expectedAnswer: 'Because `total` is treated as a local variable due to assignment, but it is read before being assigned. Fix by using `type(self).total += 1` (class variable) or `self.total = self.total + 1` if you want an instance attribute.',
        explanation: 'Python decides “local vs non-local” at compile time based on assignment.'
      })
    ];
  }

  if (k === 'oop - instance methods') {
    return [
      buildShortAnswer({
        prompt: 'When you call `obj.method(1, 2)`, what does Python pass as the first argument to the method?',
        expectedAnswer: 'Python passes the instance `obj` as the first argument (conventionally named `self`).',
        explanation: 'Instance methods are functions on the class that become “bound methods” when accessed through an instance.'
      }),
      buildShortAnswer({
        prompt: 'Why does `Class.method(obj, 1, 2)` work (and when would you ever write it)?',
        expectedAnswer: 'Because `method` is just a function stored on the class; calling it through the class means you must supply the instance explicitly. You might use it for debugging, metaprogramming, or when you already have the class reference.',
        explanation: 'The binding step happens when you access the attribute through an instance.'
      }),
      buildShortAnswer({
        prompt: 'If an “instance method” never uses `self`, what are two better alternatives?',
        expectedAnswer: 'Make it a `@staticmethod` (if it belongs in the class namespace) or move it to a module-level function.',
        explanation: 'This reduces confusion and signals the method doesn’t depend on instance state.'
      })
    ];
  }

  if (k === 'oop - getters and setters (and a pythonic note)') {
    return [
      buildShortAnswer({
        prompt: 'What is the Pythonic alternative to Java-style `get_x()`/`set_x()` methods, and why is it useful?',
        expectedAnswer: 'Use a property (`@property` + `@x.setter`). It lets you present a simple attribute-style API while enforcing validation or computed behavior without changing callers.',
        explanation: 'You can start with a plain attribute and later upgrade to a property with the same name.'
      }),
      buildShortAnswer({
        prompt: 'Implement a `radius` property that rejects negative values (store the backing value in `_radius`).',
        expectedAnswer: 'Example:\n\n```python\nclass Circle:\n    def __init__(self, radius):\n        self.radius = radius\n\n    @property\n    def radius(self):\n        return self._radius\n\n    @radius.setter\n    def radius(self, value):\n        if value < 0:\n            raise ValueError("radius must be non-negative")\n        self._radius = value\n```',
        explanation: 'Use a distinct backing attribute (often prefixed with `_`) to avoid recursion.'
      }),
      buildShortAnswer({
        prompt: 'What bug happens if you write `self.radius = value` inside the `radius` setter, and what is the fix?',
        expectedAnswer: 'It causes infinite recursion (the setter calls itself repeatedly). Fix by assigning to a different backing attribute such as `self._radius`.',
        explanation: 'Within the setter, use the backing name, not the property name.'
      })
    ];
  }

  if (k === 'oop - class methods (@classmethod)') {
    return [
      buildShortAnswer({
        prompt: 'What is the key difference between `@classmethod` and a normal instance method?',
        expectedAnswer: 'A `@classmethod` receives the class as the first argument (usually `cls`), not an instance (`self`).',
        explanation: 'This is useful for alternate constructors and class-level behavior.'
      }),
      buildShortAnswer({
        prompt: 'Why are `@classmethod` alternate constructors usually better than putting parsing logic in `__init__`?',
        expectedAnswer: 'They keep `__init__` focused on invariants and let you offer clearly named creation paths like `from_json`/`from_string` without overloading parameters.',
        explanation: 'It improves readability and avoids one constructor doing too many things.'
      }),
      buildShortAnswer({
        prompt: 'What does `cls` become when you call a classmethod on a subclass?',
        expectedAnswer: '`cls` becomes the subclass, not the base class.',
        explanation: 'That’s why classmethods are inheritance-friendly.'
      })
    ];
  }

  if (k === 'oop - static methods (@staticmethod)') {
    return [
      buildShortAnswer({
        prompt: 'What does `@staticmethod` change about how a method is called?',
        expectedAnswer: 'It disables automatic passing of `self`/`cls`; it behaves like a normal function namespaced inside the class.',
        explanation: 'Use it for helpers that conceptually belong with the class but don’t need instance or class state.'
      }),
      buildShortAnswer({
        prompt: 'When should you prefer a module-level function instead of `@staticmethod`?',
        expectedAnswer: 'When the helper isn’t tightly coupled to the class concept and would be broadly useful elsewhere; module-level functions are simpler and avoid over-nesting.',
        explanation: 'Static methods are mainly about organization and discoverability.'
      }),
      buildShortAnswer({
        prompt: 'Can a staticmethod access instance state without being passed an instance? Explain.',
        expectedAnswer: 'No. It receives no `self` automatically. To use instance state, you must pass an instance explicitly (or use an instance method instead).',
        explanation: 'This is the key behavioral difference from instance methods.'
      })
    ];
  }

  if (k === 'oop - mini program: bankaccount (deposit/withdraw)') {
    return [
      buildShortAnswer({
        prompt: 'Name two invariants a `BankAccount` class should enforce in `deposit()`/`withdraw()`.',
        expectedAnswer: 'Amounts should be positive (no negative deposits/withdrawals), and `withdraw()` should not allow the balance to go below zero (or should follow defined overdraft rules).',
        explanation: 'Clear invariants prevent invalid state from existing.'
      }),
      buildShortAnswer({
        prompt: 'Why is using `float` risky for money balances, and what is a safer alternative in Python?',
        expectedAnswer: '`float` can introduce rounding errors because it’s binary floating-point. A safer alternative is `decimal.Decimal` (often with a fixed quantization) or storing integer cents.',
        explanation: 'Financial calculations usually require exact decimal arithmetic.'
      }),
      buildShortAnswer({
        prompt: 'If `withdraw()` fails due to insufficient funds, what should it do and what should it raise?',
        expectedAnswer: 'It should leave the balance unchanged and raise a clear exception (e.g., `ValueError` or a custom `InsufficientFundsError`).',
        explanation: 'Failing operations should be atomic: don’t partially mutate state.'
      })
    ];
  }

  if (k === 'oop (part 1) - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'You need a `from_json()` constructor that returns an instance of whatever subclass calls it. Should it be an instance method, classmethod, or staticmethod?',
        expectedAnswer: 'A `@classmethod`, so it receives `cls` and can construct/return the correct subclass.',
        explanation: 'Using `cls(...)` preserves inheritance behavior.'
      }),
      buildShortAnswer({
        prompt: 'You want to validate that `age` is non-negative but still allow callers to read/write it like `obj.age`. What feature should you use?',
        expectedAnswer: 'A property (`@property` and `@age.setter`) with a backing attribute (e.g., `_age`).',
        explanation: 'Properties keep a clean API while enforcing invariants.'
      }),
      buildShortAnswer({
        prompt: 'In one sentence: what is the most common bug when trying to update a shared counter stored as a class variable?',
        expectedAnswer: 'Updating via `self.counter += 1` creates an instance attribute and stops updating the shared class variable.',
        explanation: 'The fix is to update on the class (`type(self).counter += 1`).'
      })
    ];
  }

  if (k === 'exception handling - overview (syntax vs runtime)') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between a `SyntaxError` and a runtime exception like `ZeroDivisionError`?',
        expectedAnswer: '`SyntaxError` happens when Python cannot parse your code (before execution). Runtime exceptions happen while executing valid syntax (e.g., dividing by zero).',
        explanation: 'Syntax errors must be fixed in the code; try/except can only handle errors that occur during execution.'
      }),
      buildShortAnswer({
        prompt: 'Can `try/except` catch a syntax error inside the same file? Why or why not?',
        expectedAnswer: 'No. The file must parse successfully before it can run, so a syntax error prevents execution from starting.',
        explanation: 'You can only catch exceptions that occur at runtime.'
      }),
      buildShortAnswer({
        prompt: 'Give one reason you might handle an exception instead of letting the program crash.',
        expectedAnswer: 'To recover gracefully (e.g., ask for input again), provide a user-friendly message, or safely clean up resources (close files/network connections).',
        explanation: 'Handling exceptions is about reliability and control flow under failure.'
      })
    ];
  }

  if (k === 'exception handling - what is an exception? (and why handle it)') {
    return [
      buildShortAnswer({
        prompt: 'What happens when an exception is raised and not handled anywhere?',
        expectedAnswer: 'Python unwinds the call stack, prints a traceback, and terminates the program (for that thread) with a non-zero exit status.',
        explanation: 'The traceback shows the chain of calls that led to the error.'
      }),
      buildShortAnswer({
        prompt: 'Why is `except Exception:` usually better than a bare `except:` in application code?',
        expectedAnswer: 'Bare `except:` also catches `BaseException` types like `KeyboardInterrupt` and `SystemExit`, which you usually want to propagate. Catching `Exception` avoids swallowing those.',
        explanation: 'Overly broad catches make programs harder to stop and debug.'
      }),
      buildShortAnswer({
        prompt: 'What is a best practice for choosing which exceptions to catch?',
        expectedAnswer: 'Catch the most specific exception(s) you expect, handle them close to where you can recover, and avoid catching exceptions you can’t meaningfully handle.',
        explanation: 'Specific handling reduces accidental masking of unrelated bugs.'
      })
    ];
  }

  if (k === 'exception handling - default exception handling (tracebacks)') {
    return [
      buildShortAnswer({
        prompt: 'What information does a Python traceback include?',
        expectedAnswer: 'The call stack (files, line numbers, and function names) leading to the error, plus the exception type and message.',
        explanation: 'It’s a breadcrumb trail for debugging.'
      }),
      buildShortAnswer({
        prompt: 'When reading a traceback, which line typically tells you what exception occurred?',
        expectedAnswer: 'The last line: it shows the exception type and message (e.g., `ValueError: ...`).',
        explanation: 'The lines above show where it propagated through the stack.'
      }),
      buildShortAnswer({
        prompt: 'Inside an `except` block, how do you re-raise the same exception after logging?',
        expectedAnswer: 'Use a bare `raise` to re-raise the current exception.',
        explanation: '`raise` preserves the original traceback.'
      })
    ];
  }

  if (k === 'exception handling - exception hierarchy (baseexception vs exception)') {
    return [
      buildShortAnswer({
        prompt: 'What is the practical difference between catching `BaseException` and catching `Exception`?',
        expectedAnswer: '`Exception` covers most application-level errors. `BaseException` also includes “stop the program” exceptions like `KeyboardInterrupt` and `SystemExit` that you usually should not swallow.',
        explanation: 'Using `except Exception:` avoids accidentally preventing Ctrl+C and normal interpreter exit.'
      }),
      buildShortAnswer({
        prompt: 'Name two exception types that inherit directly from `BaseException` and are NOT subclasses of `Exception`.',
        expectedAnswer: '`KeyboardInterrupt` and `SystemExit` (also `GeneratorExit`).',
        explanation: 'These represent control-flow/termination signals rather than typical application errors.'
      }),
      buildShortAnswer({
        prompt: 'When defining your own custom error type for a library/app, what should it inherit from and why?',
        expectedAnswer: 'Inherit from `Exception` (or a more specific subclass) so callers can catch it with `except Exception` and treat it as an application-level error.',
        explanation: 'Custom exceptions should integrate cleanly with normal error-handling patterns.'
      })
    ];
  }

  if (k === 'exception handling - try/except basics (risky vs handling code)') {
    return [
      buildShortAnswer({
        prompt: 'Why should the `try` block usually contain only the “risky” line(s) and not a large chunk of code?',
        expectedAnswer: 'Because a large `try` can accidentally catch exceptions from unrelated code, making bugs harder to diagnose and causing incorrect recovery logic.',
        explanation: 'Keep the `try` small so you know exactly what can fail.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between handling an exception and suppressing a bug?',
        expectedAnswer: 'Handling means you can recover or add context meaningfully; suppressing is catching an exception you can’t handle and continuing silently, which hides real problems.',
        explanation: 'Good handlers either recover, transform, or re-raise.'
      }),
      buildShortAnswer({
        prompt: 'Write a minimal pattern that catches a specific exception and preserves debugging information if you can’t recover.',
        expectedAnswer: 'Example:\n\n```python\ntry:\n    n = int(text)\nexcept ValueError as e:\n    raise ValueError(f"Invalid integer: {text!r}") from e\n```',
        explanation: '`raise ... from e` adds context without losing the original cause.'
      })
    ];
  }

  if (k === 'exception handling - control flow rules in try/except') {
    return [
      buildShortAnswer({
        prompt: 'If an exception is raised in the middle of a `try` block, what happens to the remaining statements in that `try` block?',
        expectedAnswer: 'They are skipped; control jumps to the first matching `except` block (or the exception propagates if none match).',
        explanation: 'Only the statements before the failure execute.'
      }),
      buildShortAnswer({
        prompt: 'If no exception occurs in a `try` block, do any `except` blocks run?',
        expectedAnswer: 'No. `except` blocks run only when an exception is raised in the associated `try` suite.',
        explanation: 'This is why `else` exists for “success path” code.'
      }),
      buildShortAnswer({
        prompt: 'What happens if an exception is raised inside an `except` block itself?',
        expectedAnswer: 'It behaves like any other exception: it can be caught by an outer `try/except`, or it propagates upward and may crash the program.',
        explanation: 'An `except` block is normal code and can fail too.'
      })
    ];
  }

  if (k === 'exception handling - printing exception information (as e)') {
    return [
      buildShortAnswer({
        prompt: 'What does `except ValueError as e:` give you, and what are two useful things you can do with `e`?',
        expectedAnswer: '`e` is the exception instance. You can show a helpful message via `str(e)`/`repr(e)` and you can inspect its type/details (e.g., `type(e)`, attributes) for branching/logging.',
        explanation: 'Capturing the exception object helps debugging and error reporting.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between `print(e)` and `print(repr(e))` for an exception?',
        expectedAnswer: '`print(e)` prints the human-oriented message. `repr(e)` shows a representation that often includes the exception type and a more explicit view of its arguments.',
        explanation: 'Both can be useful depending on whether you want user-facing vs debug output.'
      }),
      buildShortAnswer({
        prompt: 'Inside `except`, how do you print the full stack trace in a quick-and-dirty way without manually parsing traceback frames?',
        expectedAnswer: 'Use `import traceback; traceback.print_exc()` (or use `logging.exception(...)` with `exc_info=True`).',
        explanation: 'This prints the traceback for the current exception.'
      })
    ];
  }

  if (k === 'exception handling - multiple except blocks (and ordering)') {
    return [
      buildShortAnswer({
        prompt: 'Why should more specific exceptions be listed before more general exceptions?',
        expectedAnswer: 'Because Python matches `except` blocks top-to-bottom; a general handler first (like `Exception` or `OSError`) would catch the exception before the specific handler can run.',
        explanation: 'Ordering matters due to subclass relationships.'
      }),
      buildShortAnswer({
        prompt: 'What happens if you put `except Exception:` before `except ValueError:`?',
        expectedAnswer: '`ValueError` would be caught by `Exception` first, making the `ValueError` block unreachable (and some linters will flag it).',
        explanation: 'Always order from specific → general.'
      }),
      buildShortAnswer({
        prompt: 'Give an example where you use multiple except blocks to recover differently based on the exception type.',
        expectedAnswer: 'Example:\n\n```python\ntry:\n    n = int(text)\nexcept ValueError:\n    return 0  # fallback default\nexcept TypeError:\n    raise TypeError("text must be a string")\n```',
        explanation: 'Different failures can require different recovery strategies.'
      })
    ];
  }

  if (k === 'exception handling - one except for many exceptions') {
    return [
      buildShortAnswer({
        prompt: 'How do you catch multiple specific exception types in a single `except` clause?',
        expectedAnswer: 'Catch a tuple of exception types: `except (ValueError, TypeError) as e:`',
        explanation: 'This is useful when the recovery action is identical.'
      }),
      buildShortAnswer({
        prompt: 'When is it better to catch a base class (like `OSError`) than many specific subclasses?',
        expectedAnswer: 'When you truly want the same handling for the entire family (e.g., I/O failures), and you don’t need to distinguish subclasses for different recovery.',
        explanation: 'Catching a base class can simplify code, but avoid catching too broadly.'
      }),
      buildShortAnswer({
        prompt: 'If you catch `(ValueError, TypeError)` as `e`, how could you still branch behavior by the specific type if needed?',
        expectedAnswer: 'Use `isinstance(e, ValueError)` / `isinstance(e, TypeError)` inside the handler (or split into separate except blocks).',
        explanation: 'Tuple-catching doesn’t prevent you from distinguishing when needed.'
      })
    ];
  }

  if (k === 'exception handling - default except block (use carefully)') {
    return [
      buildShortAnswer({
        prompt: 'What does a bare `except:` catch, and why is it risky?',
        expectedAnswer: 'It catches everything derived from `BaseException`, including `KeyboardInterrupt` and `SystemExit`. It can hide termination signals and make debugging much harder.',
        explanation: 'Prefer `except Exception:` for application error handling.'
      }),
      buildShortAnswer({
        prompt: 'If you must write a “catch-all” at a program boundary, what is a safer pattern than bare `except:`?',
        expectedAnswer: 'Use `except Exception as e:` to log and return an error code/message, and let `KeyboardInterrupt`/`SystemExit` propagate.',
        explanation: 'Boundaries (CLI/web handler) are the common place for broad catches.'
      }),
      buildShortAnswer({
        prompt: 'What should you usually do after catching an unexpected exception you can’t truly recover from?',
        expectedAnswer: 'Log it (including traceback) and re-raise, or exit with a non-zero status after reporting a clear error.',
        explanation: 'Unexpected exceptions often indicate bugs; swallowing them hides defects.'
      })
    ];
  }

  if (k === 'exception handling - finally block (cleanup code)') {
    return [
      buildShortAnswer({
        prompt: 'When does a `finally` block run?',
        expectedAnswer: '`finally` runs whether an exception occurs or not (even if there is a `return`/`break` inside the `try`).',
        explanation: 'It is meant for cleanup and releasing resources.'
      }),
      buildShortAnswer({
        prompt: 'Give a real-world example of something you would put in a `finally` block.',
        expectedAnswer: 'Closing a file/socket, releasing a lock, or restoring a temporary setting (e.g., resetting a global configuration).',
        explanation: 'Cleanup should run even when an error occurs.'
      }),
      buildShortAnswer({
        prompt: 'Why is `return` inside a `finally` block considered a bad practice?',
        expectedAnswer: 'It can override an exception or override a `return` from the `try`, making bugs disappear and control flow confusing.',
        explanation: 'A `finally` should typically not change the outcome; it should clean up.'
      })
    ];
  }

  if (k === 'exception handling - try/except/else/finally') {
    return [
      buildShortAnswer({
        prompt: 'What is the purpose of the `else` block in `try/except/else/finally`?',
        expectedAnswer: '`else` runs only if the `try` block completes without raising an exception.',
        explanation: 'It cleanly separates success-path code from the risky code.'
      }),
      buildShortAnswer({
        prompt: 'Why can `try/except/else` reduce accidental exception-catching compared to putting success code inside `try`?',
        expectedAnswer: 'Because you can keep the `try` block minimal and move non-risky follow-up work into `else`, preventing unrelated errors from being handled as if they were the expected failure.',
        explanation: 'This improves correctness and debuggability.'
      }),
      buildShortAnswer({
        prompt: 'Write a small pattern that opens/parses something, uses `else` for the success path, and `finally` for cleanup.',
        expectedAnswer: 'Example:\n\n```python\nf = None\ntry:\n    f = open(path)\n    data = f.read()\nexcept OSError as e:\n    raise RuntimeError(f"Could not read {path!r}") from e\nelse:\n    print("chars:", len(data))\nfinally:\n    if f is not None:\n        f.close()\n```',
        explanation: '`else` runs only when open+read succeeded; `finally` closes the file.'
      })
    ];
  }

  if (k === 'exception handling - nested try/except/finally (when useful)') {
    return [
      buildShortAnswer({
        prompt: 'When can nested `try/except` blocks be justified?',
        expectedAnswer: 'When different stages need different handling (e.g., outer `finally` for cleanup, inner `except` for per-item recovery), or when you want to recover for some operations but fail fast for others.',
        explanation: 'Nested try can be valid, but keep it readable and minimal.'
      }),
      buildShortAnswer({
        prompt: 'Give a simple example of nested `try` that processes many items but still cleans up a resource.',
        expectedAnswer: 'Example:\n\n```python\ntry:\n    for text in lines:\n        try:\n            n = int(text)\n        except ValueError:\n            continue\n        print(n)\nfinally:\n    cleanup()\n```',
        explanation: 'Inner handler skips bad lines; outer finally ensures cleanup runs.'
      }),
      buildShortAnswer({
        prompt: 'What is a common readability alternative to deeply nested `try/except`?',
        expectedAnswer: 'Extract logic into small functions and handle exceptions at clear boundaries (or use guard clauses) rather than nesting multiple levels.',
        explanation: 'Functions can replace nesting and keep error handling structured.'
      })
    ];
  }

  if (k === 'exception handling - types: predefined vs user-defined') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between a predefined (built-in) exception and a user-defined exception in Python?',
        expectedAnswer: 'Predefined exceptions are built into Python (e.g., `ValueError`, `TypeError`). User-defined exceptions are your own classes, typically inheriting from `Exception`, that you raise to represent domain-specific errors.',
        explanation: 'Custom exceptions let you express intent and allow callers to catch your errors precisely.'
      }),
      buildShortAnswer({
        prompt: 'Write a minimal user-defined exception and show how to raise it.',
        expectedAnswer: 'Example:\n\n```python\nclass InvalidAgeError(Exception):\n    pass\n\nraise InvalidAgeError("age must be >= 0")\n```',
        explanation: 'Inherit from `Exception` so normal `except Exception` patterns work.'
      }),
      buildShortAnswer({
        prompt: 'Why is creating a custom exception type often better than raising `Exception("...")` directly?',
        expectedAnswer: 'A custom type is easier to catch specifically, documents intent, and avoids forcing callers to parse error messages to decide what happened.',
        explanation: 'Types are a stronger API contract than strings.'
      })
    ];
  }

  if (k === 'exception handling - custom exceptions: define and raise') {
    return [
      buildShortAnswer({
        prompt: 'How do you define a custom exception that stores extra context (like a filename)?',
        expectedAnswer: 'Example:\n\n```python\nclass ConfigError(Exception):\n    def __init__(self, path, message):\n        super().__init__(message)\n        self.path = path\n```',
        explanation: 'Store structured data as attributes; keep the message human-readable.'
      }),
      buildShortAnswer({
        prompt: 'What does `raise MyError(...) from e` do, and when should you use it?',
        expectedAnswer: 'It chains exceptions: your new error becomes the main exception and `e` is recorded as the cause. Use it when converting a low-level exception into a higher-level domain error while preserving the root cause.',
        explanation: 'Chaining keeps debugging information intact while improving error messages for your layer.'
      }),
      buildShortAnswer({
        prompt: 'In a library, should you return error codes or raise exceptions for invalid inputs? (General rule)',
        expectedAnswer: 'Prefer raising a specific exception for invalid inputs; return values should represent successful outcomes. Use return codes only when the API is explicitly designed around them.',
        explanation: 'Exceptions separate normal results from failure paths.'
      })
    ];
  }

  if (k === 'exception handling - mini program: safe division utility') {
    return [
      buildShortAnswer({
        prompt: 'Implement `safe_divide(a, b, default=None)` so it returns `default` when `b` is zero.',
        expectedAnswer: 'Example:\n\n```python\ndef safe_divide(a, b, default=None):\n    try:\n        return a / b\n    except ZeroDivisionError:\n        return default\n```',
        explanation: 'The handler recovers from a known failure mode without crashing.'
      }),
      buildShortAnswer({
        prompt: 'If `a` and `b` might be strings, what exception could `a / b` raise and how should you handle it?',
        expectedAnswer: 'It can raise `TypeError`. You can either let it propagate (often best for unexpected types) or catch it and raise a clearer error (e.g., `TypeError("a and b must be numbers")`).',
        explanation: 'Only catch errors you can handle or improve meaningfully.'
      }),
      buildShortAnswer({
        prompt: 'Why can returning `0` on division-by-zero be a dangerous “safe” default in real programs?',
        expectedAnswer: 'It can silently hide bugs and produce incorrect downstream results (0 might look like a valid value). A safer default is `None`, `float("inf")`, or raising a clear exception depending on your domain.',
        explanation: 'Silent failure can be worse than a crash if it corrupts results.'
      })
    ];
  }

  if (k === 'exception handling - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'You’re parsing user input with `int(text)`. Which exception should you catch for invalid numbers and what should you avoid catching?',
        expectedAnswer: 'Catch `ValueError` for invalid numeric strings. Avoid a bare `except:` (or catching `BaseException`) because it can swallow termination signals and hide unrelated bugs.',
        explanation: 'Specific catches lead to safer, debuggable code.'
      }),
      buildShortAnswer({
        prompt: 'Why is `try/except/else` often clearer than putting all follow-up logic inside `try`?',
        expectedAnswer: '`else` runs only when no exception occurs, so you keep the `try` small and avoid catching exceptions from follow-up code as if they were the expected failure.',
        explanation: 'This reduces accidental bug masking.'
      }),
      buildShortAnswer({
        prompt: 'Where is it most appropriate to catch broad exceptions like `Exception`?',
        expectedAnswer: 'At program boundaries (CLI entrypoint, request handler, background worker loop) where you can log and convert errors into a controlled failure response.',
        explanation: 'Inner layers should catch only specific expected exceptions.'
      })
    ];
  }

  if (k === 'decorator functions - overview (why decorators exist)') {
    return [
      buildShortAnswer({
        prompt: 'What is a decorator in Python (conceptually)?',
        expectedAnswer: 'A decorator is a callable that takes a function (or class) and returns a new callable, typically wrapping or modifying behavior.',
        explanation: 'It’s a pattern for reusable “around” behavior like logging, timing, auth, caching, etc.'
      }),
      buildShortAnswer({
        prompt: 'What does the `@decorator` syntax do to a function definition?',
        expectedAnswer: 'It replaces the function with the result of calling the decorator on it (roughly: `func = decorator(func)`).',
        explanation: 'Decoration happens when the function is defined, not when it is called.'
      }),
      buildShortAnswer({
        prompt: 'Give one real-world example where a decorator improves code quality.',
        expectedAnswer: 'Example: a logging/timing decorator that measures runtime for multiple functions without repeating timing code in each function.',
        explanation: 'Decorators reduce boilerplate and keep cross-cutting concerns consistent.'
      })
    ];
  }

  if (k === 'decorator functions - functions are objects (first-class)') {
    return [
      buildShortAnswer({
        prompt: 'Show that a function is an object by assigning it to a variable and calling it.',
        expectedAnswer: 'Example:\n\n```python\ndef add1(x):\n    return x + 1\n\nf = add1\nprint(f(10))\n```',
        explanation: 'The name `add1` refers to a function object; you can rebind it.'
      }),
      buildShortAnswer({
        prompt: 'Give an example of passing a function as an argument in Python.',
        expectedAnswer: 'Example: `sorted(words, key=len)` passes the `len` function as the `key`.',
        explanation: 'Higher-order functions are the foundation for decorators.'
      }),
      buildShortAnswer({
        prompt: 'What does it mean for a function to be “first-class”? Give two capabilities.',
        expectedAnswer: 'It means functions can be stored in variables/data structures, passed as arguments, and returned from other functions (like any value).',
        explanation: 'This enables patterns like callbacks, factories, and decorators.'
      })
    ];
  }

  if (k === 'decorator functions - build a simple decorator (single parameter)') {
    return [
      buildShortAnswer({
        prompt: 'What are the three essential pieces of a basic decorator (in order)?',
        expectedAnswer: 'A decorator function that takes `func`, an inner `wrapper` function that calls `func`, and returning `wrapper` from the decorator.',
        explanation: 'The wrapper “closes over” `func` and adds behavior around it.'
      }),
      buildShortAnswer({
        prompt: 'Write a simple decorator that prints the input `x` before calling a function `f(x)` (single-parameter function).',
        expectedAnswer: 'Example:\n\n```python\ndef log_x(func):\n    def wrapper(x):\n        print("x=", x)\n        return func(x)\n    return wrapper\n```',
        explanation: 'The wrapper adds behavior before delegating to the original function.'
      }),
      buildShortAnswer({
        prompt: 'What is a closure, and how does it relate to decorators?',
        expectedAnswer: 'A closure is a function that remembers variables from its enclosing scope. In a decorator, `wrapper` closes over `func` so it can call the original later.',
        explanation: 'Closures are the mechanism that makes most decorators work.'
      })
    ];
  }

  if (k === 'decorator functions - using a decorator with and without @syntax') {
    return [
      buildShortAnswer({
        prompt: 'Rewrite this using no `@` syntax:\n\n```python\n@dec\ndef f(x):\n    return x + 1\n```',
        expectedAnswer: 'Example:\n\n```python\ndef f(x):\n    return x + 1\n\nf = dec(f)\n```',
        explanation: '`@dec` is syntactic sugar for reassigning the function name.'
      }),
      buildShortAnswer({
        prompt: 'When is a function decorated (definition time or call time)?',
        expectedAnswer: 'Definition time: the decorator is applied when Python executes the `def` statement.',
        explanation: 'The name is rebound immediately; later calls call the wrapped function.'
      }),
      buildShortAnswer({
        prompt: 'If `dec` returns a wrapper that prints a message, when will that message print?',
        expectedAnswer: 'When you call the decorated function (the wrapper), not when the decorator is applied, unless the decorator itself prints during decoration.',
        explanation: 'Decoration can run code at definition time; the wrapper runs at call time.'
      })
    ];
  }

  if (k === "decorator functions - decorators + return values (don't lose results)") {
    return [
      buildShortAnswer({
        prompt: 'What common bug causes a decorated function to start returning `None` unexpectedly?',
        expectedAnswer: 'The wrapper calls the original function but forgets to `return` its result.',
        explanation: 'A function with no return statement returns `None` in Python.'
      }),
      buildShortAnswer({
        prompt: 'Fix this wrapper so it preserves the return value:\n\n```python\ndef dec(func):\n    def wrapper(x):\n        func(x)\n    return wrapper\n```',
        expectedAnswer: 'Example:\n\n```python\ndef dec(func):\n    def wrapper(x):\n        return func(x)\n    return wrapper\n```',
        explanation: 'Return the underlying function’s result from the wrapper.'
      }),
      buildShortAnswer({
        prompt: 'Should a decorator generally swallow exceptions from the wrapped function? Why?',
        expectedAnswer: 'Usually no; swallowing exceptions hides failures. Decorators should let exceptions propagate unless they are explicitly designed to handle/retry/report them.',
        explanation: 'Unexpected suppression makes debugging and correctness worse.'
      })
    ];
  }

  if (k === 'decorator functions - using *args and **kwargs (general-purpose)') {
    return [
      buildShortAnswer({
        prompt: 'Why do general-purpose decorators often use `*args` and `**kwargs` in the wrapper?',
        expectedAnswer: 'To support wrapping functions with arbitrary signatures (different positional and keyword arguments) without rewriting the decorator for each shape.',
        explanation: 'It makes the decorator reusable across many functions.'
      }),
      buildShortAnswer({
        prompt: 'Write the core forwarding pattern for a general-purpose wrapper that preserves the result.',
        expectedAnswer: 'Example:\n\n```python\ndef dec(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n```',
        explanation: 'Forward all args/kwargs and return the underlying result.'
      }),
      buildShortAnswer({
        prompt: 'What is one common mistake when writing `*args/**kwargs` wrappers, and what does it break?',
        expectedAnswer: 'Forgetting to forward arguments (calling `func()` with no args) or forgetting to return. This breaks the wrapped function’s behavior and often causes `TypeError` or lost return values.',
        explanation: 'A decorator should preserve call semantics unless intentionally changing them.'
      })
    ];
  }

  if (k === 'decorator functions - practical: safe division (avoid crash)') {
    return [
      buildShortAnswer({
        prompt: 'Write a decorator that catches `ZeroDivisionError` from the wrapped function and returns `None` instead (but re-raises any other exception).',
        expectedAnswer:
          'Example:\n\n```python\nfrom functools import wraps\n\ndef safe_division(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        try:\n            return func(*args, **kwargs)\n        except ZeroDivisionError:\n            return None\n    return wrapper\n```',
        explanation: 'Handle the one expected failure; don’t accidentally swallow unrelated bugs.'
      }),
      buildShortAnswer({
        prompt: 'Why might returning `None` be better than returning `0` for a failed division?',
        expectedAnswer: 'Because `0` can be a valid result, while `None` clearly signals “no value / failure” (and forces the caller to handle it).',
        explanation: 'Pick a failure signal that can’t be confused with a legitimate output.'
      }),
      buildShortAnswer({
        prompt: 'Name one downside of catching exceptions inside a decorator for math operations.',
        expectedAnswer: 'It can hide errors and make debugging harder if it turns failures into “normal-looking” values. It also changes the function’s contract.',
        explanation: 'Use clear naming, documentation, and narrow exception types.'
      })
    ];
  }

  if (k === 'decorator functions - decorator chaining (order matters)') {
    return [
      buildShortAnswer({
        prompt: 'If you write:\n\n```python\n@a\n@b\ndef f():\n    pass\n```\n\nwhat is the equivalent without `@` syntax?',
        expectedAnswer: '`f = a(b(f))`',
        explanation: 'Decorators apply from the inside out (nearest to the function runs first).' 
      }),
      buildShortAnswer({
        prompt: 'In which order do wrappers execute at call time for `f = a(b(f))`?',
        expectedAnswer: 'At call time: `a` wrapper runs first, then it calls into `b` wrapper, which then calls the original function.',
        explanation: 'The outermost wrapper is called first; it delegates inward.'
      }),
      buildShortAnswer({
        prompt: 'Give one real bug that chaining can cause if decorators both modify arguments or return values.',
        expectedAnswer: 'One decorator may transform inputs/outputs into a type the next decorator doesn’t expect (e.g., converting exceptions to `None`, then another decorator assumes a numeric result and crashes).',
        explanation: 'Composition works only if the contracts line up; order matters.'
      })
    ];
  }

  if (k === 'decorator functions - preserving function metadata (functools.wraps)') {
    return [
      buildShortAnswer({
        prompt: 'What problem does `functools.wraps` solve for decorators?',
        expectedAnswer: 'It copies metadata like `__name__`, `__doc__`, and `__module__` from the original function onto the wrapper.',
        explanation: 'Without it, tools and debugging output often show `wrapper` instead of the real function.'
      }),
      buildShortAnswer({
        prompt: 'Add `wraps` to this decorator:\n\n```python\ndef dec(func):\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n```',
        expectedAnswer:
          'Example:\n\n```python\nfrom functools import wraps\n\ndef dec(func):\n    @wraps(func)\n    def wrapper(*args, **kwargs):\n        return func(*args, **kwargs)\n    return wrapper\n```',
        explanation: '`@wraps(func)` is applied to the wrapper function.'
      }),
      buildShortAnswer({
        prompt: 'Name two places where losing metadata causes real pain.',
        expectedAnswer: 'Tracebacks/logging (function names), introspection/help/docs, debuggers/profilers, and decorators in frameworks that rely on signatures/attributes.',
        explanation: 'Preserving identity improves observability and tooling.'
      })
    ];
  }

  if (k === 'decorator functions - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'You want a decorator that enforces “only positive numbers” for any numeric arguments. What signature should the wrapper use, and why?',
        expectedAnswer: 'Use `def wrapper(*args, **kwargs): ...` so it works with functions of different signatures (including methods with `self`).',
        explanation: '`*args/**kwargs` is the general-purpose forwarding pattern.'
      }),
      buildShortAnswer({
        prompt: 'In one sentence: when should you avoid a decorator and use a normal helper function instead?',
        expectedAnswer: 'Avoid decorators when they hide control flow or make the code harder to understand than a direct, explicit function call.',
        explanation: 'Readability is a feature; don’t over-abstract.'
      }),
      buildShortAnswer({
        prompt: 'What two things should a “transparent” decorator preserve by default?',
        expectedAnswer: 'Call semantics (args/kwargs + return value) and error behavior (exceptions), and ideally function metadata via `functools.wraps`.',
        explanation: 'Preserve behavior unless intentionally changing the contract.'
      })
    ];
  }

  if (k === 'generator functions - overview (yield + lazy sequences)') {
    return [
      buildShortAnswer({
        prompt: 'What does `yield` do differently than `return` in a function?',
        expectedAnswer: '`yield` produces a value and suspends the function’s state so it can resume later; `return` ends the function and produces a final result.',
        explanation: 'Generators are stateful iterators.'
      }),
      buildShortAnswer({
        prompt: 'Give one reason generators are memory-friendly compared to building a list.',
        expectedAnswer: 'They produce items one at a time instead of storing the entire sequence in memory.',
        explanation: 'This matters for large or infinite sequences.'
      }),
      buildShortAnswer({
        prompt: 'What protocol do generators implement that lets them work in `for` loops?',
        expectedAnswer: 'The iterator protocol: they are iterators with `__iter__` and `__next__` (and raise `StopIteration` when done).',
        explanation: 'That’s why they integrate seamlessly with iteration.'
      })
    ];
  }

  if (k === 'generator functions - your first generator (next + stopiteration)') {
    return [
      buildShortAnswer({
        prompt: 'What exception signals that an iterator (including a generator) is exhausted?',
        expectedAnswer: '`StopIteration`.',
        explanation: '`for` loops handle it automatically; `next()` will raise it.'
      }),
      buildShortAnswer({
        prompt: 'Write a tiny generator that yields 1, then 2, then stops.',
        expectedAnswer: 'Example:\n\n```python\ndef g():\n    yield 1\n    yield 2\n```',
        explanation: 'Falling off the end implicitly raises `StopIteration`.'
      }),
      buildShortAnswer({
        prompt: 'What does `next(it, default)` do differently than `next(it)`?',
        expectedAnswer: 'It returns `default` instead of raising `StopIteration` when the iterator is exhausted.',
        explanation: 'Useful for “try to get one more item” patterns.'
      })
    ];
  }

  if (k === 'generator functions - using generators with for-loops') {
    return [
      buildShortAnswer({
        prompt: 'Why does a `for` loop not need a `try/except StopIteration` when iterating a generator?',
        expectedAnswer: 'The `for` loop internally calls `iter()`/`next()` and stops automatically when `StopIteration` is raised.',
        explanation: 'Iteration protocol handling is built into the loop.'
      }),
      buildShortAnswer({
        prompt: 'Write a generator `count_up_to(n)` that yields 1..n (inclusive).',
        expectedAnswer:
          'Example:\n\n```python\ndef count_up_to(n):\n    for i in range(1, n + 1):\n        yield i\n```',
        explanation: '`yield` inside a loop produces values lazily.'
      }),
      buildShortAnswer({
        prompt: 'What happens if you iterate over the same generator object twice?',
        expectedAnswer: 'The second iteration yields nothing because the generator is already exhausted (unless you create a new generator object).',
        explanation: 'Generators are single-use iterators.'
      })
    ];
  }

  if (k === 'generator functions - generate first n numbers') {
    return [
      buildShortAnswer({
        prompt: 'Write a generator `first_n(n)` that yields 0..n-1.',
        expectedAnswer:
          'Example:\n\n```python\ndef first_n(n):\n    for i in range(n):\n        yield i\n```',
        explanation: 'This mirrors `range(n)` but demonstrates generator structure.'
      }),
      buildShortAnswer({
        prompt: 'If you do `list(first_n(3))`, what do you get?',
        expectedAnswer: '`[0, 1, 2]`',
        explanation: '`list(...)` consumes the generator fully.'
      }),
      buildShortAnswer({
        prompt: 'What’s a common pitfall when generating “first n” values regarding off-by-one errors?',
        expectedAnswer: 'Confusing inclusive vs exclusive endpoints (e.g., yielding 1..n instead of 0..n-1).',
        explanation: 'Be explicit about the range you want.'
      })
    ];
  }

  if (k === 'generator functions - fibonacci generator (with a limit)') {
    return [
      buildShortAnswer({
        prompt: 'Write a Fibonacci generator that yields values up to and including `limit`.',
        expectedAnswer:
          'Example:\n\n```python\ndef fib(limit):\n    a, b = 0, 1\n    while a <= limit:\n        yield a\n        a, b = b, a + b\n```',
        explanation: 'Update state after each yield.'
      }),
      buildShortAnswer({
        prompt: 'Why is a generator a nice fit for Fibonacci compared to building a list first?',
        expectedAnswer: 'You can stop as soon as you’ve produced enough values without allocating or computing the full sequence ahead of time.',
        explanation: 'It’s naturally incremental.'
      }),
      buildShortAnswer({
        prompt: 'If you call `next()` on a Fibonacci generator after it is exhausted, what happens?',
        expectedAnswer: 'It raises `StopIteration`.',
        explanation: 'Exhaustion is signaled consistently for all iterators.'
      })
    ];
  }

  if (k === 'generator functions - generators vs lists (memory intuition)') {
    return [
      buildShortAnswer({
        prompt: 'Explain the key memory difference between `[x*x for x in nums]` and `(x*x for x in nums)`.',
        expectedAnswer: 'The list comprehension builds the entire list in memory; the generator expression produces one value at a time when iterated.',
        explanation: 'Same idea, different evaluation strategy.'
      }),
      buildShortAnswer({
        prompt: 'When might a list be better than a generator?',
        expectedAnswer: 'When you need to iterate multiple times, index/slice results, or know you must store everything anyway (small datasets).',
        explanation: 'Generators trade reusability/random access for laziness.'
      }),
      buildShortAnswer({
        prompt: 'What happens if you do `sum(gen)` where `gen` is a generator?',
        expectedAnswer: 'It consumes the generator fully and returns the total; afterwards the generator is exhausted.',
        explanation: 'Many consumers iterate once and drain it.'
      })
    ];
  }

  if (k === 'generator functions - performance note (what to measure)') {
    return [
      buildShortAnswer({
        prompt: 'What should you measure when deciding between a generator and a list: runtime, memory, or both? Explain briefly.',
        expectedAnswer: 'Both. Generators often reduce peak memory and can start producing results earlier, but they may have per-item overhead; lists may be faster when you need random access or multiple passes.',
        explanation: 'Performance is multi-dimensional; measure the thing you actually care about.'
      }),
      buildShortAnswer({
        prompt: 'Name one good tool/pattern for timing small Python code snippets and one common timing mistake to avoid.',
        expectedAnswer: 'Use `timeit` (or `python -m timeit`). Avoid timing a single run or including unrelated startup/I/O in the measurement.',
        explanation: 'Repeated runs reduce noise; isolate what you’re measuring.'
      }),
      buildShortAnswer({
        prompt: 'Give one situation where a generator is a bad optimization even if it saves memory.',
        expectedAnswer: 'When you must iterate the data multiple times or need indexing/slicing; you’ll end up materializing anyway, adding complexity without benefit.',
        explanation: 'Choose the simplest structure that fits the access pattern.'
      })
    ];
  }

  if (k === 'generator functions - mini program: streaming a big file safely') {
    return [
      buildShortAnswer({
        prompt: 'Why is `for line in f:` typically preferred over `f.read()` for huge files?',
        expectedAnswer: 'Iterating reads incrementally (streaming) so you don’t load the whole file into memory at once.',
        explanation: 'Streaming keeps memory usage stable for large inputs.'
      }),
      buildShortAnswer({
        prompt: 'Write a generator `non_empty_lines(path)` that yields stripped, non-empty lines from a text file.',
        expectedAnswer:
          'Example:\n\n```python\ndef non_empty_lines(path):\n    with open(path, "r", encoding="utf-8") as f:\n        for line in f:\n            s = line.strip()\n            if s:\n                yield s\n```',
        explanation: 'Use a context manager and yield processed lines.'
      }),
      buildShortAnswer({
        prompt: 'What’s one robust way to handle unexpected encoding errors when streaming a file?',
        expectedAnswer: 'Open with an explicit encoding and choose an error strategy like `errors="replace"` or `errors="ignore"`, depending on requirements.',
        explanation: 'You must decide whether losing/altering characters is acceptable.'
      })
    ];
  }

  if (k === 'generator functions - common pitfalls (exhaustion + one-time use)') {
    return [
      buildShortAnswer({
        prompt: 'Why does iterating over the same generator object twice produce no items the second time?',
        expectedAnswer: 'Because generators are iterators with internal state; once exhausted they stay exhausted. You must create a new generator object to iterate again.',
        explanation: 'A generator is not a “reusable collection”.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal example that demonstrates generator exhaustion in two loops.',
        expectedAnswer:
          'Example:\n\n```python\ng = (x for x in [1, 2])\nfor _ in g: pass\nprint(list(g))  # []\n```',
        explanation: 'The second consumer sees nothing because the generator was drained.'
      }),
      buildShortAnswer({
        prompt: 'Give one safe pattern when you need to iterate twice but still want laziness.',
        expectedAnswer: 'Use a generator *factory* (a function that returns a new generator each time), or materialize once into a list if the data is small enough.',
        explanation: 'Recreate the iterator or store the results intentionally.'
      })
    ];
  }

  if (k === 'generator functions - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'You have a pipeline: read lines → clean → filter → count. Where do generators fit well, and why?',
        expectedAnswer: 'Generators fit well between stages: each stage yields items lazily to the next, keeping memory low and allowing streaming.',
        explanation: 'This is a classic “lazy pipeline” use-case.'
      }),
      buildShortAnswer({
        prompt: 'What is one fast way to “peek” at the first few values of a generator without consuming everything?',
        expectedAnswer: 'Use `itertools.islice(gen, n)` to take a small prefix (or `next(gen, default)` for one item).',
        explanation: 'Be mindful that peeking still consumes those yielded items.'
      }),
      buildShortAnswer({
        prompt: 'In one sentence: what is the most important rule when passing generators around multiple functions?',
        expectedAnswer: 'Assume they are one-shot streams; document who consumes them and avoid multiple consumers unless you deliberately materialize or recreate.',
        explanation: 'Many subtle bugs come from accidental double-consumption.'
      })
    ];
  }

  if (k === 'assertions - overview (debugging vs production)') {
    return [
      buildShortAnswer({
        prompt: 'What is `assert` for, and what is it NOT for?',
        expectedAnswer: '`assert` is for checking internal assumptions/invariants during development; it is not a replacement for validating user input or handling expected runtime errors.',
        explanation: 'Asserts communicate “this should never happen if the code is correct”.'
      }),
      buildShortAnswer({
        prompt: 'What exception is raised when an `assert` fails?',
        expectedAnswer: '`AssertionError`.',
        explanation: 'A failing assertion stops execution unless caught.'
      }),
      buildShortAnswer({
        prompt: 'Why can relying on `assert` for critical checks be dangerous in production?',
        expectedAnswer: 'Assertions can be disabled with Python optimization flags, so the check may be removed and the program could proceed with invalid state.',
        explanation: 'Use explicit `if ...: raise ...` for required validation.'
      })
    ];
  }

  if (k === 'assertions - simple assert (condition must be true)') {
    return [
      buildShortAnswer({
        prompt: 'Write a simple assertion that checks a list `nums` is non-empty before accessing the last item.',
        expectedAnswer: 'Example: `assert nums, "nums must be non-empty"`',
        explanation: 'Non-empty lists are truthy; empty lists are falsy.'
      }),
      buildShortAnswer({
        prompt: 'Why is `assert x > 0` typically a better assertion than `assert x != 0` for “must be positive” logic?',
        expectedAnswer: 'Because it matches the real invariant (positive), not just one disallowed value (zero). It fails for negative values too.',
        explanation: 'Make assertions express the actual contract.'
      }),
      buildShortAnswer({
        prompt: 'What should you do instead of `assert` when the error is expected due to user input?',
        expectedAnswer: 'Use explicit validation and raise a meaningful exception (e.g., `ValueError`) or return an error result, depending on your API.',
        explanation: 'Expected failures are part of normal control flow, not programmer mistakes.'
      })
    ];
  }

  if (k === 'assertions - augmented assert (custom message)') {
    return [
      buildShortAnswer({
        prompt: 'What does the second part in `assert condition, "message"` do?',
        expectedAnswer: 'It becomes the error message attached to the raised `AssertionError` when the condition is false.',
        explanation: 'It helps you debug quickly by explaining what invariant failed.'
      }),
      buildShortAnswer({
        prompt: 'Write an augmented assertion that checks `0 <= i < len(items)` with a helpful message.',
        expectedAnswer: 'Example: `assert 0 <= i < len(items), f"index {i} out of range for {len(items)} items"`',
        explanation: 'Include the values that make the failure diagnosable.'
      }),
      buildShortAnswer({
        prompt: 'When is the custom message expression evaluated in an `assert` statement?',
        expectedAnswer: 'Only when the assertion fails (i.e., when the condition is false).',
        explanation: 'This is why f-strings in assert messages are usually fine.'
      })
    ];
  }

  if (k === 'assertions - catching a real bug (example)') {
    return [
      buildShortAnswer({
        prompt: 'Give one example of a “real bug” that a well-placed assert can catch early in development.',
        expectedAnswer: 'Example: asserting a function precondition like `assert 0 <= percent <= 100` before using it to compute a discount, catching out-of-range values during testing.',
        explanation: 'Asserts are great for catching violated assumptions near the source.'
      }),
      buildShortAnswer({
        prompt: 'Why is it better to assert close to where bad data is introduced instead of where it breaks later?',
        expectedAnswer: 'It shortens the “bug distance” so the failure points directly to the cause, making debugging faster and preventing cascading errors.',
        explanation: 'Early, local failures are easier to diagnose.'
      }),
      buildShortAnswer({
        prompt: 'When would you NOT use an assert for a check, even if it catches bugs?',
        expectedAnswer: 'When the condition can be false due to normal runtime situations (user input, network, file I/O). Use exceptions/handling instead.',
        explanation: 'Asserts are not user-facing error handling.'
      })
    ];
  }

  if (k === 'assertions - assertions vs exception handling') {
    return [
      buildShortAnswer({
        prompt: 'In one sentence, contrast an assertion failure vs raising a `ValueError`.',
        expectedAnswer: 'Assertion failures indicate programmer/invariant violations; `ValueError` indicates the caller provided a bad value in a situation the program is expected to handle.',
        explanation: 'They communicate different kinds of problems.'
      }),
      buildShortAnswer({
        prompt: 'Which is more appropriate for validating user input: `assert` or `if ...: raise ValueError`? Why?',
        expectedAnswer: '`if ...: raise ValueError` because the check must always run and should provide a clear, stable error contract for callers.',
        explanation: 'Asserts may be removed and are meant for internal correctness checks.'
      }),
      buildShortAnswer({
        prompt: 'Give one example where assertions and exceptions can both appear in the same function appropriately.',
        expectedAnswer: 'Assert internal invariants (e.g., sortedness after an internal step) and raise `ValueError` for invalid caller input (e.g., negative `n`).',
        explanation: 'Use each tool for the type of failure it represents.'
      })
    ];
  }

  if (k === 'assertions - enabling/disabling asserts (important note)') {
    return [
      buildShortAnswer({
        prompt: 'How can assertions be disabled when running Python, and what’s the implication?',
        expectedAnswer: 'Run Python with optimizations (e.g., `-O`), which removes assert statements. Implication: asserts must not contain required program logic.',
        explanation: 'Never rely on asserts for security or business rules.'
      }),
      buildShortAnswer({
        prompt: 'What built-in name tells you whether assertions are enabled?',
        expectedAnswer: '`__debug__` (it is `True` normally and `False` under optimized mode).',
        explanation: 'This is tied to how Python is invoked.'
      }),
      buildShortAnswer({
        prompt: 'Rewrite an assertion-based validation into a production-safe check (one example).',
        expectedAnswer:
          'Example:\n\n```python\n# instead of: assert x > 0\nif x <= 0:\n    raise ValueError("x must be > 0")\n```',
        explanation: 'Explicit checks always run and communicate a stable error type.'
      })
    ];
  }

  if (k === 'assertions - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Write one rule of thumb: when should you use `assert`, and when should you raise a real exception like `ValueError`?',
        expectedAnswer: 'Use `assert` for internal invariants/assumptions (programmer errors). Raise `ValueError`/`TypeError` for invalid caller input or expected runtime problems that must be handled in production.',
        explanation: 'Asserts communicate “this should never happen if code is correct”.'
      }),
      buildShortAnswer({
        prompt: 'Convert this assertion into production-safe validation:\n\n```python\nassert age >= 0\n```',
        expectedAnswer:
          'Example:\n\n```python\nif age < 0:\n    raise ValueError("age must be non-negative")\n```',
        explanation: 'Required validation should not disappear under optimization.'
      }),
      buildShortAnswer({
        prompt: 'What is one common anti-pattern with asserts that makes debugging worse?',
        expectedAnswer: 'Using vague assertions (e.g., `assert x`) with no message or wrong invariant, or putting side effects/business logic inside asserts. Prefer precise conditions and helpful messages.',
        explanation: 'Good asserts document intent and fail with useful context.'
      })
    ];
  }

  if (k === 'file handling - why files? (text vs binary)') {
    return [
      buildShortAnswer({
        prompt: 'In simple terms, what’s the difference between opening a file in text mode vs binary mode?',
        expectedAnswer: 'Text mode reads/writes `str` and performs encoding/decoding (and may translate newlines). Binary mode reads/writes raw `bytes` with no encoding step.',
        explanation: 'Use text for human-readable data; use binary for images/audio/pdfs or exact byte control.'
      }),
      buildShortAnswer({
        prompt: 'Why is it unsafe to copy an image by opening it with `open("img.png", "r")`?',
        expectedAnswer: 'Because text mode decodes bytes as text using an encoding, which can corrupt binary data. Use `"rb"`/`"wb"` to copy bytes exactly.',
        explanation: 'Binary files are not valid text; decoding them is lossy/invalid.'
      }),
      buildShortAnswer({
        prompt: 'What does the `encoding=` argument control when opening a text file?',
        expectedAnswer: 'It determines how bytes in the file are decoded into Python strings (and how strings are encoded back to bytes when writing).',
        explanation: 'Always be explicit when you care about consistent behavior across systems.'
      })
    ];
  }

  if (k === 'file handling - open() and file modes') {
    return [
      buildShortAnswer({
        prompt: 'Name what these modes mean: `r`, `w`, `a`, and `x`.',
        expectedAnswer: '`r` read existing, `w` write (truncate/create), `a` append (create if missing), `x` create and fail if exists.',
        explanation: 'Choosing the right mode prevents accidental data loss.'
      }),
      buildShortAnswer({
        prompt: 'What do `b` and `t` mean in a mode string like `"rb"` or `"wt"`?',
        expectedAnswer: '`b` means binary (bytes), `t` means text (strings). Text is the default, but being explicit can improve clarity.',
        explanation: 'Binary mode is required for non-text data.'
      }),
      buildShortAnswer({
        prompt: 'What does `+` do in file modes (e.g., `"r+"`, `"w+"`)?',
        expectedAnswer: 'It enables both reading and writing. For example `r+` reads/writes without truncating; `w+` truncates then reads/writes; `a+` appends and can read too.',
        explanation: 'Be careful: some `+` modes still truncate (`w+`).'
      })
    ];
  }

  if (k === 'file handling - closing files (and why with is better)') {
    return [
      buildShortAnswer({
        prompt: 'Why is `with open(...) as f:` preferred over manual `f = open(...); f.close()`?',
        expectedAnswer: 'It guarantees the file is closed even if an exception occurs, preventing leaks and locked files.',
        explanation: 'Context managers provide safe cleanup.'
      }),
      buildShortAnswer({
        prompt: 'Write the safe pattern to read a whole text file into a string using `with`.',
        expectedAnswer:
          'Example:\n\n```python\nwith open(path, "r", encoding="utf-8") as f:\n    text = f.read()\n```',
        explanation: 'The file is closed automatically when the block exits.'
      }),
      buildShortAnswer({
        prompt: 'What can happen on Windows if you forget to close a file before trying to rename/delete it?',
        expectedAnswer: 'You can get permission/locking errors because the OS still considers the file “in use”.',
        explanation: 'Closing is part of correct resource management.'
      })
    ];
  }

  if (k === 'file handling - file object properties') {
    return [
      buildShortAnswer({
        prompt: 'Name two useful attributes or properties of a file object for debugging.',
        expectedAnswer: 'Examples: `f.name`, `f.mode`, `f.closed` (and sometimes `f.encoding` for text files).',
        explanation: 'These help confirm what you opened and how.'
      }),
      buildShortAnswer({
        prompt: 'If `f.closed` is `True`, what will happen if you call `f.read()`?',
        expectedAnswer: 'It raises a `ValueError` because the I/O operation is on a closed file.',
        explanation: 'Closed resources can’t be used.'
      }),
      buildShortAnswer({
        prompt: 'How do you check whether a file object is reading bytes or strings?',
        expectedAnswer: 'Check the mode (`"b"` vs text) or read one chunk and check the type (`bytes` vs `str`).',
        explanation: 'Text vs binary affects how you process the data.'
      })
    ];
  }

  if (k === 'file handling - writing text: write() and writelines()') {
    return [
      buildShortAnswer({
        prompt: 'What does `write()` return, and why might it be useful?',
        expectedAnswer: 'It returns the number of characters written (in text mode).',
        explanation: 'You can use it for sanity checks or logging.'
      }),
      buildShortAnswer({
        prompt: 'What is the most common mistake when using `writelines()`?',
        expectedAnswer: '`writelines()` does not add newlines automatically; you must include `\\n` in each string if you want lines.',
        explanation: 'Many people expect it to behave like “print each line”.'
      }),
      buildShortAnswer({
        prompt: 'Write a small snippet that writes three lines to a file safely.',
        expectedAnswer:
          'Example:\n\n```python\nlines = ["a\\n", "b\\n", "c\\n"]\nwith open("out.txt", "w", encoding="utf-8") as f:\n    f.writelines(lines)\n```',
        explanation: 'Include newlines and use a context manager.'
      })
    ];
  }

  if (k === 'file handling - reading text: read / read(n) / readline / readlines') {
    return [
      buildShortAnswer({
        prompt: 'When is `read()` a bad idea, and what should you do instead?',
        expectedAnswer: 'It’s a bad idea for very large files because it loads everything into memory. Instead iterate line-by-line or read chunks with `read(n)`.',
        explanation: 'Streaming avoids large memory spikes.'
      }),
      buildShortAnswer({
        prompt: 'What does `readline()` return when it hits end-of-file?',
        expectedAnswer: 'An empty string `""` in text mode (or `b""` in binary mode).',
        explanation: 'EOF is signaled by an empty read.'
      }),
      buildShortAnswer({
        prompt: 'What does `readlines()` return, and what’s the trade-off?',
        expectedAnswer: 'It returns a list of all remaining lines. Trade-off: it can use a lot of memory for large files.',
        explanation: 'A list materializes everything.'
      })
    ];
  }

  if (k === 'file handling - reading with for-loop (best for big files)') {
    return [
      buildShortAnswer({
        prompt: 'Why is `for line in f:` usually the best default for reading big text files?',
        expectedAnswer: 'It streams one line at a time efficiently without loading the entire file into memory.',
        explanation: 'It’s simple, readable, and memory-friendly.'
      }),
      buildShortAnswer({
        prompt: 'Write a snippet that counts non-empty lines in a file using a for-loop.',
        expectedAnswer:
          'Example:\n\n```python\ncount = 0\nwith open(path, "r", encoding="utf-8") as f:\n    for line in f:\n        if line.strip():\n            count += 1\n```',
        explanation: 'Strip whitespace to detect blank lines.'
      }),
      buildShortAnswer({
        prompt: 'What subtle bug can happen if you do `for line in f:` and also call `f.read()` inside the loop?',
        expectedAnswer: 'You’ll consume the file iterator unexpectedly (advancing the pointer), which can skip data or end the loop early.',
        explanation: 'Mixing iteration and manual reads changes the shared file pointer.'
      })
    ];
  }

  if (k === 'file handling - tell() and seek() (file pointer)') {
    return [
      buildShortAnswer({
        prompt: 'What does `tell()` return and what does `seek(pos)` do?',
        expectedAnswer: '`tell()` returns the current file position; `seek(pos)` moves the file pointer to a specific position.',
        explanation: 'They let you read/write from specific offsets.'
      }),
      buildShortAnswer({
        prompt: 'Why is using `seek()` with text files sometimes tricky compared to binary files?',
        expectedAnswer: 'Text mode involves decoding and newline handling; positions aren’t always simple byte offsets. Binary mode positions are byte offsets and are more predictable.',
        explanation: 'Prefer binary mode for precise byte-level seeking.'
      }),
      buildShortAnswer({
        prompt: 'Write a tiny example that reads the first 5 characters, then rewinds and reads again.',
        expectedAnswer:
          'Example:\n\n```python\nwith open(path, "r", encoding="utf-8") as f:\n    first = f.read(5)\n    f.seek(0)\n    again = f.read(5)\n```',
        explanation: 'Seeking changes where the next read starts.'
      })
    ];
  }

  if (k === 'file handling - check file exists (pathlib)') {
    return [
      buildShortAnswer({
        prompt: 'Using `pathlib`, how do you check that a path exists and is a file (not a directory)?',
        expectedAnswer:
          'Example:\n\n```python\nfrom pathlib import Path\np = Path("data.txt")\nif p.is_file():\n    ...\n```',
        explanation: '`exists()` checks existence; `is_file()` distinguishes files from directories.'
      }),
      buildShortAnswer({
        prompt: 'Why is “check then open” (`if p.exists(): open(p)`) not always safe in concurrent programs?',
        expectedAnswer: 'Because of race conditions (TOCTOU): the file can change between the check and the open. It’s often better to handle the exception from `open`.',
        explanation: 'In real systems, the filesystem can change at any time.'
      }),
      buildShortAnswer({
        prompt: 'What exception should you typically handle if you try to open a missing file for reading?',
        expectedAnswer: '`FileNotFoundError`.',
        explanation: 'Catching the right exception is cleaner than pre-checks.'
      })
    ];
  }

  if (k === 'file handling - count lines, words, characters') {
    return [
      buildShortAnswer({
        prompt: 'What’s the difference between counting “lines” and counting newline characters when reading a text file?'
          ,
        expectedAnswer: '“Lines” are logical records (usually separated by newlines). A file can end without a final newline, so “number of \"\\n\" characters” can be less than the number of lines.',
        explanation: 'A robust line count usually uses iteration (`for line in f`) rather than counting newline bytes.'
      }),
      buildShortAnswer({
        prompt: 'Give a memory-friendly one-liner to count lines in a text file.',
        expectedAnswer:
          'Example:\n\n```python\nwith open(path, "r", encoding="utf-8") as f:\n    line_count = sum(1 for _ in f)\n```',
        explanation: 'Iterating streams the file and avoids loading it all at once.'
      }),
      buildShortAnswer({
        prompt: 'Write a small snippet that counts lines, words, and characters in one pass (ignoring the trailing newline in the character count).',
        expectedAnswer:
          'Example:\n\n```python\nlines = words = chars = 0\nwith open(path, "r", encoding="utf-8") as f:\n    for line in f:\n        lines += 1\n        stripped = line.rstrip("\\n")\n        chars += len(stripped)\n        words += len(stripped.split())\n```',
        explanation: 'Use `split()` to handle multiple spaces; `rstrip("\\n")` avoids counting newlines as characters.'
      })
    ];
  }

  if (k === 'file handling - binary files (copy an image safely)') {
    return [
      buildShortAnswer({
        prompt: 'Why must you open image/video/audio files with `"rb"`/`"wb"` instead of text mode?',
        expectedAnswer: 'Binary files contain arbitrary bytes that are not valid text; text mode may decode/encode and translate newlines, corrupting the data.',
        explanation: 'Binary mode preserves bytes exactly.'
      }),
      buildShortAnswer({
        prompt: 'Show a safe way to copy a binary file in chunks (so you don’t load it all into memory).',
        expectedAnswer:
          'Example:\n\n```python\nCHUNK = 1024 * 1024\nwith open(src, "rb") as r, open(dst, "wb") as w:\n    while True:\n        buf = r.read(CHUNK)\n        if not buf:\n            break\n        w.write(buf)\n```',
        explanation: 'Chunked reads/writes are both memory-friendly and fast enough for most cases.'
      }),
      buildShortAnswer({
        prompt: 'What standard-library helper can copy file-like objects efficiently without writing the loop yourself?',
        expectedAnswer: 'Use `shutil.copyfileobj(r, w)` (or `shutil.copy2` for path-to-path copying with metadata).',
        explanation: '`shutil` provides battle-tested file copying helpers.'
      })
    ];
  }

  if (k === 'file handling - csv files (write/read)') {
    return [
      buildShortAnswer({
        prompt: 'Why should you open CSV files with `newline=""` on Windows when using the `csv` module?',
        expectedAnswer: 'To prevent doubled blank lines: the `csv` module handles newlines itself, and extra newline translation can insert blank rows.',
        explanation: 'The recommended pattern is `open(..., newline="")`.'
      }),
      buildShortAnswer({
        prompt: 'Write a snippet that writes rows to a CSV file using `csv.DictWriter`.',
        expectedAnswer:
          'Example:\n\n```python\nimport csv\n\nrows = [\n    {"name": "Ada", "score": 95},\n    {"name": "Linus", "score": 88},\n]\n\nwith open("scores.csv", "w", newline="", encoding="utf-8") as f:\n    writer = csv.DictWriter(f, fieldnames=["name", "score"])\n    writer.writeheader()\n    writer.writerows(rows)\n```',
        explanation: 'DictWriter keeps column order consistent and writes a header row.'
      }),
      buildShortAnswer({
        prompt: 'When reading CSV, why might you choose `DictReader` over `reader`?',
        expectedAnswer: '`DictReader` maps each row to a dict keyed by the header names, which reduces index-based bugs and makes code more readable.',
        explanation: 'It also lets you access columns by name instead of position.'
      })
    ];
  }

  if (k === 'file handling - zip files (zip/unzip)') {
    return [
      buildShortAnswer({
        prompt: 'Which standard library module lets you create and extract ZIP files?',
        expectedAnswer: 'The `zipfile` module.',
        explanation: '`zipfile.ZipFile` supports reading/writing zip archives.'
      }),
      buildShortAnswer({
        prompt: 'Write a snippet that zips a directory (recursively) into `backup.zip`.',
        expectedAnswer:
          'Example:\n\n```python\nimport os\nfrom zipfile import ZipFile, ZIP_DEFLATED\n\nroot = "my_folder"\nwith ZipFile("backup.zip", "w", compression=ZIP_DEFLATED) as z:\n    for dirpath, _, filenames in os.walk(root):\n        for name in filenames:\n            full = os.path.join(dirpath, name)\n            arc = os.path.relpath(full, start=root)\n            z.write(full, arcname=arc)\n```',
        explanation: 'Use `relpath` so the archive has clean relative paths.'
      }),
      buildShortAnswer({
        prompt: 'Name one security concern when extracting ZIP files you didn’t create.',
        expectedAnswer: 'Path traversal (Zip Slip): entries like `../../evil.exe` can escape the target directory if extracted blindly.',
        explanation: 'Validate member paths before extracting untrusted archives.'
      })
    ];
  }

  if (k === 'file handling - directories with os (mkdir, listdir, walk)') {
    return [
      buildShortAnswer({
        prompt: 'What is the difference between `os.mkdir()` and `os.makedirs()`?',
        expectedAnswer: '`os.mkdir()` creates one directory level; `os.makedirs()` can create parent directories too (nested folders).',
        explanation: 'Use `exist_ok=True` with `makedirs` to avoid errors if it already exists.'
      }),
      buildShortAnswer({
        prompt: 'How do `os.listdir()` and `os.walk()` differ?',
        expectedAnswer: '`os.listdir()` lists entries in one directory; `os.walk()` traverses a directory tree recursively and yields `(root, dirs, files)`.',
        explanation: 'Use `walk` for recursive searching.'
      }),
      buildShortAnswer({
        prompt: 'Write a snippet that prints every `.txt` file path under a folder.',
        expectedAnswer:
          'Example:\n\n```python\nimport os\n\nfor root, _, files in os.walk(base_dir):\n    for name in files:\n        if name.lower().endswith(".txt"):\n            print(os.path.join(root, name))\n```',
        explanation: 'Always join paths with `os.path.join`.'
      })
    ];
  }

  if (k === 'file handling - file stats with os.stat (size + timestamps)') {
    return [
      buildShortAnswer({
        prompt: 'What does `os.stat(path).st_size` represent?',
        expectedAnswer: 'The file size in bytes.',
        explanation: 'It’s useful for reporting, validation, and simple sanity checks.'
      }),
      buildShortAnswer({
        prompt: 'How can you convert `st_mtime` into a readable datetime?',
        expectedAnswer:
          'Example:\n\n```python\nimport os\nfrom datetime import datetime\n\nst = os.stat(path)\nmodified = datetime.fromtimestamp(st.st_mtime)\n```',
        explanation: '`fromtimestamp` uses local time by default; you can use `utcfromtimestamp` for UTC.'
      }),
      buildShortAnswer({
        prompt: 'Why is file timestamp handling sometimes tricky across systems?',
        expectedAnswer: 'Timezones, filesystem differences, and OS semantics (created vs changed vs modified) can vary; network filesystems may behave differently too.',
        explanation: 'Treat timestamps as “best effort” metadata when portability matters.'
      })
    ];
  }

  if (k === 'file handling - running a command (os.system)') {
    return [
      buildShortAnswer({
        prompt: 'What does `os.system(cmd)` return?',
        expectedAnswer: 'An exit status code from the shell command (0 usually means success, non-zero means failure).',
        explanation: 'You typically check it to detect errors.'
      }),
      buildShortAnswer({
        prompt: 'Why is `os.system(user_input)` dangerous?',
        expectedAnswer: 'It can allow command injection if untrusted input becomes part of the shell command.',
        explanation: 'Prefer `subprocess.run([...])` with a list of arguments.'
      }),
      buildShortAnswer({
        prompt: 'Give a safer modern alternative to `os.system` for running a command and checking success.',
        expectedAnswer:
          'Example:\n\n```python\nimport subprocess\n\nsubprocess.run(["python", "--version"], check=True)\n```',
        explanation: '`check=True` raises an exception on non-zero exit codes.'
      })
    ];
  }

  if (k === 'file handling - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Design a small “file report” program: list 3 concrete requirements you would implement using this section’s tools.',
        expectedAnswer: 'Example requirements: (1) verify an input path exists and is a file, (2) count lines/words/chars, (3) write a summary to an output directory (creating it if missing).',
        explanation: 'Good practice problems combine existence checks, reading loops, and writing output.'
      }),
      buildShortAnswer({
        prompt: 'What are the two most common memory pitfalls in file handling, and what’s the default fix for each?',
        expectedAnswer: 'Pitfall 1: `f.read()` on huge files → iterate `for line in f`. Pitfall 2: `readlines()` on huge files → stream processing or chunked reads.',
        explanation: 'Streaming is the default safe pattern.'
      }),
      buildShortAnswer({
        prompt: 'Write a snippet that reads an input file and writes only non-empty lines to an output file.',
        expectedAnswer:
          'Example:\n\n```python\nwith open(src, "r", encoding="utf-8") as r, open(dst, "w", encoding="utf-8") as w:\n    for line in r:\n        if line.strip():\n            w.write(line)\n```',
        explanation: 'This keeps original newlines for preserved lines and streams both files.'
      })
    ];
  }

  if (k === 'object serialization - big picture (serialize vs deserialize)') {
    return [
      buildShortAnswer({
        prompt: 'Define serialization and deserialization in one line each.',
        expectedAnswer: 'Serialization converts an in-memory object to a storable/transmittable format; deserialization reconstructs the object from that format.',
        explanation: 'It’s how programs persist or exchange structured data.'
      }),
      buildShortAnswer({
        prompt: 'Give two common serialization formats and one key difference between them.',
        expectedAnswer: 'JSON and pickle. JSON is human-readable and language-agnostic; pickle is Python-specific and can represent more Python object types.',
        explanation: 'Choose based on portability vs fidelity.'
      }),
      buildShortAnswer({
        prompt: 'What is the most important safety rule about unpickling data?',
        expectedAnswer: 'Never unpickle data from untrusted sources; unpickling can execute arbitrary code.',
        explanation: 'Pickle is not a secure data format.'
      })
    ];
  }

  if (k === 'object serialization - pickle basics (dump/load)') {
    return [
      buildShortAnswer({
        prompt: 'Which module provides `dump` and `load` for pickle?',
        expectedAnswer: 'The `pickle` module.',
        explanation: '`pickle.dump(obj, file)` serializes; `pickle.load(file)` deserializes.'
      }),
      buildShortAnswer({
        prompt: 'Why should you open pickle files using binary modes like `"wb"` and `"rb"`?',
        expectedAnswer: 'Pickle data is bytes; binary mode avoids any text encoding/newline translation that could corrupt the stream.',
        explanation: 'Pickle is a binary protocol.'
      }),
      buildShortAnswer({
        prompt: 'Write a minimal example that pickles a dict to disk and loads it back.',
        expectedAnswer:
          'Example:\n\n```python\nimport pickle\n\ndata = {"user": "alice", "scores": [10, 20]}\n\nwith open("data.pkl", "wb") as f:\n    pickle.dump(data, f)\n\nwith open("data.pkl", "rb") as f:\n    loaded = pickle.load(f)\n```',
        explanation: 'Use context managers and binary modes for correctness.'
      })
    ];
  }

  if (k === 'object serialization - pickle multiple objects (eoferror pattern)') {
    return [
      buildShortAnswer({
        prompt: 'How do you store multiple Python objects in a single `.pkl` file using pickle?',
        expectedAnswer: 'Call `pickle.dump(obj, f)` multiple times on the same file opened in binary write/append mode.',
        explanation: 'A pickle file can contain a stream of multiple pickled objects back-to-back.'
      }),
      buildShortAnswer({
        prompt: 'Show the standard “read until EOF” pattern for loading multiple pickled objects from one file.',
        expectedAnswer:
          'Example:\n\n```python\nimport pickle\n\nitems = []\nwith open("items.pkl", "rb") as f:\n    while True:\n        try:\n            items.append(pickle.load(f))\n        except EOFError:\n            break\n```',
        explanation: '`pickle.load` raises `EOFError` when the stream ends.'
      }),
      buildShortAnswer({
        prompt: 'What’s a simpler alternative to avoid the EOFError loop if you control the file format?',
        expectedAnswer: 'Store a single container object (e.g., a list of items) and `dump` once, or use JSON/CSV depending on the data and portability needs.',
        explanation: 'Dumping one container is easier to reason about and often easier to version.'
      })
    ];
  }

  if (k === 'object serialization - pickle security + compatibility') {
    return [
      buildShortAnswer({
        prompt: 'Why is unpickling untrusted data dangerous?',
        expectedAnswer: 'Because pickle can execute arbitrary code during deserialization, so loading untrusted pickles can lead to remote code execution.',
        explanation: 'Treat pickle as a trusted, internal-only format.'
      }),
      buildShortAnswer({
        prompt: 'What does the “pickle protocol” affect, and how do you choose a protocol?',
        expectedAnswer: 'The protocol affects compatibility and efficiency. Use `protocol=pickle.HIGHEST_PROTOCOL` when both sides are modern Python; choose a specific lower protocol when you must support older Python versions.',
        explanation: 'Protocol is a versioned encoding format for pickled data.'
      }),
      buildShortAnswer({
        prompt: 'Name one common reason a pickle file stops loading after a code refactor, and one mitigation.',
        expectedAnswer: 'If you pickle instances of custom classes, renaming/moving the class or module can break unpickling. Mitigate by versioning your data, keeping stable import paths, or serializing plain dicts instead of class instances.',
        explanation: 'Pickle stores import paths and expects them to resolve on load.'
      })
    ];
  }

  if (k === 'object serialization - json basics (python types mapping)') {
    return [
      buildShortAnswer({
        prompt: 'List the basic Python → JSON type mappings for `dict`, `list`, `str`, `int/float`, `bool`, and `None`.',
        expectedAnswer: '`dict`→object, `list`/`tuple`→array, `str`→string, `int/float`→number, `bool`→true/false, `None`→null.',
        explanation: 'JSON supports only a small set of primitive types.'
      }),
      buildShortAnswer({
        prompt: 'What are two common JSON serialization errors in Python, and how do you fix them?',
        expectedAnswer: '1) Non-serializable types like `set`/`datetime` → convert to list/string (or provide a `default=` function). 2) Non-string dict keys → convert keys to strings.',
        explanation: 'JSON keys must be strings; custom types need conversion.'
      }),
      buildShortAnswer({
        prompt: 'Write a snippet that pretty-prints JSON and then parses it back into Python.',
        expectedAnswer:
          'Example:\n\n```python\nimport json\n\ndata = {"name": "Zoë", "scores": [10, 20], "active": True, "meta": None}\ntext = json.dumps(data, ensure_ascii=False, indent=2)\nloaded = json.loads(text)\n```',
        explanation: '`dumps` returns a string; `loads` parses a string.'
      })
    ];
  }

  if (k === 'object serialization - json.dumps vs json.dump') {
    return [
      buildShortAnswer({
        prompt: 'What is the key difference between `json.dumps()` and `json.dump()`?',
        expectedAnswer: '`json.dumps(obj)` returns a JSON string; `json.dump(obj, file)` writes JSON directly to a file-like object.',
        explanation: 'The “s” in `dumps/loads` usually implies “string”.'
      }),
      buildShortAnswer({
        prompt: 'Show a tiny example of both `dump` and `dumps` (including pretty printing).',
        expectedAnswer:
          'Example:\n\n```python\nimport json\n\nobj = {"a": 1, "b": 2}\ntext = json.dumps(obj, indent=2, sort_keys=True)\n\nwith open("data.json", "w", encoding="utf-8") as f:\n    json.dump(obj, f, indent=2, ensure_ascii=False)\n```',
        explanation: 'Both support formatting options like `indent`.'
      }),
      buildShortAnswer({
        prompt: 'What’s one robust pattern to write JSON without risking a half-written file if the program crashes?',
        expectedAnswer: 'Write to a temporary file, flush/close it, then rename/replace the destination atomically.',
        explanation: 'This avoids leaving a corrupted output file.'
      })
    ];
  }

  if (k === 'object serialization - json.loads vs json.load') {
    return [
      buildShortAnswer({
        prompt: 'What is the key difference between `json.loads()` and `json.load()`?',
        expectedAnswer: '`json.loads(text)` parses JSON from a string; `json.load(file)` parses JSON from a file-like object.',
        explanation: 'Again, “s” implies “string”.'
      }),
      buildShortAnswer({
        prompt: 'What exception should you handle for invalid JSON, and where does it come from?',
        expectedAnswer: 'Handle `json.JSONDecodeError` from the `json` module when parsing fails.',
        explanation: 'It typically indicates malformed JSON (trailing commas, invalid quotes, etc.).'
      }),
      buildShortAnswer({
        prompt: 'Write a snippet that loads JSON from a file and safely reads a nested field with a fallback.',
        expectedAnswer:
          'Example:\n\n```python\nimport json\n\nwith open("config.json", "r", encoding="utf-8") as f:\n    cfg = json.load(f)\n\ntimeout = cfg.get("http", {}).get("timeout", 10)\n```',
        explanation: 'Using `get` avoids `KeyError` when fields are missing.'
      })
    ];
  }

  if (k === 'object serialization - json for custom classes (to_dict/from_dict)') {
    return [
      buildShortAnswer({
        prompt: 'Why can’t you usually do `json.dumps(my_object)` for a custom class instance?',
        expectedAnswer: 'Because JSON knows how to serialize only basic types; custom objects must be converted into JSON-serializable structures like dicts/lists/strings.',
        explanation: 'You must define a representation of your object.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal `to_dict` / `from_dict` pattern for a custom class.',
        expectedAnswer:
          'Example:\n\n```python\nclass User:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    def to_dict(self):\n        return {"name": self.name, "age": self.age}\n\n    @classmethod\n    def from_dict(cls, d):\n        return cls(d["name"], d["age"])\n```',
        explanation: 'You control the schema and can evolve it over time.'
      }),
      buildShortAnswer({
        prompt: 'Name two “real world” fields that need special handling in JSON for custom classes.',
        expectedAnswer: 'Dates/times (convert to ISO strings) and decimals/UUIDs (convert to strings). Also nested objects require recursive `to_dict`.',
        explanation: 'JSON is limited to primitive types.'
      })
    ];
  }

  if (k === 'object serialization - json from an http api (requests)') {
    return [
      buildShortAnswer({
        prompt: 'What’s the difference between `response.text` and `response.json()` in `requests`?',
        expectedAnswer: '`response.text` is the raw response body decoded as text; `response.json()` parses the body as JSON and returns Python objects (or raises an error if it is not valid JSON).',
        explanation: 'Always validate status codes and handle parse failures.'
      }),
      buildShortAnswer({
        prompt: 'Write a robust snippet that fetches JSON from an API using `requests` with a timeout.',
        expectedAnswer:
          'Example:\n\n```python\nimport requests\n\nr = requests.get(url, timeout=10)\nr.raise_for_status()\ndata = r.json()\n```',
        explanation: 'Timeouts prevent hanging; `raise_for_status()` surfaces HTTP errors early.'
      }),
      buildShortAnswer({
        prompt: 'Name one common bug when consuming API JSON and a practical defense.',
        expectedAnswer: 'Assuming fields always exist or have the same type. Defend with validation, `.get(...)` defaults, and clear error messages when required fields are missing.',
        explanation: 'APIs evolve and can return partial/error payloads.'
      })
    ];
  }

  if (k === 'object serialization - yaml basics (pyyaml, safe_load)') {
    return [
      buildShortAnswer({
        prompt: 'Why should you prefer `yaml.safe_load` over `yaml.load` for YAML from untrusted sources?',
        expectedAnswer: '`safe_load` restricts YAML tags to safe basic types; unsafe loaders can construct arbitrary Python objects (security risk).',
        explanation: 'Treat YAML loading as a trust boundary (similar to pickle concerns).' 
      }),
      buildShortAnswer({
        prompt: 'What makes YAML attractive for config files compared to JSON?',
        expectedAnswer: 'YAML is more human-friendly (comments, less punctuation) and supports richer structures, though it is also easier to break with indentation mistakes.',
        explanation: 'JSON is stricter; YAML is more ergonomic for humans.'
      }),
      buildShortAnswer({
        prompt: 'Show a small example of parsing YAML into Python safely.',
        expectedAnswer:
          'Example:\n\n```python\nimport yaml\n\ntext = """\nname: app\nretries: 3\nflags:\n  - fast\n  - safe\n"""\n\ncfg = yaml.safe_load(text)\n```',
        explanation: 'This produces basic Python types (dict/list/str/int).' 
      })
    ];
  }

  if (k === 'object serialization - choose the right format (quick guide)') {
    return [
      buildShortAnswer({
        prompt: 'Pick the best format for each: (a) cross-language API payload, (b) internal trusted Python cache, (c) tabular spreadsheet-like data.',
        expectedAnswer: '(a) JSON, (b) pickle (trusted only), (c) CSV.',
        explanation: 'Choose based on interoperability, security, and data shape.'
      }),
      buildShortAnswer({
        prompt: 'Give two reasons you might choose YAML over JSON for configuration files.',
        expectedAnswer: 'Human readability (less punctuation) and comments support. YAML can be easier to edit, but it’s also easier to break with indentation errors.',
        explanation: 'YAML is often used for configs; JSON is often used for machine-to-machine interchange.'
      }),
      buildShortAnswer({
        prompt: 'State one strong rule of thumb about “unsafe deserialization”.',
        expectedAnswer: 'If the format can construct objects or run code (pickle / unsafe YAML loaders), never load it from untrusted sources.',
        explanation: 'Security beats convenience.'
      })
    ];
  }

  if (k === 'object serialization - section practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Design a small project using this section: list 3 steps that combine JSON/YAML/pickle safely.',
        expectedAnswer: 'Example: (1) Load a YAML config with `safe_load`, (2) call an HTTP API and parse JSON, (3) write a cleaned JSON result to disk (and optionally cache trusted internal data with pickle).',
        explanation: 'A good checkpoint combines choosing formats and handling errors.'
      }),
      buildShortAnswer({
        prompt: 'What are two “must have” error-handling checks when reading serialized data?',
        expectedAnswer: 'Handle parse errors (e.g., `JSONDecodeError`) and validate structure/types (required keys, expected list/dict shapes).',
        explanation: 'Deserialization is not the same as validation.'
      }),
      buildShortAnswer({
        prompt: 'Write a tiny snippet that safely loads JSON and falls back to defaults if the file is missing.',
        expectedAnswer:
          'Example:\n\n```python\nimport json\n\ntry:\n    with open("config.json", "r", encoding="utf-8") as f:\n        cfg = json.load(f)\nexcept FileNotFoundError:\n    cfg = {"retries": 3, "timeout": 10}\n```',
        explanation: 'Missing file is common; pick a sensible default and keep going.'
      })
    ];
  }

  if (k === 'oop - part 2 overview (inheritance + relationships)') {
    return [
      buildShortAnswer({
        prompt: 'What does IS-A mean in OOP, and what Python feature expresses it?',
        expectedAnswer: 'IS-A means one type is a specialized kind of another (subclassing). In Python you express it with inheritance, e.g., `class Dog(Animal): ...`.',
        explanation: 'Inheritance creates a type relationship and enables polymorphism.'
      }),
      buildShortAnswer({
        prompt: 'What does HAS-A mean, and how do you model it in Python?',
        expectedAnswer: 'HAS-A means one object contains/uses another object. You model it by storing an instance as an attribute (composition), e.g., `self.engine = Engine()`.',
        explanation: 'Composition models relationships without coupling types through inheritance.'
      }),
      buildShortAnswer({
        prompt: 'Give one rule of thumb for choosing inheritance vs composition.',
        expectedAnswer: 'Prefer composition by default; use inheritance only when the subclass truly can replace the base class everywhere (Liskov substitution / real “is-a”).',
        explanation: 'Inheritance is stronger coupling; composition is more flexible.'
      })
    ];
  }

  if (k === 'oop - has-a relationship (composition) with an example') {
    return [
      buildShortAnswer({
        prompt: 'What is composition, and how is it different from inheritance?',
        expectedAnswer: 'Composition means building a class by combining other objects as fields; inheritance means a class extends another class and reuses/overrides its behavior via the type hierarchy.',
        explanation: 'Composition is a “uses/has-a” relationship; inheritance is “is-a”.'
      }),
      buildShortAnswer({
        prompt: 'Write a tiny example of composition (a class that “has” another object).',
        expectedAnswer:
          'Example:\n\n```python\nclass Engine:\n    def start(self):\n        return "vroom"\n\nclass Car:\n    def __init__(self):\n        self.engine = Engine()\n\n    def drive(self):\n        return self.engine.start()\n```',
        explanation: '`Car` delegates to `Engine` rather than inheriting from it.'
      }),
      buildShortAnswer({
        prompt: 'Name one practical benefit of composition in real codebases.',
        expectedAnswer: 'You can swap implementations (e.g., `MockEngine` in tests) without changing the class hierarchy.',
        explanation: 'This tends to improve testability and reduce coupling.'
      })
    ];
  }

  if (k === 'oop - composition vs aggregation (strong vs weak ownership)') {
    return [
      buildShortAnswer({
        prompt: 'What’s the conceptual difference between composition and aggregation?',
        expectedAnswer: 'Composition implies strong ownership and aligned lifetimes (part doesn’t logically exist without the whole); aggregation is a weaker “uses” relationship where the part can exist independently.',
        explanation: 'In Python it’s mostly a design concept; code often looks similar.'
      }),
      buildShortAnswer({
        prompt: 'Give an example that fits composition and one that fits aggregation.',
        expectedAnswer: 'Composition: `Order` owns `OrderLine`s. Aggregation: `Team` references `Player`s who can exist without the team.',
        explanation: 'Think in terms of ownership and lifecycle.'
      }),
      buildShortAnswer({
        prompt: 'Why might this distinction matter even if Python doesn’t enforce ownership?',
        expectedAnswer: 'It guides responsibility (who creates/destroys/manages the object), API design, and who is allowed to mutate shared objects.',
        explanation: 'Clear ownership reduces bugs from shared mutable state.'
      })
    ];
  }

  if (k === 'oop - is-a relationship (inheritance) basics') {
    return [
      buildShortAnswer({
        prompt: 'What happens if both a parent class and child class define a method with the same name?',
        expectedAnswer: 'The child method overrides the parent method; calling it on a child instance uses the child implementation.',
        explanation: 'Attribute lookup finds members on the instance/class before falling back to base classes.'
      }),
      buildShortAnswer({
        prompt: 'How do you call the parent implementation from an overridden method?',
        expectedAnswer: 'Use `super()`, e.g., `super().method_name(...)`.',
        explanation: '`super()` follows Python’s method resolution order (MRO).'
      }),
      buildShortAnswer({
        prompt: 'How can you check at runtime whether an object is an instance of a subclass of a given base class?',
        expectedAnswer: 'Use `isinstance(obj, BaseClass)`.',
        explanation: '`isinstance` works across inheritance hierarchies.'
      })
    ];
  }

  if (k === 'oop - inheritance example (reusing parent members)') {
    return [
      buildShortAnswer({
        prompt: 'If a child class doesn’t override a method, where does Python find it?',
        expectedAnswer: 'Python looks it up in the parent class (and then further base classes) using the MRO.',
        explanation: 'Inheritance lets children reuse parent behavior automatically.'
      }),
      buildShortAnswer({
        prompt: 'Write a short example where a child reuses a parent method and adds a new method.',
        expectedAnswer:
          'Example:\n\n```python\nclass Animal:\n    def speak(self):\n        return "..."\n\nclass Dog(Animal):\n    def fetch(self):\n        return "ball"\n\nd = Dog()\nassert d.speak() == "..."\nassert d.fetch() == "ball"\n```',
        explanation: '`Dog` inherits `speak` and adds `fetch`.'
      }),
      buildShortAnswer({
        prompt: 'What is one common inheritance smell that suggests you should refactor to composition?',
        expectedAnswer: 'If the child only uses a tiny part of the parent or overrides most methods, the “is-a” relationship is likely wrong.',
        explanation: 'Overriding too much usually indicates poor hierarchy design.'
      })
    ];
  }

  if (k === 'oop - constructors in inheritance + super().__init__') {
    return [
      buildShortAnswer({
        prompt: 'Why do child classes often need to call `super().__init__(...)`?',
        expectedAnswer: 'To ensure the parent part of the object is initialized (parent attributes/invariants are set).',
        explanation: 'Skipping it can leave the object in an incomplete state.'
      }),
      buildShortAnswer({
        prompt: 'Write a minimal example of a child class that extends a parent constructor using `super()`.',
        expectedAnswer:
          'Example:\n\n```python\nclass User:\n    def __init__(self, name):\n        self.name = name\n\nclass Admin(User):\n    def __init__(self, name, level):\n        super().__init__(name)\n        self.level = level\n```',
        explanation: 'Parent initializes shared state; child adds its own.'
      }),
      buildShortAnswer({
        prompt: 'What bug often appears when you forget to call `super().__init__()` in a subclass?',
        expectedAnswer: 'Missing attributes that the parent was supposed to set (leading to `AttributeError` later).',
        explanation: 'The error often appears far from the constructor call site.'
      })
    ];
  }

  if (k === 'oop - has-a vs is-a (when to use what)') {
    return [
      buildShortAnswer({
        prompt: 'Give a quick test to decide if a relationship should be IS-A (inheritance).',
        expectedAnswer: 'If you can say “every X is a Y” and it stays true in all contexts (substitutability), then IS-A may fit.',
        explanation: 'If it’s only “X uses Y”, it’s usually HAS-A.'
      }),
      buildShortAnswer({
        prompt: 'Why is “inheritance for code reuse” alone a weak reason?',
        expectedAnswer: 'It creates tight coupling and can force incorrect type relationships; composition and delegation often give reuse with fewer constraints.',
        explanation: 'Prefer modeling reality/design correctness over convenience.'
      }),
      buildShortAnswer({
        prompt: 'Give a small example where composition is the better choice than inheritance.',
        expectedAnswer: 'A `Car` should have an `Engine`, not be an `Engine`. So use `self.engine = Engine()` instead of `class Car(Engine)`.',
        explanation: 'Wrong IS-A relationships lead to confusing APIs.'
      })
    ];
  }

  if (k === 'oop - types of inheritance (overview)') {
    return [
      buildShortAnswer({
        prompt: 'Name the common “types of inheritance” people talk about in OOP.',
        expectedAnswer: 'Single, multilevel, hierarchical, and multiple inheritance.',
        explanation: 'Python supports multiple inheritance; not all languages do.'
      }),
      buildShortAnswer({
        prompt: 'What is MRO and why does it matter in Python?',
        expectedAnswer: 'MRO is the Method Resolution Order: the order Python searches base classes for attributes/methods, especially important with multiple inheritance.',
        explanation: 'It determines which implementation `super()` and method lookup will use.'
      }),
      buildShortAnswer({
        prompt: 'What’s one reason teams avoid heavy multiple inheritance in Python?',
        expectedAnswer: 'It can make behavior hard to reason about (diamond patterns, surprising MRO), increasing maintenance cost.',
        explanation: 'Mixins can be useful, but deep multiple inheritance often becomes confusing.'
      })
    ];
  }

  if (k === 'oop - single inheritance') {
    return [
      buildShortAnswer({
        prompt: 'What is single inheritance?',
        expectedAnswer: 'A class inherits from exactly one direct parent class.',
        explanation: 'It’s the simplest inheritance model and is easy to reason about.'
      }),
      buildShortAnswer({
        prompt: 'Show a tiny example of overriding a parent method in single inheritance.',
        expectedAnswer:
          'Example:\n\n```python\nclass A:\n    def f(self):\n        return "A"\n\nclass B(A):\n    def f(self):\n        return "B"\n```',
        explanation: 'Calling `B().f()` returns the child behavior.'
      }),
      buildShortAnswer({
        prompt: 'What’s a safe way to reuse the parent implementation while extending behavior?',
        expectedAnswer: 'Call `super().f()` inside the override and add extra logic before/after.',
        explanation: 'This keeps parent behavior intact while customizing.'
      })
    ];
  }

  if (k === 'oop - multilevel inheritance') {
    return [
      buildShortAnswer({
        prompt: 'What is multilevel inheritance?',
        expectedAnswer: 'A chain of inheritance, e.g., `C` inherits from `B`, which inherits from `A`.',
        explanation: 'Behavior can be inherited through multiple levels.'
      }),
      buildShortAnswer({
        prompt: 'If a method is defined on `A`, and not overridden in `B` or `C`, can `C` call it?',
        expectedAnswer: 'Yes. `C` inherits it transitively through `B`.',
        explanation: 'Method lookup walks up the inheritance chain.'
      }),
      buildShortAnswer({
        prompt: 'What is one risk of very deep multilevel inheritance hierarchies?',
        expectedAnswer: 'They become hard to understand and change; behavior can be spread across many classes and overrides.',
        explanation: 'Deep hierarchies can hide complexity; composition can be clearer.'
      })
    ];
  }

  if (k === 'oop - hierarchical inheritance') {
    return [
      buildShortAnswer({
        prompt: 'What is hierarchical inheritance?',
        expectedAnswer: 'One base class is inherited by multiple child classes, e.g., `Animal` → `Dog` and `Cat`.',
        explanation: 'It models a family of specialized types under a common interface.'
      }),
      buildShortAnswer({
        prompt: 'Write a tiny example of hierarchical inheritance with a shared base method.',
        expectedAnswer:
          'Example:\n\n```python\nclass Animal:\n    def speak(self):\n        return "..."\n\nclass Dog(Animal):\n    def speak(self):\n        return "woof"\n\nclass Cat(Animal):\n    def speak(self):\n        return "meow"\n```',
        explanation: 'Each child overrides the same base method differently (polymorphism).' 
      }),
      buildShortAnswer({
        prompt: 'What is one common design risk of large hierarchical inheritance trees?',
        expectedAnswer: 'Base classes become “kitchen sinks” and changes to the base can break many children; the hierarchy can become hard to maintain.',
        explanation: 'Keep bases small and prefer composition when variation is orthogonal.'
      })
    ];
  }

  if (k === 'oop - multiple inheritance (method name conflicts)') {
    return [
      buildShortAnswer({
        prompt: 'If two parent classes define the same method name, which one does Python call?',
        expectedAnswer: 'Python uses the Method Resolution Order (MRO) to decide which method is found first.',
        explanation: 'The order of base classes in the class definition influences the MRO.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal example of a name conflict in multiple inheritance and how base order changes the result.',
        expectedAnswer:
          'Example:\n\n```python\nclass A:\n    def f(self):\n        return "A"\n\nclass B:\n    def f(self):\n        return "B"\n\nclass C(A, B):\n    pass\n\nclass D(B, A):\n    pass\n\nassert C().f() == "A"\nassert D().f() == "B"\n```',
        explanation: 'MRO checks bases left-to-right (with C3 linearization rules).' 
      }),
      buildShortAnswer({
        prompt: 'What’s a safer alternative to avoid name-conflict surprises with multiple inheritance?',
        expectedAnswer: 'Prefer composition or carefully designed mixins with clear, non-conflicting method names and cooperative `super()` usage.',
        explanation: 'Multiple inheritance can be useful but must be designed intentionally.'
      })
    ];
  }

  if (k === 'oop - hybrid inheritance (why mro matters)') {
    return [
      buildShortAnswer({
        prompt: 'What does “hybrid inheritance” mean in OOP discussions?',
        expectedAnswer: 'A design that mixes multiple inheritance patterns (e.g., hierarchical + multiple inheritance) in the same structure.',
        explanation: 'It often creates complex method lookup paths.'
      }),
      buildShortAnswer({
        prompt: 'Why does MRO matter more in hybrid/multiple inheritance than in single inheritance?',
        expectedAnswer: 'Because there can be multiple possible paths to a base class; MRO defines one consistent order for method lookup and for `super()` chaining.',
        explanation: 'Without a clear order, behavior would be ambiguous.'
      }),
      buildShortAnswer({
        prompt: 'What is the “diamond problem” in inheritance?',
        expectedAnswer: 'A class inherits from two classes that both inherit from a common base, creating a diamond-shaped hierarchy where the base appears twice in the graph.',
        explanation: 'Python’s C3 MRO ensures the shared base appears once in a consistent order.'
      })
    ];
  }

  if (k === 'oop - cyclic inheritance (not supported)') {
    return [
      buildShortAnswer({
        prompt: 'What is cyclic inheritance?',
        expectedAnswer: 'A cycle in the inheritance graph (e.g., `A` inherits from `B` and `B` inherits from `A`, directly or indirectly).',
        explanation: 'It makes method lookup impossible to order consistently.'
      }),
      buildShortAnswer({
        prompt: 'Does Python allow cyclic inheritance? Why or why not?',
        expectedAnswer: 'No. Python rejects it because it creates an invalid class hierarchy (no consistent MRO / infinite loops in the inheritance graph).',
        explanation: 'Inheritance must form a directed acyclic graph (DAG).' 
      }),
      buildShortAnswer({
        prompt: 'If you “feel like you need” cyclic inheritance, what’s a better design approach?',
        expectedAnswer: 'Use composition: have objects reference each other via attributes, or restructure responsibilities so types don’t depend on each other through inheritance.',
        explanation: 'Cycles are fine in object graphs, but not in inheritance graphs.'
      })
    ];
  }

  if (k === 'oop - method resolution order (mro) concept') {
    return [
      buildShortAnswer({
        prompt: 'What is MRO (Method Resolution Order) in Python?',
        expectedAnswer: 'The order Python follows to search classes (and base classes) for an attribute or method.',
        explanation: 'It defines which implementation is chosen when multiple bases exist.'
      }),
      buildShortAnswer({
        prompt: 'In one line, how do you reason about attribute lookup on an instance?',
        expectedAnswer: 'Python checks the instance, then the class, then base classes following the MRO.',
        explanation: 'MRO is critical in multiple inheritance.'
      }),
      buildShortAnswer({
        prompt: 'What does it mean that Python uses “C3 linearization” for MRO?',
        expectedAnswer: 'Python computes a consistent linear order of classes that respects local base order and ensures monotonic, predictable lookup (including diamonds).',
        explanation: 'You don’t need to implement it, but you should know it exists and why it prevents ambiguity.'
      })
    ];
  }

  if (k === 'oop - checking mro with .mro() and __mro__') {
    return [
      buildShortAnswer({
        prompt: 'How do you print the MRO for a class?',
        expectedAnswer: 'Use `MyClass.mro()` or `MyClass.__mro__`.',
        explanation: 'Both show the class lookup order used by Python.'
      }),
      buildShortAnswer({
        prompt: 'Write a small snippet that prints an MRO and explains what the last element usually is.',
        expectedAnswer:
          'Example:\n\n```python\nclass A: ...\nclass B(A): ...\n\nprint(B.mro())\n# or: print(B.__mro__)\n```\nThe last element is usually `object` (the root base class).',
        explanation: 'Most classes ultimately inherit from `object`.'
      }),
      buildShortAnswer({
        prompt: 'How can inspecting MRO help debug “wrong method called” issues?',
        expectedAnswer: 'It reveals which base class Python searches first; you can see exactly why a method from one parent wins over another.',
        explanation: 'MRO is the ground truth for method selection.'
      })
    ];
  }

  if (k === 'oop - super() basics (call parent behavior)') {
    return [
      buildShortAnswer({
        prompt: 'What does `super()` do in Python?',
        expectedAnswer: 'It gives access to the next method in the MRO, commonly used to call a parent implementation from an override.',
        explanation: 'It’s not “the parent class” in general; it’s “next in MRO”.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal example of using `super()` to extend a method.',
        expectedAnswer:
          'Example:\n\n```python\nclass Base:\n    def f(self):\n        return "base"\n\nclass Child(Base):\n    def f(self):\n        return super().f() + " + child"\n```',
        explanation: 'Child reuses base behavior and adds more.'
      }),
      buildShortAnswer({
        prompt: 'Why is `super()` generally preferred over calling `Base.f(self)` directly?',
        expectedAnswer: 'Because `super()` respects MRO and works with multiple inheritance; direct calls can skip classes or cause double-calls in complex hierarchies.',
        explanation: 'Use `super()` for cooperative method chains.'
      })
    ];
  }

  if (k === 'oop - super() in multiple inheritance (cooperative calls)') {
    return [
      buildShortAnswer({
        prompt: 'What does “cooperative multiple inheritance” mean in Python?',
        expectedAnswer: 'Each class calls `super()` so all relevant implementations in the MRO get a chance to run exactly once.',
        explanation: 'It’s how mixins are intended to work.'
      }),
      buildShortAnswer({
        prompt: 'Write a tiny example of two mixins cooperating via `super()`.',
        expectedAnswer:
          'Example:\n\n```python\nclass Base:\n    def f(self):\n        return "Base"\n\nclass M1(Base):\n    def f(self):\n        return "M1 -> " + super().f()\n\nclass M2(Base):\n    def f(self):\n        return "M2 -> " + super().f()\n\nclass C(M1, M2):\n    pass\n\n# C().f() uses the MRO chain\n```',
        explanation: 'Both mixins participate and the order is determined by `C`\'s MRO.'
      }),
      buildShortAnswer({
        prompt: 'What condition must hold for cooperative `super()` calls to work reliably?',
        expectedAnswer: 'All classes in the chain must consistently call `super()` and accept compatible signatures (often via `*args, **kwargs`).',
        explanation: 'One class that fails to call `super()` breaks the chain.'
      })
    ];
  }

  if (k === 'oop - important super() notes (common pitfalls)') {
    return [
      buildShortAnswer({
        prompt: 'What is a common pitfall when using `super()` with multiple inheritance?',
        expectedAnswer: 'Calling a base method directly (e.g., `Base.__init__`) instead of `super()` can skip other classes or cause double initialization.',
        explanation: 'Always think in terms of MRO chains.'
      }),
      buildShortAnswer({
        prompt: 'Why do mixin `__init__` methods often accept `*args, **kwargs`?',
        expectedAnswer: 'To remain compatible with other classes in the MRO chain; they forward arguments to `super().__init__` without tightly coupling parameter lists.',
        explanation: 'Signature compatibility is a major source of bugs.'
      }),
      buildShortAnswer({
        prompt: 'How can you quickly confirm what `super()` will call next?',
        expectedAnswer: 'Inspect `MyClass.mro()` and find the current class; the next class in that list is what `super()` resolves to for that method.',
        explanation: 'MRO inspection is the fastest debugging tool here.'
      })
    ];
  }

  if (k === 'oop - part 2 practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Given a base class and two mixins, outline a safe plan to combine them without surprises.',
        expectedAnswer: 'Define clear responsibilities per mixin, avoid name conflicts, ensure each mixin calls `super()`, use compatible signatures (often `*args, **kwargs`), and verify behavior with `Class.mro()` and small tests.',
        explanation: 'This is the “cooperative MI” recipe.'
      }),
      buildShortAnswer({
        prompt: 'Write a short checklist of what to test after introducing multiple inheritance into a codebase.',
        expectedAnswer: 'Test method dispatch (which method wins), `__init__` runs all needed initializers once, no duplicated side effects, and MRO matches expectations. Add tests that call through the public API, not internal methods.',
        explanation: 'Multiple inheritance failures are often subtle and order-dependent.'
      }),
      buildShortAnswer({
        prompt: 'Provide a tiny code snippet that prints MRO and demonstrates a cooperative method call chain.',
        expectedAnswer:
          'Example:\n\n```python\nclass Base:\n    def f(self):\n        return "Base"\n\nclass A(Base):\n    def f(self):\n        return "A->" + super().f()\n\nclass B(Base):\n    def f(self):\n        return "B->" + super().f()\n\nclass C(A, B):\n    pass\n\nprint(C.mro())\nprint(C().f())\n```',
        explanation: 'This shows both MRO and how `super()` walks that order.'
      })
    ];
  }

  if (k === 'oop - part 3 overview (polymorphism)') {
    return [
      buildShortAnswer({
        prompt: 'In one sentence, what is polymorphism in Python OOP?',
        expectedAnswer: 'Polymorphism means different objects can be used through the same interface (same method name), and each object provides its own behavior.',
        explanation: 'You call the same method, but the runtime type determines what actually runs.'
      }),
      buildShortAnswer({
        prompt: 'Give a small example of polymorphism via method overriding.',
        expectedAnswer:
          'Example:\n\n```python\nclass Shape:\n    def area(self):\n        raise NotImplementedError\n\nclass Circle(Shape):\n    def __init__(self, r):\n        self.r = r\n    def area(self):\n        return 3.14159 * self.r * self.r\n\nclass Square(Shape):\n    def __init__(self, s):\n        self.s = s\n    def area(self):\n        return self.s * self.s\n\nshapes = [Circle(2), Square(3)]\nprint([s.area() for s in shapes])\n```',
        explanation: 'The loop calls `area()` on different concrete types without branching on the type.'
      }),
      buildShortAnswer({
        prompt: 'What is a common polymorphism pitfall in Python codebases?',
        expectedAnswer: 'Assuming a specific concrete type (checking types everywhere) instead of relying on the required behavior; this makes code brittle and hard to extend.',
        explanation: 'Prefer defining/expecting an interface (explicit base class, ABC, or a documented protocol of methods).' 
      })
    ];
  }

  if (k === 'oop - duck typing ("if it acts like...")') {
    return [
      buildShortAnswer({
        prompt: 'What does “duck typing” mean in Python?',
        expectedAnswer: 'If an object provides the needed methods/attributes, you can use it regardless of its class ("if it acts like a duck...").',
        explanation: 'Python is dynamically typed; behavior matters more than declared type.'
      }),
      buildShortAnswer({
        prompt: 'Give an example of duck typing that does not rely on inheritance.',
        expectedAnswer:
          'Example:\n\n```python\ndef total_len(items):\n    return sum(len(x) for x in items)\n\nprint(total_len(["hi", [1, 2, 3], (9, 8)]))\n```\nThis works because each item supports `len()`.',
        explanation: 'No shared base class is required; the protocol is just “has length”.'
      }),
      buildShortAnswer({
        prompt: 'What is EAFP and how is it related to duck typing?',
        expectedAnswer: 'EAFP means “Easier to Ask Forgiveness than Permission”: try using the object and catch exceptions, instead of pre-checking types or attributes.',
        explanation: 'It supports behavior-first coding and often reduces fragile pre-check logic.'
      })
    ];
  }

  if (k === 'oop - duck typing pitfall + safer handling (hasattr)') {
    return [
      buildShortAnswer({
        prompt: 'Why can `hasattr(obj, "x")` be a weak or misleading safety check?',
        expectedAnswer: 'The attribute might exist but be the wrong kind (e.g., not callable), or access might raise other exceptions; `hasattr` can also hide bugs by converting some attribute errors into False.',
        explanation: 'Presence of a name is not the same as “supports the behavior you need”.'
      }),
      buildShortAnswer({
        prompt: 'Show a safer pattern than `hasattr` for duck-typed behavior.',
        expectedAnswer:
          'Example (EAFP):\n\n```python\ndef safe_upper(x):\n    try:\n        return x.upper()\n    except AttributeError:\n        return str(x).upper()\n```',
        explanation: 'Try the behavior; if it isn\'t supported, handle the specific failure.'
      }),
      buildShortAnswer({
        prompt: 'If you must pre-check, what is a better check than `hasattr` for methods?',
        expectedAnswer: 'Use `getattr(obj, "method", None)` and then `callable(...)` (and still be prepared to handle runtime errors).',
        explanation: 'Even with pre-checks, the actual call is what ultimately matters.'
      })
    ];
  }

  if (k === 'oop - overloading in python (what exists and what doesn\'t)') {
    return [
      buildShortAnswer({
        prompt: 'Does Python support function/method overloading by signature at runtime (like Java/C++)?',
        expectedAnswer: 'No. If you define the same function name multiple times in a class/module, the last definition overwrites earlier ones.',
        explanation: 'Python does not dispatch based on argument types/count the way classic overloading does.'
      }),
      buildShortAnswer({
        prompt: 'Show a tiny example demonstrating what happens if you define the same method twice.',
        expectedAnswer:
          'Example:\n\n```python\nclass A:\n    def f(self, x):\n        return x\n    def f(self, x, y):\n        return x + y\n\n# Only the second f exists now\n```',
        explanation: 'The earlier `f(self, x)` is replaced; calls expecting it will fail.'
      }),
      buildShortAnswer({
        prompt: 'Name two Pythonic ways to handle “overload-like” needs.',
        expectedAnswer: 'Use default/optional parameters, `*args/**kwargs` with validation, or `functools.singledispatch` for type-based dispatch; `typing.overload` is for static type checkers.',
        explanation: 'Choose the simplest approach that keeps the API clear.'
      })
    ];
  }

  if (k === 'oop - operator overloading (magic methods idea)') {
    return [
      buildShortAnswer({
        prompt: 'What is “operator overloading” in Python?',
        expectedAnswer: 'It\'s defining special (dunder) methods like `__add__`, `__mul__`, `__len__`, etc., so built-in operators work with your objects.',
        explanation: 'Operators are syntax sugar that call specific methods.'
      }),
      buildShortAnswer({
        prompt: 'Why should custom operator overloading follow the “principle of least surprise”?',
        expectedAnswer: 'Because operators have strong expectations (e.g., `+` combines, `*` repeats/scales); surprising behavior makes code hard to reason about and maintain.',
        explanation: 'Keep semantics consistent and document edge cases.'
      }),
      buildShortAnswer({
        prompt: 'What should `__add__` return when it cannot handle the other operand type?',
        expectedAnswer: 'Return `NotImplemented` (not `False` or an exception) so Python can try the reflected operation (`__radd__`) or raise a `TypeError`.',
        explanation: '`NotImplemented` enables correct fallback behavior.'
      })
    ];
  }

  if (k === 'oop - overload + for custom objects (__add__)') {
    return [
      buildShortAnswer({
        prompt: 'Implement `__add__` for a simple `Vector2D` class (and handle unsupported types correctly).',
        expectedAnswer:
          'Example:\n\n```python\nclass Vector2D:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    def __add__(self, other):\n        if not isinstance(other, Vector2D):\n            return NotImplemented\n        return Vector2D(self.x + other.x, self.y + other.y)\n\n    def __repr__(self):\n        return f"Vector2D({self.x}, {self.y})"\n```',
        explanation: 'Returning `NotImplemented` is the right way to say “I can\'t add that”.'
      }),
      buildShortAnswer({
        prompt: 'Why is it often better for `__add__` to return a new object instead of mutating `self`?',
        expectedAnswer: 'It matches the behavior of built-in numeric types and keeps operations predictable (no unexpected side effects).',
        explanation: 'Mutation is more appropriate for in-place operators like `__iadd__`.'
      }),
      buildShortAnswer({
        prompt: 'When would you implement `__radd__`?',
        expectedAnswer: 'When you want `other + self` to work for mixed types (e.g., scalar + vector or sum() patterns) or to support commutative addition.',
        explanation: '`__radd__` is the reflected operation used when left operand can\'t handle the type.'
      })
    ];
  }

  if (k === 'oop - overload comparisons (__gt__, __le__)') {
    return [
      buildShortAnswer({
        prompt: 'What are “rich comparison” methods in Python?',
        expectedAnswer: 'Special methods like `__lt__`, `__le__`, `__gt__`, `__ge__`, `__eq__`, and `__ne__` that implement `<`, `<=`, `>`, `>=`, `==`, `!=` for custom objects.',
        explanation: 'Python calls these when you use comparison operators.'
      }),
      buildShortAnswer({
        prompt: 'Show a good pattern for implementing comparisons on a custom class without writing all 6 methods.',
        expectedAnswer:
          'Example (using total_ordering):\n\n```python\nfrom functools import total_ordering\n\n@total_ordering\nclass Box:\n    def __init__(self, volume):\n        self.volume = volume\n\n    def __eq__(self, other):\n        if not isinstance(other, Box):\n            return NotImplemented\n        return self.volume == other.volume\n\n    def __lt__(self, other):\n        if not isinstance(other, Box):\n            return NotImplemented\n        return self.volume < other.volume\n```',
        explanation: '`total_ordering` fills in the remaining ordering methods based on `__eq__` and one ordering method.'
      }),
      buildShortAnswer({
        prompt: 'Why is returning `NotImplemented` important in comparisons too?',
        expectedAnswer: 'It allows Python to try the reflected comparison or decide the correct `TypeError`, instead of forcing incorrect comparisons or silent failures.',
        explanation: 'It makes mixed-type comparisons behave correctly.'
      })
    ];
  }

  if (k === 'oop - overload * across two classes (__mul__)') {
    return [
      buildShortAnswer({
        prompt: 'How does `a * b` map to magic methods in Python?',
        expectedAnswer: '`a * b` calls `a.__mul__(b)`; if that returns `NotImplemented`, Python may try `b.__rmul__(a)`.',
        explanation: 'This is how mixed-type multiplication can be supported.'
      }),
      buildShortAnswer({
        prompt: 'Write a minimal example where a custom class supports both `Vector * 3` and `3 * Vector`.',
        expectedAnswer:
          'Example:\n\n```python\nclass Vector2D:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    def __mul__(self, k):\n        if not isinstance(k, (int, float)):\n            return NotImplemented\n        return Vector2D(self.x * k, self.y * k)\n\n    def __rmul__(self, k):\n        return self.__mul__(k)\n```',
        explanation: '`__rmul__` enables the scalar-left form.'
      }),
      buildShortAnswer({
        prompt: 'What is a good guideline when deciding what `*` should mean for your type?',
        expectedAnswer: 'Pick a meaning consistent with math/domain expectations (scale, repeat, combine) and avoid ambiguous overloads; document and test edge cases.',
        explanation: 'Operator meaning should be obvious to readers.'
      })
    ];
  }

  if (k === 'oop - method overloading: not supported (what happens)') {
    return [
      buildShortAnswer({
        prompt: 'What happens if you define two methods with the same name in a Python class?',
        expectedAnswer: 'The later definition overwrites the earlier one; only the last method exists.',
        explanation: 'There is no runtime overloading by signature.'
      }),
      buildShortAnswer({
        prompt: 'What error do you typically see when calling a method with the “wrong” number of arguments?',
        expectedAnswer: 'A `TypeError` (e.g., missing required positional argument, or too many positional arguments).',
        explanation: 'The single existing method has one signature, so mismatches raise `TypeError`.'
      }),
      buildShortAnswer({
        prompt: 'Name one scenario where `functools.singledispatch` is a better fit than `*args`.',
        expectedAnswer: 'When behavior truly depends on the type of the first argument and you want clean, separated implementations per type.',
        explanation: 'It keeps code modular and avoids manual `isinstance` ladders.'
      })
    ];
  }

  if (k === 'oop - handling "method overloading" needs (defaults, *args)') {
    return [
      buildShortAnswer({
        prompt: 'Show two common patterns to simulate “method overloading” in Python.',
        expectedAnswer: 'Use default/optional parameters and/or use `*args/**kwargs` with explicit validation (and helpful error messages).',
        explanation: 'These patterns keep a single function definition while supporting multiple call shapes.'
      }),
      buildShortAnswer({
        prompt: 'Write an example function that supports both `f(x)` and `f(x, y)` cleanly.',
        expectedAnswer:
          'Example:\n\n```python\ndef f(x, y=None):\n    if y is None:\n        return x * 2\n    return x + y\n```',
        explanation: 'A default argument can represent the “missing” parameter case.'
      }),
      buildShortAnswer({
        prompt: 'When is it better to avoid overload-like APIs entirely?',
        expectedAnswer: 'When different call shapes represent different concepts; in that case, use separate method names or keyword-only parameters to keep the API explicit.',
        explanation: 'Clarity beats cleverness, especially in public APIs.'
      })
    ];
  }

  if (k === 'oop - constructor overloading: not supported (workarounds)') {
    return [
      buildShortAnswer({
        prompt: 'Why doesn\'t Python support constructor overloading (multiple `__init__` signatures)?',
        expectedAnswer: 'Because `__init__` is just a method name; redefining it overwrites the previous one, and Python does not dispatch by signature at runtime.',
        explanation: 'There is only one `__init__` per class at runtime.'
      }),
      buildShortAnswer({
        prompt: 'List three practical workarounds for “constructor overloading” in Python.',
        expectedAnswer: 'Use default/keyword-only parameters, accept `*args/**kwargs` with validation, or provide alternative constructors via `@classmethod` (e.g., `from_json`, `from_file`).',
        explanation: 'Classmethods are the cleanest option when you truly have different construction sources.'
      }),
      buildShortAnswer({
        prompt: 'Show a tiny example of an alternative constructor using `@classmethod`.',
        expectedAnswer:
          'Example:\n\n```python\nclass User:\n    def __init__(self, name, age):\n        self.name = name\n        self.age = age\n\n    @classmethod\n    def from_dict(cls, d):\n        return cls(d["name"], d["age"])\n\nu = User.from_dict({"name": "Ana", "age": 20})\n```',
        explanation: 'This keeps `__init__` simple while offering other ways to construct the object.'
      })
    ];
  }

  if (k === 'oop - method overriding (child replaces behavior)') {
    return [
      buildShortAnswer({
        prompt: 'What is method overriding in Python OOP?',
        expectedAnswer: 'A subclass defines a method with the same name as a base class method, replacing (overriding) the base implementation for that subclass.',
        explanation: 'Calls on instances of the subclass use the overridden method.'
      }),
      buildShortAnswer({
        prompt: 'Give a minimal example of overriding and show which method runs.',
        expectedAnswer:
          'Example:\n\n```python\nclass Base:\n    def f(self):\n        return "base"\n\nclass Child(Base):\n    def f(self):\n        return "child"\n\nassert Base().f() == "base"\nassert Child().f() == "child"\n```',
        explanation: 'The runtime type determines which implementation is chosen.'
      }),
      buildShortAnswer({
        prompt: 'What is a common pitfall when overriding methods in large codebases?',
        expectedAnswer: 'Breaking the base-class contract (changing return type/meaning, required side effects, or accepted inputs) so callers expecting base behavior fail.',
        explanation: 'Overrides should be substitutable: the subclass should still “act like” the base where it is used polymorphically.'
      })
    ];
  }

  if (k === 'oop - using super() inside an overridden method') {
    return [
      buildShortAnswer({
        prompt: 'When should you call `super()` inside an overridden method?',
        expectedAnswer: 'When the base method establishes important invariants or shared behavior you want to extend rather than replace.',
        explanation: 'This is especially important for cooperative multiple inheritance and for base classes that manage state.'
      }),
      buildShortAnswer({
        prompt: 'Show an override that extends base behavior correctly using `super()`.',
        expectedAnswer:
          'Example:\n\n```python\nclass Logger:\n    def handle(self, msg):\n        return f"LOG:{msg}"\n\nclass TimestampLogger(Logger):\n    def handle(self, msg):\n        return super().handle("[t] " + msg)\n```',
        explanation: 'The subclass adds behavior while preserving the base logic.'
      }),
      buildShortAnswer({
        prompt: 'Why is `super()` generally safer than calling `Base.method(self, ...)` directly?',
        expectedAnswer: '`super()` respects MRO and enables cooperative calls; direct base calls can skip mixins/parents or cause double work in diamond patterns.',
        explanation: 'Think “next in MRO”, not “my parent”.'
      })
    ];
  }

  if (k === 'oop - constructor overriding + calling parent constructor') {
    return [
      buildShortAnswer({
        prompt: 'What is “constructor overriding” in Python?',
        expectedAnswer: 'A subclass defines its own `__init__`, potentially adding fields or validation, replacing the base `__init__` for instances of the subclass.',
        explanation: 'If you override `__init__`, you are responsible for initializing base parts if needed.'
      }),
      buildShortAnswer({
        prompt: 'Show how to override `__init__` and still call the parent constructor.',
        expectedAnswer:
          'Example:\n\n```python\nclass Person:\n    def __init__(self, name):\n        self.name = name\n\nclass Student(Person):\n    def __init__(self, name, roll_no):\n        super().__init__(name)\n        self.roll_no = roll_no\n```',
        explanation: '`super().__init__` ensures the base initialization happens.'
      }),
      buildShortAnswer({
        prompt: 'What bug happens if you forget to call the parent constructor when it initializes required state?',
        expectedAnswer: 'Base fields/invariants aren\'t set, leading to attribute errors later or logically invalid objects (e.g., missing required attributes).',
        explanation: 'You may not notice until a method relies on that state.'
      })
    ];
  }

  if (k === 'oop - part 3 practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Write a checkpoint exercise that tests polymorphism and duck typing together.',
        expectedAnswer: 'Create two unrelated classes that both implement `render()` (duck typing). Write a function that accepts any object with `render()` and calls it in a loop (polymorphism). Add a test object that lacks `render()` and handle it via EAFP (`try/except AttributeError`).',
        explanation: 'This checks behavior-first design and safe handling when the protocol isn\'t met.'
      }),
      buildShortAnswer({
        prompt: 'In one sentence, contrast overriding vs duck typing.',
        expectedAnswer: 'Overriding is an inheritance-based mechanism where a subclass replaces a base method, while duck typing is using objects by behavior without requiring a shared base class.',
        explanation: 'Both enable polymorphism, but via different design styles.'
      }),
      buildShortAnswer({
        prompt: 'What are two “quality checks” you should apply when you introduce operator overloading?',
        expectedAnswer: 'Verify semantics match expectations (least surprise) and return `NotImplemented` for unsupported types (including reflected ops); add tests for mixed-type operations and immutability vs in-place behavior.',
        explanation: 'Operator overloading bugs are easy to hide without good tests.'
      })
    ];
  }

  if (k === 'oop - part 4 overview (abc, interfaces, access conventions)') {
    return [
      buildShortAnswer({
        prompt: 'What problem do ABCs (Abstract Base Classes) solve in Python?',
        expectedAnswer: 'They define a contract (required methods/properties) and can prevent instantiation until the contract is implemented by subclasses.',
        explanation: 'ABCs help make “what must be implemented” explicit.'
      }),
      buildShortAnswer({
        prompt: 'How do Python “access modifiers” (public/protected/private) differ from languages like Java?',
        expectedAnswer: 'Python mostly uses naming conventions: public `name`, protected `_name` (by convention), and private `__name` (name mangling), but it\'s not strict enforcement.',
        explanation: 'Design relies on conventions and documentation rather than hard access rules.'
      }),
      buildShortAnswer({
        prompt: 'When should you consider using an ABC instead of duck typing?',
        expectedAnswer: 'When you need explicit enforcement/documentation of required methods across a codebase (especially for library/plugin architectures), or when failing early at instantiation is valuable.',
        explanation: 'Duck typing is flexible; ABCs are explicit and enforceable.'
      })
    ];
  }

  if (k === 'oop - abstract methods (contract without implementation)') {
    return [
      buildShortAnswer({
        prompt: 'What is an abstract method in Python?',
        expectedAnswer: 'A method marked with `@abstractmethod` in an ABC that must be implemented by concrete subclasses.',
        explanation: 'A class with unimplemented abstract methods cannot be instantiated.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal `abc` example with an abstract method.',
        expectedAnswer:
          'Example:\n\n```python\nfrom abc import ABC, abstractmethod\n\nclass Storage(ABC):\n    @abstractmethod\n    def save(self, key, value):\n        ...\n\nclass InMemory(Storage):\n    def __init__(self):\n        self._d = {}\n    def save(self, key, value):\n        self._d[key] = value\n```',
        explanation: '`InMemory` becomes instantiable only after implementing `save`.'
      }),
      buildShortAnswer({
        prompt: 'What happens if a subclass forgets to implement an abstract method?',
        expectedAnswer: 'Instantiating the subclass raises a `TypeError` indicating abstract methods are not implemented.',
        explanation: 'This is “fail fast” enforcement of the contract.'
      })
    ];
  }

  if (k === 'oop - abstract class (partial implementation)') {
    return [
      buildShortAnswer({
        prompt: 'What is an abstract class (in Python terms)?',
        expectedAnswer: 'A class (often an ABC) that provides some implementation but still contains abstract methods, so it cannot be instantiated directly.',
        explanation: 'It shares common logic while requiring subclasses to fill in the missing pieces.'
      }),
      buildShortAnswer({
        prompt: 'Give a simple example where an abstract base class provides shared logic.',
        expectedAnswer:
          'Example:\n\n```python\nfrom abc import ABC, abstractmethod\n\nclass Parser(ABC):\n    def parse(self, text):\n        return self._parse_impl(text.strip())\n\n    @abstractmethod\n    def _parse_impl(self, text):\n        ...\n```',
        explanation: 'The base class handles common steps; subclasses implement `_parse_impl`.'
      }),
      buildShortAnswer({
        prompt: 'What design benefit do you get from putting shared logic in the abstract base?',
        expectedAnswer: 'Consistency and reduced duplication: all implementations follow the same preprocessing/validation steps, reducing bugs and ensuring a common workflow.',
        explanation: 'It\'s a practical way to enforce invariants.'
      })
    ];
  }

  if (k === 'oop - interface concept in python (abc with only abstract methods)') {
    return [
      buildShortAnswer({
        prompt: 'What does “interface” usually mean in Python discussions?',
        expectedAnswer: 'A set of required methods/behaviors (a contract). Python can model this using ABCs with only abstract methods, or via structural typing with `typing.Protocol`.',
        explanation: 'Python doesn\'t have a special “interface” keyword, but the concept exists.'
      }),
      buildShortAnswer({
        prompt: 'What is the difference between an ABC-style interface and duck typing?',
        expectedAnswer: 'ABCs explicitly declare and can enforce required methods; duck typing relies on behavior at runtime without upfront enforcement.',
        explanation: 'ABCs are more explicit; duck typing is more flexible.'
      }),
      buildShortAnswer({
        prompt: 'Name one place where an interface-like contract is especially useful.',
        expectedAnswer: 'Plugin systems / adapters where many implementations must conform to the same methods (e.g., `fetch`, `transform`, `write`).',
        explanation: 'Clear contracts make integrations safer and easier to test.'
      })
    ];
  }

  if (k === 'oop - concrete vs abstract vs interface (quick guide)') {
    return [
      buildShortAnswer({
        prompt: 'In one line each: define concrete class, abstract class, and interface (Python sense).',
        expectedAnswer: 'Concrete: instantiable with full implementation. Abstract: provides partial implementation but requires subclasses to implement abstract methods. Interface: a pure contract (often ABC or Protocol) describing required methods.',
        explanation: 'The key difference is “instantiable” vs “contract-only” vs “partial shared logic”.'
      }),
      buildShortAnswer({
        prompt: 'Which should you choose when you want shared code + enforced required methods?',
        expectedAnswer: 'An abstract base class (ABC) with a mix of concrete methods and `@abstractmethod` declarations.',
        explanation: 'It gives both reuse and enforcement.'
      }),
      buildShortAnswer({
        prompt: 'Give one scenario where using a concrete base class as an “interface” causes problems.',
        expectedAnswer: 'When you force unrelated classes to inherit just to satisfy a contract; you couple them to base implementation details and may create awkward inheritance where composition or Protocol would be cleaner.',
        explanation: 'Inheriting for code reuse is fine; inheriting only for “type membership” can be a smell.'
      })
    ];
  }

  if (k === 'oop - public, protected, private (python conventions)') {
    return [
      buildShortAnswer({
        prompt: 'In Python, what do public / protected / private mean?',
        expectedAnswer: 'They are mostly conventions: public `name` is the normal API, protected `_name` means “internal use”, and private `__name` triggers name mangling to reduce accidental access/override.',
        explanation: 'Python does not enforce access control like Java; it relies on conventions and discipline.'
      }),
      buildShortAnswer({
        prompt: 'What is name mangling and what is it trying to prevent?',
        expectedAnswer: 'Attributes like `__x` in a class are transformed to `_ClassName__x`; it helps prevent accidental name collisions/overrides in subclasses, not malicious access.',
        explanation: 'It is a collision-avoidance mechanism, not true privacy.'
      }),
      buildShortAnswer({
        prompt: 'When is using `__private` names a good idea vs a bad idea?',
        expectedAnswer: 'Good: when you want to avoid accidental override in subclasses. Bad: when you want a clean public API or easy testing/mocking; it can make subclassing and debugging harder.',
        explanation: 'Prefer `_internal` for most “don\'t touch” cases.'
      })
    ];
  }

  if (k === 'oop - protected members example (convention only)') {
    return [
      buildShortAnswer({
        prompt: 'What does a single leading underscore (e.g., `_balance`) communicate?',
        expectedAnswer: 'It communicates “internal/protected by convention”: external callers should treat it as non-public and subject to change.',
        explanation: 'It is a social contract, not enforced by the interpreter.'
      }),
      buildShortAnswer({
        prompt: 'Show a short example of using a “protected” attribute and exposing a safe public method instead.',
        expectedAnswer:
          'Example:\n\n```python\nclass Account:\n    def __init__(self):\n        self._balance = 0\n\n    def deposit(self, amount):\n        if amount <= 0:\n            raise ValueError("amount must be positive")\n        self._balance += amount\n\n    def balance(self):\n        return self._balance\n```',
        explanation: 'Callers use methods; `_balance` stays internal and can change.'
      }),
      buildShortAnswer({
        prompt: 'What is one practical way to reduce misuse of internal members in a team?',
        expectedAnswer: 'Document public APIs clearly, keep internals prefixed with `_`, add tests that target public methods, and use code review/linting to discourage external access to `_internal` attributes.',
        explanation: 'Teams enforce conventions through tooling and reviews.'
      })
    ];
  }

  if (k === 'oop - private members (name mangling) + how it works') {
    return [
      buildShortAnswer({
        prompt: 'What does `__name` do inside a class, and how is it different from `_name`?',
        expectedAnswer: '`__name` triggers name mangling to `_Class__name` and helps avoid accidental collisions; `_name` is only a convention with no renaming.',
        explanation: 'Both are still accessible, but `__name` is less likely to be touched accidentally.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal example demonstrating name mangling.',
        expectedAnswer:
          'Example:\n\n```python\nclass A:\n    def __init__(self):\n        self.__x = 10\n\na = A()\n# a.__x  # AttributeError\nprint(a._A__x)\n```',
        explanation: 'The attribute exists, but under the mangled name.'
      }),
      buildShortAnswer({
        prompt: 'What is the main reason to use name mangling in real code?',
        expectedAnswer: 'To prevent accidental override/collision in subclasses, especially when the base class relies on internal attributes.',
        explanation: 'It is about robustness under inheritance.'
      })
    ];
  }

  if (k === 'oop - __str__() (human-readable object printing)') {
    return [
      buildShortAnswer({
        prompt: 'What is `__str__()` used for?',
        expectedAnswer: 'It returns a human-readable string for an object, used by `str(obj)` and `print(obj)`.',
        explanation: 'It\'s for user-facing or friendly display.'
      }),
      buildShortAnswer({
        prompt: 'Write a small class that implements `__str__()` for readable printing.',
        expectedAnswer:
          'Example:\n\n```python\nclass Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    def __str__(self):\n        return f"({self.x}, {self.y})"\n\nprint(Point(2, 3))\n```',
        explanation: 'Now `print(point)` uses your friendly formatting.'
      }),
      buildShortAnswer({
        prompt: 'If you only implement `__repr__` but not `__str__`, what does `print(obj)` usually show?',
        expectedAnswer: 'Python typically falls back to `__repr__` for `str(obj)` if `__str__` is not defined.',
        explanation: 'So `__repr__` is a good default to implement even alone.'
      })
    ];
  }

  if (k === 'oop - __repr__() and str() vs repr()') {
    return [
      buildShortAnswer({
        prompt: 'What is `__repr__()` for, and how should it differ from `__str__()`?',
        expectedAnswer: '`__repr__` is for developers/debugging and should be unambiguous; `__str__` is for human-friendly display.',
        explanation: 'A good `__repr__` often includes the class name and key fields.'
      }),
      buildShortAnswer({
        prompt: 'Give a practical guideline for a “good” `repr`.',
        expectedAnswer: 'Make it informative and ideally valid Python to recreate the object (when reasonable), e.g., `Point(x=2, y=3)` or `Point(2, 3)`.',
        explanation: 'Even if it\'s not perfectly eval-able, it should help debugging.'
      }),
      buildShortAnswer({
        prompt: 'What do `str(obj)` and `repr(obj)` call under the hood?',
        expectedAnswer: '`str(obj)` calls `obj.__str__()` (or falls back to `__repr__`), and `repr(obj)` calls `obj.__repr__()`.',
        explanation: 'They target different audiences: users vs developers.'
      })
    ];
  }

  if (k === 'oop - mini project: banking app (account + savings/current)') {
    return [
      buildShortAnswer({
        prompt: 'List the core responsibilities of an `Account` class in a simple banking app.',
        expectedAnswer: 'Maintain balance, validate deposits/withdrawals, enforce invariants (no negative deposits; no overdraft unless allowed), and expose a clear public API (`deposit`, `withdraw`, `get_balance`).',
        explanation: 'Treat the balance as internal state; protect it via methods.'
      }),
      buildShortAnswer({
        prompt: 'What invariants would you enforce for `withdraw(amount)`?',
        expectedAnswer: 'Amount must be positive; resulting balance must stay >= 0 (unless the account supports overdraft); update balance atomically; raise a clear exception on insufficient funds.',
        explanation: 'Clear invariants prevent subtle bugs.'
      }),
      buildShortAnswer({
        prompt: 'How might `SavingsAccount` differ from `CurrentAccount` in a clean design?',
        expectedAnswer: 'Savings might restrict withdrawals or enforce minimum balance/interest rules; Current might allow overdraft/fees. Share common logic in `Account`, override or add only the differing rules.',
        explanation: 'Use inheritance only if they truly are “is-a Account” with shared contract.'
      })
    ];
  }

  if (k === 'oop - part 4 practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Checkpoint: design an interface/ABC for a “Storage” component and name two implementations.',
        expectedAnswer: 'Define an ABC with methods like `save(key, value)` and `load(key)`. Implementations: `InMemoryStorage` (dict-backed) and `FileStorage` (JSON file backed).',
        explanation: 'This tests the idea of contracts + multiple implementations.'
      }),
      buildShortAnswer({
        prompt: 'Where should you expose public vs internal members in that design?',
        expectedAnswer: 'Expose a small public API (`save/load`). Keep internals (paths, caches, file handles) as `_internal` attributes and hide details behind methods.',
        explanation: 'Public API stays stable while internals can change.'
      }),
      buildShortAnswer({
        prompt: 'What would you test to ensure the ABC contract is respected?',
        expectedAnswer: 'Shared behavioral tests that run against each implementation (same inputs/outputs), plus a test that incomplete subclasses cannot be instantiated if using `@abstractmethod`.',
        explanation: 'Contracts are best validated with reusable test suites.'
      })
    ];
  }

  if (k === 'logging - introduction (why logging exists)') {
    return [
      buildShortAnswer({
        prompt: 'Why is logging preferred over `print()` for real applications?',
        expectedAnswer: 'Logging supports severity levels, flexible routing (console/files/handlers), consistent formatting, and can be enabled/disabled without changing code.',
        explanation: 'It\'s designed for observability and production diagnostics.'
      }),
      buildShortAnswer({
        prompt: 'What are two qualities of good log messages?',
        expectedAnswer: 'They are actionable and contextual: include what happened, key identifiers (user/id/request), and avoid vague text; they should be consistent and searchable.',
        explanation: 'Logs are most useful when you can correlate events and debug quickly.'
      }),
      buildShortAnswer({
        prompt: 'What is one common logging mistake beginners make?',
        expectedAnswer: 'Logging too much at high severity (e.g., everything as ERROR) or logging without context; also printing sensitive data is a frequent mistake.',
        explanation: 'Levels and data hygiene matter.'
      })
    ];
  }

  if (k === 'logging - levels and defaults') {
    return [
      buildShortAnswer({
        prompt: 'Name the common Python logging levels from lowest to highest severity.',
        expectedAnswer: 'DEBUG, INFO, WARNING, ERROR, CRITICAL.',
        explanation: 'Some projects also use NOTSET as a special value.'
      }),
      buildShortAnswer({
        prompt: 'What is the default logging level threshold for the root logger?',
        expectedAnswer: 'WARNING (so DEBUG/INFO are usually not shown unless configured).',
        explanation: 'This surprises many beginners when their debug logs don\'t appear.'
      }),
      buildShortAnswer({
        prompt: 'How do you change the level so DEBUG logs show up?',
        expectedAnswer: 'Configure logging with `basicConfig(level=logging.DEBUG)` or set a logger\'s level via `logger.setLevel(logging.DEBUG)` and ensure handlers allow that level too.',
        explanation: 'Both logger level and handler level can affect what is emitted.'
      })
    ];
  }

  if (k === 'logging - basicconfig(): write logs to a file') {
    return [
      buildShortAnswer({
        prompt: 'Show a minimal example of writing logs to a file using `basicConfig`.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\nlogging.basicConfig(\n    filename="app.log",\n    level=logging.INFO,\n    format="%(asctime)s %(levelname)s %(name)s: %(message)s"\n)\n\nlogging.info("app started")\n```',
        explanation: 'This configures the root logger to emit INFO+ records into `app.log`.'
      }),
      buildShortAnswer({
        prompt: 'What is an important gotcha about `logging.basicConfig()`?',
        expectedAnswer: 'It only configures logging once per process by default (subsequent calls often do nothing unless forcing reconfiguration in newer Python versions).',
        explanation: 'Configure logging early, typically at program startup.'
      }),
      buildShortAnswer({
        prompt: 'How do you choose between append and overwrite when logging to a file?',
        expectedAnswer: 'Use the `filemode` argument: `filemode="a"` to append (default) or `filemode="w"` to overwrite.',
        explanation: 'File rotation is usually handled by rotating handlers, not `filemode`.'
      })
    ];
  }

  if (k === 'logging - append vs overwrite (filemode)') {
    return [
      buildShortAnswer({
        prompt: 'In `logging.basicConfig(...)`, what does `filemode="a"` vs `filemode="w"` do?',
        expectedAnswer: '`filemode="a"` appends to the existing log file, while `filemode="w"` overwrites (truncates) the file each run.',
        explanation: 'Choose based on whether you want historical logs preserved between runs.'
      }),
      buildShortAnswer({
        prompt: 'What is the default `filemode` when using `basicConfig(filename=...)`?',
        expectedAnswer: 'Append (`"a"`) is the default.',
        explanation: 'So logs accumulate unless you explicitly overwrite or rotate.'
      }),
      buildShortAnswer({
        prompt: 'Why is `filemode` not a substitute for proper log rotation?',
        expectedAnswer: 'Because it only controls append vs truncate at startup; it doesn\'t limit file size or rotate by time. Rotation requires rotating handlers (e.g., `RotatingFileHandler`, `TimedRotatingFileHandler`).',
        explanation: 'Production logging typically uses rotation + retention policies.'
      })
    ];
  }

  if (k === 'logging - console logging (no filename)') {
    return [
      buildShortAnswer({
        prompt: 'If you call `logging.basicConfig(level=logging.INFO)` with no `filename`, where do logs go?',
        expectedAnswer: 'To the console via a `StreamHandler` (by default to `sys.stderr`).',
        explanation: 'This is why logs show in the terminal without creating a file.'
      }),
      buildShortAnswer({
        prompt: 'Why might `logging.info(...)` show nothing even though your code runs?',
        expectedAnswer: 'Because the default root threshold is WARNING unless configured; INFO/DEBUG are filtered out if you don\'t set the level to INFO/DEBUG.',
        explanation: 'Set `basicConfig(level=logging.INFO)` (or DEBUG) early at startup.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal console logging setup that prints INFO messages with a level prefix.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\nlogging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")\nlogging.info("server started")\n```',
        explanation: 'A simple format makes console logs easier to scan.'
      })
    ];
  }

  if (k === 'logging - formatting log messages (format=...)') {
    return [
      buildShortAnswer({
        prompt: 'What does the `format=` string in logging control? Name two useful placeholders.',
        expectedAnswer: 'It controls how each log record is rendered. Useful placeholders include `%(asctime)s`, `%(levelname)s`, `%(name)s`, and `%(message)s`.',
        explanation: 'Placeholders are filled from the LogRecord fields.'
      }),
      buildShortAnswer({
        prompt: 'Give an example format that includes timestamp, level, logger name, and message.',
        expectedAnswer: '`"%(asctime)s %(levelname)s %(name)s: %(message)s"`',
        explanation: 'This is a common baseline for readable logs.'
      }),
      buildShortAnswer({
        prompt: 'Why is `logger.info("x=%s", x)` often preferred over `logger.info(f"x={x}")`?',
        expectedAnswer: 'The `%s` style defers string formatting until needed and avoids work when the log level is disabled; it also avoids accidental formatting bugs.',
        explanation: 'It\'s both efficient and conventional in Python logging.'
      })
    ];
  }

  if (k === 'logging - timestamps and datefmt') {
    return [
      buildShortAnswer({
        prompt: 'What do you need in your log format to include timestamps?',
        expectedAnswer: 'Include `%(asctime)s` in the `format` string.',
        explanation: '`asctime` is computed from the record time.'
      }),
      buildShortAnswer({
        prompt: 'What is `datefmt` used for in `basicConfig`?',
        expectedAnswer: 'It controls how `%(asctime)s` is formatted (e.g., `"%Y-%m-%d %H:%M:%S"`).',
        explanation: 'Without `datefmt`, logging uses a default timestamp format.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal `basicConfig` with custom timestamp formatting.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\nlogging.basicConfig(\n    level=logging.INFO,\n    format="%(asctime)s %(levelname)s: %(message)s",\n    datefmt="%Y-%m-%d %H:%M:%S"\n)\nlogging.info("ready")\n```',
        explanation: 'Pick a format that\'s easy to sort and search.'
      })
    ];
  }

  if (k === 'logging - writing exceptions to the log (logging.exception)') {
    return [
      buildShortAnswer({
        prompt: 'What does `logging.exception("msg")` do differently from `logging.error("msg")`?',
        expectedAnswer: '`logging.exception(...)` logs the message at ERROR level and automatically includes the current exception traceback (when called inside an `except` block).',
        explanation: 'It\'s a convenient way to capture stack traces.'
      }),
      buildShortAnswer({
        prompt: 'Where should `logging.exception(...)` be called to be useful?',
        expectedAnswer: 'Inside an `except` block (so there\'s an active exception context).',
        explanation: 'Outside `except`, there may be no traceback to attach.'
      }),
      buildShortAnswer({
        prompt: 'Write a tiny example that logs an exception with traceback.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\nlogging.basicConfig(level=logging.INFO)\n\ntry:\n    1 / 0\nexcept ZeroDivisionError:\n    logging.exception("division failed")\n```',
        explanation: 'This logs both your message and the traceback.'
      })
    ];
  }

  if (k === 'logging - root logger pitfalls (why custom loggers)') {
    return [
      buildShortAnswer({
        prompt: 'Why is relying on the root logger (`logging.info(...)`) a common pitfall in larger apps?',
        expectedAnswer: 'Because root configuration is global: imports can configure it first, you can get duplicate logs, and it\'s hard to control per-module verbosity and routing.',
        explanation: 'Global state + multiple modules often leads to surprises.'
      }),
      buildShortAnswer({
        prompt: 'What is the standard pattern for getting a module-level logger?',
        expectedAnswer: 'Use `logger = logging.getLogger(__name__)` and log via `logger.info(...)` etc.',
        explanation: '`__name__` creates a hierarchy like `app.module`.'
      }),
      buildShortAnswer({
        prompt: 'In a library (not an app), should you call `basicConfig()`? Why/why not?',
        expectedAnswer: 'Generally no—libraries should not configure global logging; they should only create named loggers and emit records. The application decides handlers/format/levels.',
        explanation: 'This avoids surprising configuration for consumers.'
      })
    ];
  }

  if (k === 'logging - logger/handler/formatter (advanced logging model)') {
    return [
      buildShortAnswer({
        prompt: 'Define the roles of Logger, Handler, and Formatter in Python logging.',
        expectedAnswer: 'Logger creates log records; Handler decides where records go (console/file/etc) and filters; Formatter turns records into text (or another output format).',
        explanation: 'Think: produce → route/filter → render.'
      }),
      buildShortAnswer({
        prompt: 'Why might a log record be created but never displayed?',
        expectedAnswer: 'It can be filtered by the logger level or handler level, or there may be no handler attached (or propagation/duplicate handler configuration issues).',
        explanation: 'Both logger and handlers participate in filtering.'
      }),
      buildShortAnswer({
        prompt: 'Give a minimal example that attaches a handler with a custom formatter to a named logger.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\nlogger = logging.getLogger("app")\nlogger.setLevel(logging.DEBUG)\n\nh = logging.StreamHandler()\nh.setLevel(logging.INFO)\nh.setFormatter(logging.Formatter("%(levelname)s %(name)s: %(message)s"))\n\nlogger.addHandler(h)\nlogger.propagate = False\n\nlogger.info("hello")\n```',
        explanation: 'This bypasses root handlers and shows how components fit together.'
      })
    ];
  }

  if (k === 'logging - console handler demo (streamhandler)') {
    return [
      buildShortAnswer({
        prompt: 'What is `logging.StreamHandler` used for?',
        expectedAnswer: 'To send log output to a stream (console), such as `sys.stderr` (default) or `sys.stdout`.',
        explanation: 'It\'s the core console handler type.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal example of adding a `StreamHandler` to a named logger.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\nlogger = logging.getLogger(__name__)\nlogger.setLevel(logging.INFO)\n\nh = logging.StreamHandler()\nh.setFormatter(logging.Formatter("%(levelname)s: %(message)s"))\n\nlogger.addHandler(h)\nlogger.propagate = False\n\nlogger.info("on console")\n```',
        explanation: 'Disabling propagation avoids double-printing if root also has a handler.'
      }),
      buildShortAnswer({
        prompt: 'What is a common reason people see duplicate console logs after adding a StreamHandler?',
        expectedAnswer: 'The record propagates to the root logger which also has a handler; set `logger.propagate = False` or configure handlers only once.',
        explanation: 'Duplicates usually come from multiple handlers in the chain.'
      })
    ];
  }

  if (k === 'logging - filehandler and multiple handlers (console + file)') {
    return [
      buildShortAnswer({
        prompt: 'What problem do multiple handlers solve in logging?',
        expectedAnswer: 'They let you route the same log records to multiple destinations (e.g., console + file) with different levels or formats.',
        explanation: 'Example: INFO to console, DEBUG to file.'
      }),
      buildShortAnswer({
        prompt: 'Show a minimal example: INFO+ to console, DEBUG+ to a file.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\nlogger = logging.getLogger("app")\nlogger.setLevel(logging.DEBUG)\n\nconsole = logging.StreamHandler()\nconsole.setLevel(logging.INFO)\n\nfileh = logging.FileHandler("app.log")\nfileh.setLevel(logging.DEBUG)\n\nfmt = logging.Formatter("%(levelname)s %(name)s: %(message)s")\nconsole.setFormatter(fmt)\nfileh.setFormatter(fmt)\n\nlogger.addHandler(console)\nlogger.addHandler(fileh)\nlogger.propagate = False\n\nlogger.debug("debug goes to file")\nlogger.info("info goes to both")\n```',
        explanation: 'Levels can differ per handler.'
      }),
      buildShortAnswer({
        prompt: 'What two settings do you check if DEBUG logs are not written to the file?',
        expectedAnswer: 'The logger level (must be DEBUG or lower) and the FileHandler level (must also allow DEBUG).',
        explanation: 'Filtering happens at multiple points.'
      })
    ];
  }

  if (k === 'logging - different modules, different log files') {
    return [
      buildShortAnswer({
        prompt: 'How can you route logs from different modules to different files?',
        expectedAnswer: 'Use named loggers per module (e.g., `app.db`, `app.api`) and attach different FileHandlers to each logger, optionally disabling propagation to avoid also writing to a shared parent/root handler.',
        explanation: 'Logger naming creates a hierarchy you can control.'
      }),
      buildShortAnswer({
        prompt: 'Why might a message written by `app.db` end up in multiple files unexpectedly?',
        expectedAnswer: 'Because of propagation: it can be handled by `app.db` handlers and also propagate to parent/root handlers unless `propagate` is disabled.',
        explanation: 'Duplicates often indicate propagation + multiple handlers.'
      }),
      buildShortAnswer({
        prompt: 'Name one best practice for logging across multiple modules in a project.',
        expectedAnswer: 'Configure handlers/formatters once in the application entry point, and have modules only call `logging.getLogger(__name__)` and emit logs (no `basicConfig()` in modules).',
        explanation: 'Centralized configuration keeps behavior consistent.'
      })
    ];
  }

  if (k === 'logging - generic custom logger helper (shared setup)') {
    return [
      buildShortAnswer({
        prompt: 'What problem does a shared “get_logger() helper” solve in a multi-module project?',
        expectedAnswer: 'It centralizes logger setup (handlers, formatters, levels) so every module gets consistent logging without duplicating configuration or accidentally adding duplicate handlers.',
        explanation: 'Good helpers are idempotent and avoid global side effects.'
      }),
      buildShortAnswer({
        prompt: 'Name two common mistakes a custom logger helper should avoid.',
        expectedAnswer: 'Adding handlers every time the helper is called (causing duplicate lines), and leaving propagation enabled so records are handled by both the logger and root handlers.',
        explanation: 'Both mistakes typically show up as duplicated output.'
      }),
      buildShortAnswer({
        prompt: 'Write a minimal `get_logger(name)` helper that avoids duplicate handlers.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\n_FMT = "%(asctime)s %(levelname)s %(name)s: %(message)s"\n\ndef get_logger(name: str) -> logging.Logger:\n    logger = logging.getLogger(name)\n    logger.setLevel(logging.DEBUG)\n\n    if not logger.handlers:  # idempotent\n        h = logging.StreamHandler()\n        h.setLevel(logging.INFO)\n        h.setFormatter(logging.Formatter(_FMT))\n        logger.addHandler(h)\n        logger.propagate = False\n\n    return logger\n```',
        explanation: 'The key is the `if not logger.handlers` guard (or a dedicated marker flag).' 
      })
    ];
  }

  if (k === 'logging - separate log file per caller (dynamic file name)') {
    return [
      buildShortAnswer({
        prompt: 'What does “separate log file per caller” usually mean in practice?',
        expectedAnswer: 'Different modules/components log to different files (e.g., app.db -> db.log, app.api -> api.log) by attaching different FileHandlers to different named loggers.',
        explanation: 'It\'s typically based on logger/module name, not stack inspection.'
      }),
      buildShortAnswer({
        prompt: 'Give one safe way to compute a per-module log filename.',
        expectedAnswer: 'Derive it from the logger name (e.g., app.db -> app_db.log) by replacing dots with underscores and writing inside a logs directory.',
        explanation: 'Keep filenames predictable and avoid using unsanitized user input.'
      }),
      buildShortAnswer({
        prompt: 'Why can using `inspect.stack()` to find the “caller” be a bad idea?',
        expectedAnswer: 'It\'s relatively slow and brittle (wrappers/decorators change call stacks). Named loggers (`__name__`) are simpler and more reliable.',
        explanation: 'Prefer logger hierarchy over stack inspection for routing.'
      })
    ];
  }

  if (k === 'logging - move configuration out of code (fileconfig + dictconfig)') {
    return [
      buildShortAnswer({
        prompt: 'What is the main benefit of moving logging config out of code?',
        expectedAnswer: 'You can change handlers/levels/formats per environment (dev/prod) without code changes, and keep configuration centralized and reviewable.',
        explanation: 'This is especially useful for deployments and operations.'
      }),
      buildShortAnswer({
        prompt: 'Name two standard ways to configure logging from external configuration in Python.',
        expectedAnswer: '`logging.config.fileConfig(...)` (INI-style) and `logging.config.dictConfig(...)` (dictionary, often loaded from JSON/YAML).',
        explanation: 'Both live under `logging.config`.'
      }),
      buildShortAnswer({
        prompt: 'What is one common pitfall when using `fileConfig`/`dictConfig` with existing loggers?',
        expectedAnswer: 'Accidentally disabling existing loggers or getting duplicates because propagation/handlers were already configured; you must understand `disable_existing_loggers` and handler setup order.',
        explanation: 'Misconfiguration often shows up as missing or duplicated log lines.'
      })
    ];
  }

  if (k === 'logging - practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Checkpoint: design a logging setup where console shows INFO+ and file stores DEBUG+.',
        expectedAnswer: 'Set logger level to DEBUG, add a StreamHandler at INFO and a FileHandler at DEBUG, attach both to the same named logger, and typically set `propagate=False` if root is also configured.',
        explanation: 'Logger must allow DEBUG; then handlers filter independently.'
      }),
      buildShortAnswer({
        prompt: 'You see every log line printed twice. What are the first two things you check?',
        expectedAnswer: 'Check if handlers were added multiple times, and check whether `propagate=True` is sending records to parent/root handlers in addition to your custom handlers.',
        explanation: 'Dupes are almost always “multiple handlers + propagation”.'
      }),
      buildShortAnswer({
        prompt: 'What\'s the best place to configure logging in an application, and what should modules do instead?',
        expectedAnswer: 'Configure in the application entry point (main). Modules should only get a named logger via `logging.getLogger(__name__)` and emit logs.',
        explanation: 'Central configuration avoids conflicts across imports.'
      })
    ];
  }

  if (k === 'logging - generic custom logger helper (shared setup)') {
    return [
      buildShortAnswer({
        prompt: 'What problem does a shared “get_logger()” helper solve in a multi-module app?',
        expectedAnswer: 'It centralizes handler/formatter setup so every module gets consistent logging, and it prevents common issues like duplicate handlers, inconsistent formats, and scattered configuration.',
        explanation: 'The app should configure logging once; modules should just request a named logger.'
      }),
      buildShortAnswer({
        prompt: 'Why should your helper avoid adding handlers every time it is called?',
        expectedAnswer: 'Because you\'ll end up with duplicate handlers and duplicate log lines. A helper should be idempotent (only attach handlers if none exist, or track setup with a flag).',
        explanation: 'Duplicates are one of the most common logging bugs.'
      }),
      buildShortAnswer({
        prompt: 'Write a minimal idempotent logger helper (console + file) for a given logger name.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\n_FMT = logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")\n\ndef get_logger(name: str, logfile: str = "app.log"):\n    logger = logging.getLogger(name)\n    logger.setLevel(logging.DEBUG)\n\n    if getattr(logger, "_configured", False):\n        return logger\n\n    console = logging.StreamHandler()\n    console.setLevel(logging.INFO)\n    console.setFormatter(_FMT)\n\n    fileh = logging.FileHandler(logfile)\n    fileh.setLevel(logging.DEBUG)\n    fileh.setFormatter(_FMT)\n\n    logger.addHandler(console)\n    logger.addHandler(fileh)\n    logger.propagate = False\n    logger._configured = True\n    return logger\n```',
        explanation: 'The key is “configure once” to avoid duplicate handlers.'
      })
    ];
  }

  if (k === 'logging - separate log file per caller (dynamic file name)') {
    return [
      buildShortAnswer({
        prompt: 'What\'s a simple, stable way to choose a log file name per module/caller?',
        expectedAnswer: 'Use the logger name (often `__name__`) and map it to a filename like `f"{logger.name}.log"` (optionally replacing dots), or attach a dedicated FileHandler to each named logger.',
        explanation: 'This avoids fragile stack inspection and keeps names predictable.'
      }),
      buildShortAnswer({
        prompt: 'Why is `inspect.stack()` usually a poor choice for deciding the “caller” log file?',
        expectedAnswer: 'It\'s slower, brittle (wrappers/decorators change stack depth), and can produce surprising results in async/threaded code. Logger names are a better routing key.',
        explanation: 'Prefer explicit naming and configuration.'
      }),
      buildShortAnswer({
        prompt: 'Show a tiny example: each module gets its own file based on `__name__`.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\n\ndef module_logger(module_name: str):\n    logger = logging.getLogger(module_name)\n    logger.setLevel(logging.DEBUG)\n\n    if not logger.handlers:\n        safe = module_name.replace(".", "_")\n        fh = logging.FileHandler(f"{safe}.log")\n        fh.setFormatter(logging.Formatter("%(levelname)s %(name)s: %(message)s"))\n        logger.addHandler(fh)\n        logger.propagate = False\n\n    return logger\n\nlogger = module_logger(__name__)\nlogger.info("hello from this module")\n```',
        explanation: 'This keeps routing stable and avoids duplicates.'
      })
    ];
  }

  if (k === 'logging - move configuration out of code (fileconfig + dictconfig)') {
    return [
      buildShortAnswer({
        prompt: 'What are `fileConfig` and `dictConfig` used for in Python logging?',
        expectedAnswer: 'They configure logging (loggers/handlers/formatters/levels) from external configuration: INI-style via `logging.config.fileConfig` and dict/YAML-like via `logging.config.dictConfig`.',
        explanation: 'This keeps configuration separate from business logic.'
      }),
      buildShortAnswer({
        prompt: 'Give one advantage of moving logging config out of code.',
        expectedAnswer: 'You can change formats/levels/handlers per environment (dev vs prod) without editing code, and you keep configuration centralized and consistent.',
        explanation: 'Operations can tune verbosity safely.'
      }),
      buildShortAnswer({
        prompt: 'Write a minimal `dictConfig` example that logs INFO to console with timestamps.',
        expectedAnswer:
          'Example:\n\n```python\nimport logging\nimport logging.config\n\nconfig = {\n  "version": 1,\n  "formatters": {\n    "simple": {"format": "%(asctime)s %(levelname)s %(name)s: %(message)s"}\n  },\n  "handlers": {\n    "console": {\n      "class": "logging.StreamHandler",\n      "level": "INFO",\n      "formatter": "simple"\n    }\n  },\n  "root": {"level": "INFO", "handlers": ["console"]}\n}\n\nlogging.config.dictConfig(config)\nlogging.getLogger(__name__).info("configured")\n```',
        explanation: 'This is the foundation for environment-based logging.'
      })
    ];
  }

  if (k === 'logging - practice + checkpoint') {
    return [
      buildShortAnswer({
        prompt: 'Checkpoint: In one sentence, describe a clean logging approach for a 5-module app.',
        expectedAnswer: 'Configure logging once in the entry point (handlers/format/levels), and in each module use `logger = logging.getLogger(__name__)` to emit logs without configuring handlers.',
        explanation: 'Centralized config + named loggers is the standard pattern.'
      }),
      buildShortAnswer({
        prompt: 'You see every line printed twice. Name the two most likely causes.',
        expectedAnswer: 'Duplicate handlers attached (added multiple times), and/or propagation to root/parent handlers when both child and root have handlers.',
        explanation: 'Check `logger.handlers` and `logger.propagate`.'
      }),
      buildShortAnswer({
        prompt: 'Design exercise: What three fields would you include in almost every production log line?',
        expectedAnswer: 'Timestamp, severity level, and logger/module name (often plus the message; optionally request/user IDs for correlation).',
        explanation: 'These fields make logs searchable and diagnosable.'
      })
    ];
  }

  return null;
}

function generateProfessionalInterview(title) {
  const t = String(title || '').toLowerCase();

  const module1 = generateModule1Interview(title);
  if (module1) return module1;

  if (t.includes('dictionary') && t.includes('copy') && (t.includes('nested') || t.includes('shallow'))) {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain shallow copy vs deep copy for nested dictionaries, with a short example.',
          sampleAnswer: 'A shallow copy creates a new outer dictionary but keeps references to the same nested objects. Example: if d1={"a": {"x": 1}}, then d2=d1.copy(); d2["a"]["x"]=99 will also change d1["a"]["x"]. A deep copy (copy.deepcopy) recursively copies nested objects so changes do not leak across.'
        },
        {
          prompt: 'When would you use `dict.copy()` instead of `copy.deepcopy()`?',
          sampleAnswer: 'Use `dict.copy()` when the values are immutable (numbers/strings/tuples) or when sharing nested objects is acceptable and you only need to copy the top-level mapping. Use `deepcopy` when nested mutables must be isolated.'
        },
        {
          prompt: 'Given a bug caused by shared nested references, how would you debug and fix it?',
          sampleAnswer: 'Reproduce with a minimal nested dict example, print `id()` of nested objects to confirm sharing, then switch to `copy.deepcopy` or restructure to avoid mutating shared nested objects (or rebuild nested dicts explicitly).' 
        }
      ]
    };
  }

  if (/^dictionary\b/.test(t) || /^dict\b/.test(t)) {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain how dictionaries work in Python (keys, hashing) and why some types cannot be keys.',
          sampleAnswer: 'Dictionaries map keys to values using hashing. Keys must be hashable (immutable with a stable hash). Lists/dicts/sets are mutable so they are not hashable and can’t be keys. Tuples of immutables are hashable and can be keys.'
        },
        {
          prompt: 'Show a practical example where `get()` is safer than `d[key]`.',
          sampleAnswer: 'When data may miss a key (e.g., user profile fields). `d.get("age", 0)` avoids KeyError. Using `d["age"]` would raise KeyError if absent.'
        },
        {
          prompt: 'How would you build a frequency counter using a dictionary?',
          sampleAnswer: 'Iterate items and increment counts: counts[ch] = counts.get(ch, 0) + 1. Or use setdefault: counts.setdefault(ch, 0); counts[ch] += 1.'
        }
      ]
    };
  }

  if (/^tuple\b/.test(t) && (t.includes('packing') || t.includes('unpacking') || t.includes('*'))) {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain tuple unpacking and extended unpacking (`*rest`) with a small example.',
          sampleAnswer: 'Tuple unpacking assigns elements to variables, e.g., `a, b = (1, 2)`. Extended unpacking collects remaining items into a list, e.g., `a, *rest = [1,2,3,4]` gives `a=1`, `rest=[2,3,4]`.'
        },
        {
          prompt: 'What error do you get if the number of variables does not match the number of values (without `*`)?',
          sampleAnswer: 'You get a `ValueError` (too many values to unpack / not enough values to unpack).'
        },
        {
          prompt: 'Where is unpacking used in real code?',
          sampleAnswer: 'Swapping values (`a, b = b, a`), iterating key-value pairs (`for k, v in d.items()`), function returns, and parsing structured data.'
        }
      ]
    };
  }

  if (/^tuple\b/.test(t)) {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What is tuple immutability, and why can it still “contain” mutable objects?',
          sampleAnswer: 'A tuple’s immutability means its element references cannot be reassigned (e.g., `t[0]=...` is invalid). But a tuple can reference a mutable object like a list; that list can still be mutated (e.g., `t=([],); t[0].append(1)` works) because the tuple’s reference didn’t change.'
        },
        {
          prompt: 'Explain the single-element tuple syntax and a common bug it prevents.',
          sampleAnswer: 'A single-element tuple requires a trailing comma: `(42,)`. Without it, `(42)` is just the integer 42 in parentheses. This prevents bugs where code expects a tuple but gets a scalar.'
        },
        {
          prompt: 'When would you choose a tuple over a list in real code?',
          sampleAnswer: 'Use a tuple for fixed, record-like data (e.g., coordinates), when you want to express “this should not change”, or when you need a hashable key (tuples of hashables can be dict keys).'
        }
      ]
    };
  }

  if (/^set\b/.test(t)) {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `add()` vs `update()` for sets with an example.',
          sampleAnswer: '`add(x)` adds a single element. `update(iterable)` adds each element. Example: `s=set(); s.add("abc")` adds the string as one element; `s.update("abc")` adds `a`, `b`, `c`.'
        },
        {
          prompt: 'Explain why sets do not support indexing and when sets are the right choice.',
          sampleAnswer: 'Sets are unordered collections so there is no stable index. They are great for membership tests and removing duplicates.'
        },
        {
          prompt: 'Describe union, intersection, and difference with a short example.',
          sampleAnswer: 'For a={1,2,3}, b={3,4}: union a|b={1,2,3,4}, intersection a&b={3}, difference a-b={1,2}.'
        }
      ]
    };
  }

  if (/^list\b/.test(t) && t.includes('append') && t.includes('extend')) {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `append()` vs `extend()` with an example.',
          sampleAnswer: '`append(x)` adds `x` as one element; `extend(iterable)` adds elements of the iterable. Example: `[1,2].append([3,4]) -> [1,2,[3,4]]`, but `[1,2].extend([3,4]) -> [1,2,3,4]`.'
        },
        {
          prompt: 'Explain slicing and what `lst[a:b]` means.',
          sampleAnswer: 'Slicing returns a new list from index a up to but not including b. `lst[1:3]` includes indices 1 and 2.'
        },
        {
          prompt: 'What are common pitfalls with list copying?',
          sampleAnswer: 'Assignment copies the reference (`b=a` shares). Use `a.copy()` or `a[:]` for shallow copy. For nested lists, use `copy.deepcopy` if you need deep copy.'
        }
      ]
    };
  }

  if (/^list\b/.test(t)) {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain aliasing vs copying for lists, and show how to avoid shared references.',
          sampleAnswer: 'Aliasing happens when two names point to the same list (`b=a`). Mutating through one affects the other. Use `a.copy()` or `a[:]` for a shallow copy. For nested lists, use `copy.deepcopy(a)` or construct inner lists explicitly.'
        },
        {
          prompt: 'Explain slicing (`lst[a:b]`) and one common off-by-one mistake.',
          sampleAnswer: 'Slicing returns a new list from index a up to but not including b. A common mistake is assuming b is included; it is exclusive. Example: `lst[1:3]` gives indices 1 and 2.'
        },
        {
          prompt: 'Compare `sorted(lst)` vs `lst.sort()` and when you would use each.',
          sampleAnswer: '`sorted(lst)` returns a new list and leaves the original unchanged; it works on any iterable. `lst.sort()` sorts in-place and returns None. Use `sorted` when you need a new sorted copy, and `sort` when you can mutate the list.'
        }
      ]
    };
  }

  return null;
}

function generateModule1Interview(title) {
  const k = titleKey(title);

  if (k === 'introduction') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what Python is, and name two properties that make it productive for developers.',
          sampleAnswer: 'Python is a high-level, general-purpose language focused on readability. It is productive because it has concise syntax and a huge standard library/ecosystem, allowing quick development and automation.'
        },
        {
          prompt: 'Give two real-world areas where Python is commonly used, and one example for each.',
          sampleAnswer: 'Web development (e.g., APIs with Django/Flask/FastAPI) and data/ML (e.g., analysis with pandas, models with scikit-learn).'
        },
        {
          prompt: 'What does “interpreted” typically mean for Python in practical terms?',
          sampleAnswer: 'You run Python source code directly (via the Python runtime). In CPython, code is compiled to bytecode and executed by a virtual machine, so you typically don’t manually compile binaries for simple scripts.'
        }
      ]
    };
  }

  if (k === 'identifiers') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain Python identifier rules and give two invalid examples with reasons.',
          sampleAnswer: 'Identifiers may contain letters/digits/underscore and cannot start with a digit. Invalid: `2value` (starts with digit), `ca$h` (contains `$`).'
        },
        {
          prompt: 'Explain naming conventions for `_name` and `__name` in Python.',
          sampleAnswer: '`_name` indicates internal use by convention. `__name` triggers name-mangling inside classes (e.g., `_Class__name`) to reduce accidental overrides.'
        },
        {
          prompt: 'Why are descriptive identifier names important in production code?',
          sampleAnswer: 'They improve readability and maintainability, reduce bugs, and make intent clear (especially in teams and long-lived codebases).'
        }
      ]
    };
  }

  if (k === 'reserved words') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What is a keyword in Python, and why can’t keywords be variable names?',
          sampleAnswer: 'Keywords are reserved words that form the language syntax. Using them as variable names would break parsing and make code ambiguous, so Python disallows it.'
        },
        {
          prompt: 'How would you programmatically check if a token is a keyword?',
          sampleAnswer: 'Use `import keyword` and call `keyword.iskeyword(token)` or check membership in `keyword.kwlist`.'
        },
        {
          prompt: 'Give an example of a keyword and a similar valid identifier name.',
          sampleAnswer: 'Keyword: `class`. Valid identifier: `class_name`.'
        }
      ]
    };
  }

  if (k === 'data types') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain dynamic typing in Python with a short example.',
          sampleAnswer: 'Variables are references to objects; the type belongs to the object. Example: `x = 10; x = "ten"` is valid because `x` can be rebound to a different type.'
        },
        {
          prompt: 'Show how you would detect and handle invalid numeric input from the user.',
          sampleAnswer: 'Read input as string, use `try: n = int(s)` / `except ValueError:` to handle invalid input, and reprompt.'
        },
        {
          prompt: 'Explain the literal prefixes `0b`, `0o`, and `0x` with one example each.',
          sampleAnswer: 'Binary: `0b1010`, octal: `0o12`, hex: `0xA`.'
        }
      ]
    };
  }

  if (k === 'type casting') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain type casting and the difference between implicit and explicit conversions in Python.',
          sampleAnswer: 'Type casting converts values between types. Python sometimes converts implicitly (e.g., int + float -> float). Explicit conversions use constructors like `int(x)`, `float(x)`, `str(x)`.'
        },
        {
          prompt: 'How would you safely convert user input to an integer with validation?',
          sampleAnswer: 'Use `s = input().strip()` then `try: n = int(s)`; handle `ValueError` and reprompt or show an error message.'
        },
        {
          prompt: 'Why does `int("10.5")` fail, and what is the correct way if you expect decimals?',
          sampleAnswer: 'It fails because `"10.5"` is not an integer literal. If decimals are allowed, parse float first: `int(float("10.5"))` (note it truncates toward zero).'
        }
      ]
    };
  }

  if (k === 'fundamental data types vs immutability') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain immutability and give three examples of immutable built-in types.',
          sampleAnswer: 'Immutability means the object cannot be changed in-place. Examples: `int`, `float`, `str`, `tuple` (tuple is immutable as a container).'
        },
        {
          prompt: 'When should you use `is` instead of `==`?',
          sampleAnswer: 'Use `is` for identity checks, especially singletons like `None` (`x is None`). Use `==` to compare values.'
        },
        {
          prompt: 'Explain why immutability can improve safety in programs.',
          sampleAnswer: 'Immutable objects can’t be accidentally changed through another reference, so code is more predictable and easier to reason about.'
        }
      ]
    };
  }

  if (k === 'escape characters') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what `\\n`, `\\t`, and `\\\\` do in Python strings with one short example.',
          sampleAnswer: '`\\n` inserts a newline, `\\t` inserts a tab, and `\\\\` represents a literal backslash. Example: `print("a\\tb")` prints two columns.'
        },
        {
          prompt: 'What is a raw string and when would you use it?',
          sampleAnswer: 'A raw string (prefix `r`) reduces backslash escaping. It’s commonly used for regex patterns and Windows paths, e.g., `r"C:\\\\temp\\\\file.txt"`.'
        },
        {
          prompt: 'Show two ways to include quotes inside strings in Python.',
          sampleAnswer: 'Use the opposite quote type ("hi" inside single quotes) or escape (`\\"`) inside a double-quoted string.'
        }
      ]
    };
  }

  if (k === 'constants') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you represent constants in Python, and what is the limitation?',
          sampleAnswer: 'Use uppercase variable names (e.g., `API_TIMEOUT = 5`). Limitation: Python does not enforce it; reassignment is still possible.'
        },
        {
          prompt: 'How would you keep configuration values in a real project?',
          sampleAnswer: 'Put them in a config module or environment variables (for secrets), and load them at startup. Keep constants centralized to avoid duplication.'
        },
        {
          prompt: 'Give examples of immutable structures you might use to avoid accidental modification.',
          sampleAnswer: 'Use `tuple` instead of list, `frozenset` instead of set, and keep values like strings/ints for fixed settings.'
        }
      ]
    };
  }

  if (k === 'operators') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `/` vs `//` with examples, including a negative-number example.',
          sampleAnswer: '`/` returns true division as float: `5/2 = 2.5`. `//` floors the result: `5//2 = 2`. With negatives, floor goes down: `-5//2 = -3`.'
        },
        {
          prompt: 'Explain `%` and a practical use-case.',
          sampleAnswer: '`%` returns remainder. Use-case: checking even/odd: `n % 2 == 0`.'
        },
        {
          prompt: 'How do you avoid precedence bugs in complex expressions?',
          sampleAnswer: 'Use parentheses to make order explicit and write intermediate variables for clarity.'
        }
      ]
    };
  }

  if (k === 'reading dynamic input from the keyboard') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain why `input()` returns a string and how you handle numeric input safely.',
          sampleAnswer: '`input()` reads text from the user, so it returns `str`. For numbers, do `try: n = int(input().strip())` and handle `ValueError`.'
        },
        {
          prompt: 'Write a small snippet that reads two integers and prints their sum with validation.',
          sampleAnswer: 'Example: `try: a=int(input("a: ").strip()); b=int(input("b: ").strip()); print(a+b) except ValueError: print("Please enter valid integers")`.'
        },
        {
          prompt: 'What are common input bugs beginners hit, and how do you prevent them?',
          sampleAnswer: 'Forgetting to cast types (string math), not stripping whitespace, and not handling invalid input. Prevent with `.strip()`, `try/except`, and clear prompts.'
        }
      ]
    };
  }

  if (k === 'command line arguments') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What does `sys.argv` contain, and what is the most common mistake beginners make when using it?',
          sampleAnswer: '`sys.argv` is a list of strings representing the command-line tokens. The common mistake is assuming values are already numbers/booleans; they are always strings and must be parsed/validated.'
        },
        {
          prompt: 'Show a short `argparse` example that supports `--name` (string) and `--count` (int) with a help message.',
          sampleAnswer: 'Example:\n\n```python\nimport argparse\n\nparser = argparse.ArgumentParser()\nparser.add_argument("--name", required=True)\nparser.add_argument("--count", type=int, default=1)\nargs = parser.parse_args()\n\nfor _ in range(args.count):\n    print(f"Hello, {args.name}!")\n```'
        },
        {
          prompt: 'How do you handle an argument that contains spaces, and why is this not a Python issue?',
          sampleAnswer: 'You quote it in the shell (e.g., `--name "Ada Lovelace"`) so it becomes one token. It’s a shell parsing/quoting behavior; Python only receives the already-tokenized argv list.'
        }
      ]
    };
  }

  if (k === 'output statements') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `sep` and `end` in `print()`, and show one practical use for each.',
          sampleAnswer: '`sep` controls how multiple arguments are joined (default space). Example: `print(a, b, c, sep=",")` prints CSV-style output. `end` controls what is printed after the output (default newline). Example: progress output: `print(".", end="", flush=True)`.'
        },
        {
          prompt: 'What is the difference between printing with commas vs using f-strings?',
          sampleAnswer: 'Comma-separated `print("Age:", age)` automatically converts values and inserts `sep`. F-strings give explicit formatting and readability: `print(f"Age: {age}")`, and support format specs like `{price:.2f}`.'
        },
        {
          prompt: 'How do you print an error message to stderr instead of stdout?',
          sampleAnswer: 'Use `file=sys.stderr`: `import sys; print("Error: invalid input", file=sys.stderr)`.'
        }
      ]
    };
  }

  if (k === 'flow control (overview)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain how Python uses indentation for blocks, and name one common indentation-related error.',
          sampleAnswer: 'Indentation defines blocks for `if`, `for`, `while`, `def`, etc. Mixing tabs/spaces or inconsistent indentation can raise `IndentationError` (or produce unintended logic).' 
        },
        {
          prompt: 'Give a real-world example where you’d combine selection + iteration + transfer statements.',
          sampleAnswer: 'Login attempts: loop up to N tries (`while`), check credentials (`if/else`), `break` on success, `continue` after printing an error message, and `return` from a function when finished.'
        },
        {
          prompt: 'What’s the difference between `break` and `return` when used inside a loop in a function?',
          sampleAnswer: '`break` exits only the loop and continues executing the rest of the function. `return` exits the entire function immediately (and can return a value).' 
        }
      ]
    };
  }

  if (k === 'conditional statements (if / if-else / if-elif-else)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Write a function that classifies a number as positive, negative, or zero using `if/elif/else`.',
          sampleAnswer: 'Example:\n\n```python\ndef sign(n):\n    if n > 0:\n        return "positive"\n    elif n < 0:\n        return "negative"\n    else:\n        return "zero"\n```'
        },
        {
          prompt: 'Explain the truthy/falsy concept and give two falsy examples.',
          sampleAnswer: 'In an `if`, Python treats values as truthy or falsy. Falsy examples include `0`, `0.0`, `""`, `[]`, `{}`, `set()`, and `None`.'
        },
        {
          prompt: 'What is wrong with `if x == 1 or 2:` and what is the correct form?',
          sampleAnswer: 'It is parsed as `(x == 1) or 2`, which is always truthy. Correct: `if x == 1 or x == 2:` or `if x in (1, 2):`.'
        }
      ]
    };
  }

  if (k === 'iterative statements (for / while)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Show a pattern for repeatedly prompting until valid integer input is entered.',
          sampleAnswer: 'Example:\n\n```python\nwhile True:\n    s = input("Enter an integer: ").strip()\n    try:\n        n = int(s)\n        break\n    except ValueError:\n        print("Invalid integer, try again")\n```'
        },
        {
          prompt: 'What is the purpose of `for ... else` in Python, and when does the `else` run?',
          sampleAnswer: 'The `else` runs only if the loop completes without hitting `break`. It is often used for search: break when found; else means "not found".'
        },
        {
          prompt: 'Explain `range(start, stop, step)` and give a short example that counts down.',
          sampleAnswer: '`range(start, stop, step)` generates integers with an exclusive stop. Countdown: `for i in range(10, 0, -1): print(i)`.'
        }
      ]
    };
  }

  if (k === 'transfer statements (break / continue / pass)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Give an example where `continue` improves clarity in a loop.',
          sampleAnswer: 'Filtering invalid records: `for row in rows: if not row: continue; process(row)`. This keeps the main logic unindented and readable.'
        },
        {
          prompt: 'Explain the `while ... else` behavior with `break`.',
          sampleAnswer: 'In `while/for ... else`, the `else` runs only if the loop ended normally (condition became false / iterable exhausted). If you `break`, the `else` block is skipped.'
        },
        {
          prompt: 'When would you prefer `pass` vs raising `NotImplementedError`?',
          sampleAnswer: '`pass` is a placeholder when you need an empty block syntactically. `raise NotImplementedError()` is better when a function/method must not be used until implemented, because it fails loudly.'
        }
      ]
    };
  }

  if (k === 'del statement and del vs none') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What does `del` actually do, and why does it not "delete the object immediately" in all cases?',
          sampleAnswer: '`del` deletes a name binding (or an item/slice). The object is freed only when nothing references it anymore (reference count hits zero and/or GC runs), so it may not disappear immediately if other references exist.'
        },
        {
          prompt: 'Why does `del s[0]` fail for a string, and what is the correct alternative?',
          sampleAnswer: 'Strings are immutable, so you cannot delete an element. Build a new string instead, e.g., `s = s[1:]` or `s = s.replace(s[0], "", 1)` depending on intent.'
        },
        {
          prompt: 'What is the difference between `lst = []` and `del lst[:]` when other variables reference the same list?',
          sampleAnswer: '`lst = []` rebinds the name to a new list, leaving other references pointing to the old list. `del lst[:]` clears the list in-place, so all references observe the cleared list.'
        }
      ]
    };
  }

  if (k === 'string (overview + literals)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what a Python string is (type + encoding idea) and one implication of immutability.',
          sampleAnswer: 'A string is a `str` object representing Unicode text. Immutability means operations like concatenation create new strings, which affects performance in large loops (use `"".join(...)` for many concatenations).' 
        },
        {
          prompt: 'Show two safe ways to include quotes inside a string literal.',
          sampleAnswer: "Use alternating quotes: `\"He said 'hi'\"` or escape: `'He said \\\'hi\\\''` / `\"He said \\\"hi\\\"\"`."
        },
        {
          prompt: 'What is a raw string and what is one tricky edge case to remember?',
          sampleAnswer: 'Raw strings (prefix `r`) reduce backslash escapes, useful for regex and Windows paths. Edge case: a raw string literal cannot end with a single backslash because it would escape the closing quote.'
        }
      ]
    };
  }

  if (k === 'string - indexing (positive and negative)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you print each character with its positive and negative index?',
          sampleAnswer: 'Example:\n\n```python\ns = "hello"\nfor i, ch in enumerate(s):\n    print(i, i - len(s), ch)\n```'
        },
        {
          prompt: 'Why is negative indexing useful, and what is a common edge case you must handle?',
          sampleAnswer: 'Negative indexing makes "from the end" access concise (`s[-1]`). Edge case: empty strings; `s[-1]` raises `IndexError`, so check `if s:` first.'
        },
        {
          prompt: 'Compare indexing vs slicing behavior when out of range.',
          sampleAnswer: 'Indexing out of range raises `IndexError`. Slicing is forgiving: `"abc"[10:]` returns `""` (empty string).' 
        }
      ]
    };
  }

  if (k === 'string - slicing (substrings)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `s[start:stop:step]` and give one example that takes every second character.',
          sampleAnswer: '`start` inclusive, `stop` exclusive, `step` stride. Example: `s[::2]` returns characters at even indices.'
        },
        {
          prompt: 'Does slicing mutate the original string? Explain briefly.',
          sampleAnswer: 'No. Strings are immutable; slicing returns a new string (or an empty string if the slice selects nothing).' 
        },
        {
          prompt: 'Write a small snippet to extract a file extension from a filename using slicing (no libraries).',
          sampleAnswer: 'Example:\n\n```python\nname = "report.pdf"\ni = name.rfind(".")\next = "" if i == -1 else name[i+1:]\n```'
        }
      ]
    };
  }

  if (k === 'string - slicing (rules + tricky cases)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the slice form `s[start:stop:step]` and the two common reasons a slice result can be empty.',
          sampleAnswer: 'Slicing uses `start` (inclusive), `stop` (exclusive), and `step`. A slice can be empty if the direction does not match the step (e.g., `start < stop` with a negative step, or `start > stop` with a positive step), or if the selected range contains no indices. Note: `step=0` raises `ValueError`.'
        },
        {
          prompt: 'Give a concrete example showing how negative-step slicing works and why the stop is still exclusive.',
          sampleAnswer: 'Example: `s = "abcdef"`; `s[5:2:-1]` returns `"fed"` (indices 5,4,3). Index 2 is excluded even with negative step, so it stops before reaching it.'
        },
        {
          prompt: 'How do indexing and slicing differ when out of range?',
          sampleAnswer: 'Indexing out of range raises `IndexError` (e.g., `s[100]`). Slicing is forgiving and returns an empty string when the selection is empty (e.g., `s[100:]` gives `""`).'
        }
      ]
    };
  }

  if (k === 'string - operators, len(), membership, comparison') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain how string comparison works in Python and give one example that surprises beginners.',
          sampleAnswer: 'Strings compare lexicographically by Unicode code points, not by numeric value. Example: `"10" < "2"` is `True` because it compares the first character (`"1"` vs `"2"`).'
        },
        {
          prompt: 'When would you use `in` vs `find` when searching within strings?',
          sampleAnswer: 'Use `sub in s` when you only need a boolean. Use `find`/`index` when you need the position. Prefer `find` if “not found” is normal (returns -1); `index` if absence should raise.'
        },
        {
          prompt: 'Show a short example that uses `len` and membership together (validation style).',
          sampleAnswer: 'Example:\n\n```python\ns = input("Username: ").strip()\nif len(s) < 3 or " " in s:\n    print("Invalid username")\n```'
        }
      ]
    };
  }

  if (k === 'string - removing spaces (strip family)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `strip/lstrip/rstrip` and what they do NOT do.',
          sampleAnswer: '`strip()` removes characters from the beginning and end (whitespace by default). `lstrip()` only left; `rstrip()` only right. They do NOT remove spaces in the middle of a string.'
        },
        {
          prompt: 'What is the difference between `strip()` and `strip("0")`?',
          sampleAnswer: '`strip()` removes whitespace by default. `strip("0")` removes the character `0` from both ends repeatedly (not from the middle). Example: `"0001200".strip("0")` becomes `"12"`.'
        },
        {
          prompt: 'Give a robust input-cleaning snippet that trims whitespace but preserves internal spaces.',
          sampleAnswer: 'Example:\n\n```python\nname = input("Full name: ").strip()\n# internal spaces are preserved\n```'
        }
      ]
    };
  }

  if (k === 'string - finding substrings (find/index/rfind/rindex)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `find` vs `index` and `rfind` vs `rindex` (behavior on not-found).',
          sampleAnswer: '`find`/`rfind` return -1 if not found. `index`/`rindex` raise `ValueError` if not found. Use the “r” variants for last occurrence.'
        },
        {
          prompt: 'Show code to find all start positions of a substring (including overlaps if you choose).',
          sampleAnswer: 'Example (non-overlapping step 1, allows overlaps):\n\n```python\ndef all_positions(s, sub):\n    out = []\n    i = 0\n    while True:\n        i = s.find(sub, i)\n        if i == -1:\n            return out\n        out.append(i)\n        i += 1\n```'
        },
        {
          prompt: 'How would you safely extract text between two markers using `find`?',
          sampleAnswer: 'Find start/end indices, validate not -1, then slice. Example: find `a = s.find("[")`; `b = s.find("]", a+1)`; if both found, `inside = s[a+1:b]`.'
        }
      ]
    };
  }

  if (k === 'string - count() and replace() + immutability') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain immutability for strings and how it affects performance in loops.',
          sampleAnswer: 'String operations that “change” text create new strings. In a loop, repeated `s += piece` can be slow; prefer collecting pieces in a list and doing `"".join(parts)` at the end.'
        },
        {
          prompt: 'Demonstrate the placeholder technique to swap characters (or substrings) safely.',
          sampleAnswer: 'Example:\n\n```python\ns = "abab"\ns = s.replace("a", "#").replace("b", "a").replace("#", "b")\n```\nThis avoids turning everything into the same character mid-way.'
        },
        {
          prompt: 'What does `count` mean by “non-overlapping”, and can you show an example?',
          sampleAnswer: 'Example: `"aaaa".count("aa")` returns 2, not 3, because it counts non-overlapping matches (positions 0–1 and 2–3).' 
        }
      ]
    };
  }

  if (k === 'string - split() and join()') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `split()` with and without a separator (especially around multiple spaces).',
          sampleAnswer: 'Without a separator, `split()` treats any run of whitespace as one separator and ignores leading/trailing whitespace. With a separator like `","`, it splits exactly on that character and can produce empty strings for consecutive separators.'
        },
        {
          prompt: 'Why is `join` the preferred way to build strings from many pieces?',
          sampleAnswer: '`join` allocates once and is efficient. Repeated concatenation in a loop can create many intermediate strings because strings are immutable.'
        },
        {
          prompt: 'Show how you would join numbers into a comma-separated string.',
          sampleAnswer: 'Example:\n\n```python\nnums = [1, 2, 3]\nout = ",".join(map(str, nums))\n```'
        }
      ]
    };
  }

  if (k === 'string - case conversion + startswith/endswith') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Show a robust case-insensitive equality check for user text.',
          sampleAnswer: 'Use `casefold()` for Unicode-aware comparison: `a.casefold() == b.casefold()`.'
        },
        {
          prompt: 'How do you validate a filename extension safely using `endswith`?',
          sampleAnswer: 'Use a tuple: `name.lower().endswith((".jpg", ".png"))`. Lowercase first to handle `".PNG"`.'
        },
        {
          prompt: 'What are the differences between `capitalize()`, `title()`, and `upper()`?',
          sampleAnswer: '`capitalize()` uppercases the first character and lowercases the rest. `title()` title-cases each word. `upper()` makes all letters uppercase.'
        }
      ]
    };
  }

  if (k === 'string - character checks (isalpha, isdigit, ...)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why does `"-123".isdigit()` return False, and how would you validate signed integers?',
          sampleAnswer: 'The `-` is not a digit. Validate by trying `int(s)` in a `try/except ValueError`, or by checking `s.lstrip("+-").isdigit()` (with care for empty after stripping).' 
        },
        {
          prompt: 'What is one important detail about `isalpha/isnumeric/isalnum` regarding empty strings?',
          sampleAnswer: 'They return False for empty strings. Example: `"".isalpha()` is False.'
        },
        {
          prompt: 'Show a small input-validation snippet that rejects whitespace-only input.',
          sampleAnswer: 'Example:\n\n```python\ns = input("Enter text: ")\nif not s or s.isspace():\n    print("Please enter non-empty text")\n```'
        }
      ]
    };
  }

  if (k === 'string - formatting with format() (incl. numbers)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain width, alignment, and precision in format specs with a short example.',
          sampleAnswer: 'Example: `"{:<10} | {:>6.2f}".format("item", 3.14159)` left-aligns text in width 10 and right-aligns a float with 2 decimals in width 6.'
        },
        {
          prompt: 'Compare `str.format()` with f-strings and when you might still choose `format()`.',
          sampleAnswer: 'F-strings are concise and fast for inline formatting. `format()` is useful when the template is stored separately (e.g., config, translation strings) or you want to reuse a format template.'
        },
        {
          prompt: 'Show an example of formatting an integer in hex and binary using `format()`.',
          sampleAnswer: 'Example: `"hex={:x} bin={:b}".format(31, 31)` produces `hex=1f bin=11111`.'
        }
      ]
    };
  }

  if (k === 'string - practice programs (1)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Write a function that checks whether a string is a palindrome (ignoring case and spaces).',
          sampleAnswer: 'Example:\n\n```python\ndef is_palindrome(s):\n    t = "".join(ch for ch in s.casefold() if not ch.isspace())\n    return t == t[::-1]\n```'
        },
        {
          prompt: 'How would you count vowels in a string and return a dictionary of counts (a,e,i,o,u)?',
          sampleAnswer: 'Example:\n\n```python\ndef vowel_counts(s):\n    counts = {"a":0,"e":0,"i":0,"o":0,"u":0}\n    for ch in s.casefold():\n        if ch in counts:\n            counts[ch] += 1\n    return counts\n```'
        },
        {
          prompt: 'Show two different ways to reverse a string and compare them briefly.',
          sampleAnswer: 'Slicing: `s[::-1]` is concise. Iterative: `"".join(reversed(s))` is explicit and works for any sequence; both create a new string.'
        }
      ]
    };
  }

  if (k === 'string - practice programs (2)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Write a function that reverses word order in a sentence while normalizing whitespace.',
          sampleAnswer: 'Example:\n\n```python\ndef reverse_words(s):\n    # split() without args collapses any whitespace\n    return " ".join(s.split()[::-1])\n```\n\nEdge cases: empty string returns empty; multiple spaces are normalized.'
        },
        {
          prompt: 'Write an anagram checker that ignores case and spaces. Mention time complexity.',
          sampleAnswer: 'Example:\n\n```python\ndef is_anagram(a, b):\n    a = "".join(ch for ch in a.casefold() if not ch.isspace())\n    b = "".join(ch for ch in b.casefold() if not ch.isspace())\n    return sorted(a) == sorted(b)\n```\n\nComplexity: sorting is O(n log n). A Counter-based approach can do O(n).' 
        },
        {
          prompt: 'Explain `lower()` vs `casefold()` and when `casefold()` is preferable.',
          sampleAnswer: '`casefold()` is a more aggressive Unicode-aware normalization for caseless matching. For general text comparison/search (especially non-ASCII), `casefold()` reduces surprises; `lower()` is simpler and often fine for ASCII-only inputs.'
        }
      ]
    };
  }

  if (k === 'string - practice programs (3)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Write a function that removes all digits from a string without using regex.',
          sampleAnswer: 'Example:\n\n```python\ndef remove_digits(s):\n    return "".join(ch for ch in s if not ch.isdigit())\n```\n\nThis scans once and builds a new string.'
        },
        {
          prompt: 'How would you validate user input as a Python identifier that is not a keyword?',
          sampleAnswer: 'Example:\n\n```python\nimport keyword\n\ndef is_valid_name(name):\n    return name.isidentifier() and not keyword.iskeyword(name)\n```\n\nThis prevents invalid syntax names and reserved words like `class`.'
        },
        {
          prompt: 'Show a clean way to normalize whitespace in a string (tabs/newlines/spaces) into single spaces.',
          sampleAnswer: 'Example: `" ".join(s.split())`. `split()` with no separator treats any run of whitespace as a separator and drops repeats.'
        }
      ]
    };
  }

  if (k === 'list (overview)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what makes lists “mutable” and show a tiny example of in-place change.',
          sampleAnswer: 'A mutable object can be modified without creating a new object. Example:\n\n```python\nlst = [1, 2, 3]\nlst[0] = 99\n# lst is now [99, 2, 3]\n```'
        },
        {
          prompt: 'Describe aliasing for lists and one bug it can cause in real code.',
          sampleAnswer: 'Aliasing happens when two variables reference the same list (e.g., `b = a`). Mutating through one name affects the other. A common bug is “unexpected changes” after passing a list into a function that appends/removes items; callers see their list changed.'
        },
        {
          prompt: 'Compare list vs tuple and give one situation where tuple is the better choice.',
          sampleAnswer: 'Lists are mutable; tuples are immutable. Tuples are better for fixed records like coordinates `(x, y)` or configuration pairs where you want to prevent accidental edits.'
        }
      ]
    };
  }

  if (k === 'list - creation (common ways)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain list comprehensions and rewrite a simple loop as a comprehension.',
          sampleAnswer: 'A list comprehension creates a list from an expression + optional filter. Example loop:\n\n```python\nout = []\nfor x in range(10):\n    if x % 2 == 0:\n        out.append(x * x)\n```\n\nComprehension:\n\n```python\nout = [x * x for x in range(10) if x % 2 == 0]\n```'
        },
        {
          prompt: 'What is the pitfall of `matrix = [[0]*3]*2` and how do you create it correctly?',
          sampleAnswer: 'It duplicates references to the same inner list, so changing one row changes both. Correct:\n\n```python\nmatrix = [[0 for _ in range(3)] for _ in range(2)]\n```'
        },
        {
          prompt: 'When is `list(iterable)` a good idea, and when might it be wasteful?',
          sampleAnswer: 'It’s good when you need indexing/slicing or multiple passes over an iterator. It’s wasteful for large iterables when you only need a single pass; then you should iterate directly to avoid extra memory.'
        }
      ]
    };
  }

  if (k === 'list - accessing elements (indexing + slicing)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain slicing semantics: what does `lst[a:b]` return and why is `b` excluded?',
          sampleAnswer: 'It returns a new list starting at index `a` and stopping before `b` (exclusive). Excluding `b` makes ranges compose cleanly (length is `b-a`) and matches `range(a, b)` semantics.'
        },
        {
          prompt: 'Show two safe ways to access the last element of a list, including how to avoid errors for empty lists.',
          sampleAnswer: 'Use `lst[-1]` if you know it’s non-empty. For possibly-empty lists: `lst[-1] if lst else None`, or check `if not lst: ...` before accessing.'
        },
        {
          prompt: 'What is the difference between `lst[:]` and `lst` in terms of copying?',
          sampleAnswer: '`lst` is just another reference to the same list. `lst[:]` creates a shallow copy (new outer list) but nested mutables are still shared.'
        }
      ]
    };
  }

  if (k === 'list - mutability (editing elements)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Demonstrate slice assignment and explain how it can change list length.',
          sampleAnswer: 'Example:\n\n```python\nlst = [1, 2, 3, 4]\nlst[1:3] = [99]\n# lst becomes [1, 99, 4]\n```\n\nThe replacement iterable length can differ from the slice length.'
        },
        {
          prompt: 'Explain `+=` vs `+` for lists and how aliases behave differently.',
          sampleAnswer: '`a += [x]` mutates the existing list object (in-place), so any alias sees the change. `a = a + [x]` creates a new list and rebinds `a`, so aliases still point to the old list.'
        },
        {
          prompt: 'What is a shallow copy and why does it matter for nested lists?',
          sampleAnswer: 'A shallow copy copies the outer list only. Nested lists remain shared references. Example: `a=[[1],[2]]; b=a.copy(); b[0].append(99)` also changes `a[0]`.'
        }
      ]
    };
  }

  if (k === 'list - traversal (while/for)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `for x in lst` vs `for i in range(len(lst))` vs `for i, x in enumerate(lst)`.',
          sampleAnswer: '`for x in lst` is best when you only need values. `range(len(lst))` is for index-based logic but is verbose. `enumerate(lst)` is the idiomatic way to get both index and value.'
        },
        {
          prompt: 'How would you filter out negative numbers from a list without mutating it while iterating?',
          sampleAnswer: 'Build a new list: `filtered = [x for x in lst if x >= 0]`. This avoids index-shift bugs from removing while iterating.'
        },
        {
          prompt: 'Write a `while` loop that sums list elements and explain the required loop update.',
          sampleAnswer: 'Example:\n\n```python\ni = 0\ntotal = 0\nwhile i < len(lst):\n    total += lst[i]\n    i += 1\n```\n\nThe `i += 1` update prevents an infinite loop.'
        }
      ]
    };
  }

  if (k === 'list - info methods (len, count, index)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the difference between `x in lst` and `lst.index(x)` and how you handle missing values.',
          sampleAnswer: '`x in lst` returns True/False. `lst.index(x)` returns the first index but raises `ValueError` if missing. Handle missing with `if x in lst:` before `index`, or `try/except ValueError`.'
        },
        {
          prompt: 'When would `count()` be the wrong tool, and what would you use instead?',
          sampleAnswer: '`count(x)` scans the list each time (O(n)). If you need counts for many different values, build a frequency dictionary in one pass (or use `collections.Counter`).'
        },
        {
          prompt: 'Write a helper that returns the index of `x` or `-1` if not found.',
          sampleAnswer: 'Example:\n\n```python\ndef find_index(lst, x):\n    try:\n        return lst.index(x)\n    except ValueError:\n        return -1\n```'
        }
      ]
    };
  }

  if (k === 'list - grow list (append, insert, extend)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `append` vs `extend` vs `insert` with one concrete example each.',
          sampleAnswer: 'Example:\n\n```python\nlst = [1, 2]\nlst.append([3, 4])   # [1, 2, [3, 4]]\nlst = [1, 2]\nlst.extend([3, 4])   # [1, 2, 3, 4]\nlst = [1, 2]\nlst.insert(1, 99)    # [1, 99, 2]\n```'
        },
        {
          prompt: 'How do you build a list efficiently in a loop, and what pattern should you avoid?',
          sampleAnswer: 'Use `append` (or `extend`) to grow a list: `out.append(x)`. Avoid repeated `out = out + [x]` in loops because it creates a new list each time (extra copying).' 
        },
        {
          prompt: 'Why can `insert(0, x)` be slow, and what data structure might be better for many front-inserts?',
          sampleAnswer: 'Front inserts shift many elements in a list (O(n)). For many queue-like operations at both ends, use `collections.deque`.'
        }
      ]
    };
  }

  if (k === 'list - shrink list (remove, pop, clear)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `remove`, `pop`, `del`, and `clear` for lists and when you use each.',
          sampleAnswer: '`remove(x)` deletes the first matching value. `pop(i)` deletes by index and returns the element (default is last). `del lst[i]` deletes by index/slice without returning. `clear()` empties the list in-place.'
        },
        {
          prompt: 'Show two ways to remove all occurrences of a value from a list.',
          sampleAnswer: '1) Filtering: `lst = [v for v in lst if v != x]`. 2) Loop: `while x in lst: lst.remove(x)` (works but can be slower due to repeated scans).' 
        },
        {
          prompt: 'Explain why `clear()` can be important when the list is shared across multiple references.',
          sampleAnswer: 'Because it mutates the same list object. If multiple variables or parts of code hold a reference to the list, `clear()` ensures everyone sees it emptied; rebinding `lst = []` only changes one reference.'
        }
      ]
    };
  }

  if (k === 'list - ordering (reverse, sort)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `sorted()` vs `.sort()` deeply: mutation, return value, stability, and `key`/`reverse` usage.',
          sampleAnswer: 'Both can sort using `key=` and `reverse=`. `sorted(iterable, ...)` returns a new list and works on any iterable; it does not mutate the input. `lst.sort(...)` mutates the list in-place and returns `None`.\n\nPython’s sort is stable, meaning elements with equal keys keep their original relative order. This matters when you do multi-step sorting (e.g., sort by last name, then by first name) or when you want deterministic output.\n\nExample:\n\n```python\ndata = [("bob", 2), ("Alice", 2), ("chris", 1)]\nby_score = sorted(data, key=lambda t: t[1])\nby_name_ci = sorted(data, key=lambda t: t[0].casefold())\n```\n\nUse `.sort()` when you can mutate and want to avoid allocating a new list.'
        },
        {
          prompt: 'Show 3 ways to reverse a list and explain which ones allocate new lists.',
          sampleAnswer: '1) `lst.reverse()` reverses in-place (no new list). 2) `reversed(lst)` returns an iterator (no list unless you wrap it with `list(...)`). 3) `lst[::-1]` creates a new reversed list.\n\nExample:\n\n```python\nlst = [1,2,3]\nlst[::-1]          # new list [3,2,1]\nlist(reversed(lst))# new list [3,2,1]\nlst.reverse()      # in-place, lst becomes [3,2,1]\n```'
        },
        {
          prompt: 'How would you sort a list of dictionaries by multiple keys (e.g., score desc, then name asc)?',
          sampleAnswer: 'Use `key` returning a tuple, and `reverse` only if it applies globally; otherwise invert numeric keys. Example:\n\n```python\nstudents = [\n    {"name": "Bob", "score": 80},\n    {"name": "alice", "score": 95},\n    {"name": "Adam", "score": 95},\n]\n\nstudents_sorted = sorted(\n    students,\n    key=lambda d: (-d["score"], d["name"].casefold())\n)\n```\n\nThis sorts score descending via negative score, then name ascending case-insensitively.'
        }
      ]
    };
  }

  if (k === 'list - aliasing vs cloning (copy)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain aliasing with a minimal example and a real bug pattern it causes.',
          sampleAnswer: 'Aliasing means two names refer to the same list object:\n\n```python\na = [1, 2]\nb = a\nb.append(3)\nprint(a)  # [1, 2, 3]\n```\n\nBug pattern: you keep an “original” list for later, but accidentally alias it, so later mutations unexpectedly change the “original”. This often happens when passing a list into a function that appends/removes items without documenting it.'
        },
        {
          prompt: 'Explain shallow copy vs deep copy using a nested-list example, including how to verify sharing.',
          sampleAnswer: 'Shallow copy makes a new outer list but shares inner objects:\n\n```python\nimport copy\n\na = [[1], [2]]\nb = a.copy()      # shallow\nb[0].append(99)\nprint(a)  # [[1, 99], [2]]\n```\n\nTo verify sharing, you can compare identities:\n\n```python\nid(a[0]) == id(b[0])  # True for shallow copy\n```\n\nDeep copy recursively copies nested lists:\n\n```python\nc = copy.deepcopy(a)\n```\n\nNow `id(a[0]) != id(c[0])` and inner mutations won’t leak.'
        },
        {
          prompt: 'When should you avoid `deepcopy` even if it “fixes” the bug?',
          sampleAnswer: 'Avoid `deepcopy` when performance/memory matters or when objects contain non-copyable resources (file handles, sockets). Prefer designing data flow so you don’t mutate shared structures, or rebuild only the parts you need (copy-on-write style) rather than deep-copying everything.'
        }
      ]
    };
  }

  if (k === 'list - operators, comparisons, membership') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain membership (`in`) for lists and why a `set` can be dramatically faster.',
          sampleAnswer: 'For lists, `x in lst` scans left-to-right and compares `x == element` until it finds a match, so worst-case is O(n). For sets, membership uses hashing (average O(1)), so it’s much faster for repeated membership tests.\n\nRule of thumb: if you do many membership checks, convert the reference data to a set once.'
        },
        {
          prompt: 'Explain list concatenation and repetition (`+`, `*`) and one pitfall with nested lists.',
          sampleAnswer: '`+` concatenates two lists and returns a new list. `*` repeats a list.\n\nPitfall: repeating nested lists duplicates references, not inner copies:\n\n```python\nm = [[0]*3] * 2\nm[0][0] = 9\nprint(m)  # [[9,0,0],[9,0,0]]\n```\n\nFix with a comprehension to create independent rows.'
        },
        {
          prompt: 'Explain lexicographic list comparisons and give an example where length misleads beginners.',
          sampleAnswer: 'Comparisons are element-by-element, not “by length”. Example:\n\n```python\n[9] < [1, 2, 3]   # False because 9 > 1 at first element\n[1, 2] < [1, 2, 0]# True because it runs out of elements (prefix is smaller)\n```\n\nThis mirrors string comparison behavior.'
        }
      ]
    };
  }

  if (k === 'list - nested lists + matrix idea') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the “shared inner list” bug when building matrices and how to debug it quickly.',
          sampleAnswer: 'The bug happens when rows reference the same inner list (often from `*` repetition). Debug quickly by printing row identities:\n\n```python\nm = [[0]*3]*2\nprint(id(m[0]) == id(m[1]))  # True indicates shared row\n```\n\nIf rows share the same id, any edit to one row appears in all rows.'
        },
        {
          prompt: 'Write a function that creates an `r x c` zero matrix and explain why it is safe.',
          sampleAnswer: 'Example:\n\n```python\ndef zeros(r, c):\n    return [[0 for _ in range(c)] for _ in range(r)]\n```\n\nIt is safe because the inner list is created fresh for each row, so rows are independent objects.'
        },
        {
          prompt: 'Show how you would sum each row of a matrix and return a list of row sums.',
          sampleAnswer: 'Example:\n\n```python\ndef row_sums(m):\n    return [sum(row) for row in m]\n```\n\nThis uses direct iteration over rows and keeps the code short and readable.'
        }
      ]
    };
  }

  if (k === 'list - list comprehensions (expanded)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the three parts of a comprehension (expression, for-clause, optional if) and rewrite a loop.',
          sampleAnswer: 'A comprehension has: (1) an expression that produces each output element, (2) a `for` clause that iterates, and (3) an optional trailing `if` filter.\n\nRewrite:\n\n```python\nout = []\nfor x in range(10):\n    if x % 2 == 0:\n        out.append(x*x)\n```\n\nAs:\n\n```python\nout = [x*x for x in range(10) if x % 2 == 0]\n```'
        },
        {
          prompt: 'When should you prefer a generator expression over a list comprehension?',
          sampleAnswer: 'Prefer a generator expression when you only need to iterate once and want to avoid allocating a full list (memory). Example: `sum(x*x for x in data)` streams values into `sum` without storing all squares.'
        },
        {
          prompt: 'Give a readability guideline for comprehensions in real projects.',
          sampleAnswer: 'If the comprehension becomes nested, has multiple `for` clauses, or complex conditions, prefer a normal `for` loop with clear variable names. Clarity beats cleverness, especially when debugging or onboarding teammates.'
        }
      ]
    };
  }

  if (k === 'list - program: unique vowels in a word') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Implement “unique vowels in a word” with order preserved and explain your data-structure choice.',
          sampleAnswer: 'Example:\n\n```python\ndef unique_vowels(word):\n    seen = set()\n    out = []\n    for ch in word.casefold():\n        if ch in "aeiou" and ch not in seen:\n            seen.add(ch)\n            out.append(ch)\n    return out\n```\n\n`seen` (set) gives fast membership; `out` (list) preserves the order of first occurrence.'
        },
        {
          prompt: 'How would you change the output to be sorted vowels, and what changes in complexity?',
          sampleAnswer: 'Use a set-comprehension then sort:\n\n```python\nsorted({ch for ch in word.casefold() if ch in "aeiou"})\n```\n\nThe scan is O(n); sorting up to 5 vowels is tiny, but in general sorting adds O(k log k) where k is number of unique items.'
        },
        {
          prompt: 'List two common edge cases and how you handle them.',
          sampleAnswer: '1) Uppercase letters: use `casefold()` so both `A` and `a` count. 2) Non-letter characters (punctuation): the vowel check `ch in "aeiou"` naturally ignores them. If you need to ignore accents or handle other alphabets, you would add normalization.'
        }
      ]
    };
  }

  if (k === 'tuple (overview)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain tuples: ordering, immutability, and typical use-cases in production code.',
          sampleAnswer: 'A tuple is an ordered sequence like a list, but immutable (no item assignment). Use it for fixed-size records (coordinates, RGB values), returning multiple values from functions, and as dictionary keys when it contains only hashable items.\n\nImmutability is valuable for correctness: you can pass a tuple around knowing it won’t be modified accidentally.'
        },
        {
          prompt: 'Explain how a tuple can “contain” a mutable object and why that is not a contradiction.',
          sampleAnswer: 'Tuple immutability means the tuple’s element references cannot be reassigned. But if an element is a mutable object (like a list), the object itself can mutate:\n\n```python\nt = ([],)\nt[0].append(1)  # valid\n```\n\nThe tuple still points to the same list; the list changed internally.'
        },
        {
          prompt: 'Give a concrete example where using a tuple prevents a bug compared to using a list.',
          sampleAnswer: 'If you store coordinates as a list, some code might accidentally mutate it (`point[0] += 1`). With a tuple `(x, y)`, that fails fast, so the bug is caught immediately rather than silently changing shared state.'
        }
      ]
    };
  }

  if (k === 'tuple - creation + the single-item tuple trap') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the single-element tuple syntax and why the comma matters (show a bug example).',
          sampleAnswer: 'A single-element tuple needs a trailing comma: `(42,)`. Without the comma, `(42)` is just the integer 42. Bug example:\n\n```python\nx = (42)\ntype(x)  # int\n\ny = (42,)\ntype(y)  # tuple\n```\n\nThis matters if code expects to iterate a 1-item tuple.'
        },
        {
          prompt: 'Show tuple packing and unpacking with a short practical example.',
          sampleAnswer: 'Packing: `t = 1, 2, 3` creates a tuple. Unpacking:\n\n```python\na, b, c = t\n```\n\nThis is common when functions return multiple values, e.g., `q, r = divmod(10, 3)`.'
        },
        {
          prompt: 'How do you convert between list and tuple, and when is that useful?',
          sampleAnswer: 'Use `tuple(lst)` to freeze a list into an immutable tuple; use `list(t)` to get a mutable copy. This is useful when you want to prevent later mutation (tuple) or when you need to modify then return an immutable result (list → modify → tuple).' 
        }
      ]
    };
  }

  if (k === 'tuple - accessing (indexing + slicing)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain indexing and slicing for tuples, including what happens on out-of-range indices.',
          sampleAnswer: 'Indexing returns a single element and raises `IndexError` if the index is out of range. Slicing returns a new tuple and is forgiving about out-of-range bounds.\n\nExample:\n\n```python\nt = (10, 20, 30)\nt[0]     # 10\nt[1:99]  # (20, 30)\n```\n\nSlicing does not raise `IndexError`; it clamps to valid bounds.'
        },
        {
          prompt: 'Show how to safely access the last element of a tuple that might be empty.',
          sampleAnswer: 'Use a guard:\n\n```python\nlast = t[-1] if t else None\n```\n\nOr handle empty case explicitly (raise a custom error / return default).' 
        },
        {
          prompt: 'Explain why tuple slicing returns a new tuple and what that implies for performance.',
          sampleAnswer: 'Slicing constructs a new tuple object, so it copies references for the sliced elements. It’s typically fine for small slices, but repeated slicing in a tight loop can allocate many objects; in performance-sensitive code, prefer indexing/iteration patterns that avoid repeated slicing.'
        }
      ]
    };
  }

  if (k === 'tuple - immutability (what it means in practice)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain tuple immutability and show what errors occur when trying to modify a tuple.',
          sampleAnswer: 'Tuples do not support item assignment, so operations like `t[0] = 99` raise `TypeError`. Example:\n\n```python\nt = (1, 2, 3)\n# t[0] = 99  -> TypeError\n```\n\nIf you need a modified version, you construct a new tuple.'
        },
        {
          prompt: 'Show how to “modify” a tuple by creating a new tuple, and mention a practical alternative.',
          sampleAnswer: 'Example (rebuild with slicing):\n\n```python\nt = (1, 2, 3)\nt2 = (99,) + t[1:]   # (99, 2, 3)\n```\n\nAlternative: convert to list, modify, convert back:\n\n```python\nlst = list(t)\nlst[0] = 99\nt2 = tuple(lst)\n```'
        },
        {
          prompt: 'Explain the subtle point: tuple immutability vs mutability of contained objects.',
          sampleAnswer: 'Immutability means tuple elements cannot be rebound, but if an element is a mutable object, it can still mutate. Example:\n\n```python\nt = ([1, 2],)\nt[0].append(3)  # works\n```\n\nThis matters when using tuples for “safety”: tuples are safer for fixed scalars/immutables, but they do not automatically make nested structures immutable.'
        }
      ]
    };
  }

  if (k === 'tuple - operators, membership, comparisons') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare tuple membership testing (`x in t`) with set membership (`x in s`) in terms of algorithmic complexity and real performance.',
          sampleAnswer: 'Tuple membership is a linear scan: Python checks each element until it finds a match, so worst-case is O(n). Set membership is hash-based (average O(1)), so it is dramatically faster for repeated lookups.\n\nPractical rule: if you will do many membership tests, build a set once (e.g., `allowed = set(values)`) and test against it.'
        },
        {
          prompt: 'Explain tuple comparisons (lexicographic) and give an example where comparison fails with `TypeError` in Python 3.',
          sampleAnswer: 'Tuples compare element-by-element until a difference is found. Example: `(1, 2) < (1, 3)` is True because 2 < 3 at the first differing position. But if Python reaches elements that cannot be ordered, you get `TypeError`, e.g.:\n\n```python\n(1, "a") < (1, 2)\n# TypeError: "<" not supported between instances of "str" and "int"\n```\n\nThis is because Python 3 does not define ordering between unrelated types.'
        },
        {
          prompt: 'Show an idiomatic use of tuples in sorting (multi-key sort) and explain why it works well.',
          sampleAnswer: 'A common pattern is using a tuple as the sort key: Python sorts tuples lexicographically.\n\n```python\nstudents = [("bob", 80), ("Alice", 95), ("Adam", 95)]\n# sort by score desc, then name asc (case-insensitive)\nout = sorted(students, key=lambda t: (-t[1], t[0].casefold()))\n```\n\nThe key returns a tuple `(-score, name)` so sorting naturally applies primary then secondary ordering.'
        }
      ]
    };
  }

  if (k === 'tuple - useful functions (len, count, index, sorted, min/max)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `count` vs `index` on tuples, including pitfalls and when you should use a different tool.',
          sampleAnswer: '`t.count(x)` counts occurrences and always scans the whole tuple (O(n)). `t.index(x)` finds the first position and stops early, but it raises `ValueError` if `x` is missing.\n\nIf you need counts for many different values, calling `count` repeatedly is O(n*k). Instead, build a frequency map once (e.g., `collections.Counter(t)`) and answer queries in O(1) average.'
        },
        {
          prompt: 'Explain why `sorted(t)` returns a list and how you keep the output immutable if your API expects a tuple.',
          sampleAnswer: '`sorted(...)` always returns a list by design (it is a general-purpose sorting function). If you want an immutable result, wrap it: `tuple(sorted(t))`.\n\nIn real code, this is useful when you want a canonical ordering for cache keys or comparisons while still signaling “do not mutate”.'
        },
        {
          prompt: 'Show a `min`/`max` example with `key=` and explain what `key` changes (and what it does not change).',
          sampleAnswer: '`key` changes *how elements are compared*, not what gets returned. Example: pick the longest string:\n\n```python\nwords = ("hi", "hello", "bye")\nlongest = max(words, key=len)  # "hello"\n```\n\n`max` returns the original element ("hello"), not the key value (5).'
        }
      ]
    };
  }

  if (k === 'tuple - packing and unpacking (including *)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain unpacking vs slicing for extracting parts of a sequence, and show how `*rest` can replace manual indexing.',
          sampleAnswer: 'Unpacking is declarative and avoids manual index math. Example:\n\n```python\nfirst, *middle, last = [1, 2, 3, 4]\n# first=1, middle=[2, 3], last=4\n```\n\nWithout unpacking you might write `first = a[0]`, `last = a[-1]`, `middle = a[1:-1]`, which is more error-prone and less descriptive.'
        },
        {
          prompt: 'What are the two common `ValueError` messages during unpacking, and how do you debug them quickly?',
          sampleAnswer: 'You’ll see either “too many values to unpack” or “not enough values to unpack”. Debug by printing `len(seq)` (or the sequence itself if small) and checking how many variables you’re unpacking into. If the sequence length can vary, use extended unpacking (`*rest`) or validate input shape up front.'
        },
        {
          prompt: 'Give two real-world places unpacking appears in Python codebases.',
          sampleAnswer: '1) Looping key/value pairs: `for k, v in d.items(): ...`\n2) Multiple returns: `q, r = divmod(a, b)` or `ok, value = parse(...)`\n\nIt keeps code compact while preserving structure.'
        }
      ]
    };
  }

  if (k === 'tuple - "tuple comprehension" vs generator') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why is “tuple comprehension” a misnomer in Python, and what does `(expr for x in it)` actually build?',
          sampleAnswer: 'Python does not have a dedicated “tuple comprehension” syntax. The expression `(expr for x in it)` is a generator expression: it produces values lazily as you iterate.\n\nTo build a tuple, you must explicitly consume it: `tuple(expr for x in it)`.'
        },
        {
          prompt: 'Show a common bug when someone thinks they created a tuple but actually created a generator, and how to fix it.',
          sampleAnswer: 'Bug: trying to index a generator.\n\n```python\ng = (x*x for x in range(5))\n# g[0]  # TypeError: "generator" object is not subscriptable\n\n# Fix:\nt = tuple(x*x for x in range(5))\n# now t[0] works\n```'
        },
        {
          prompt: 'When is a generator expression better than building a list/tuple, and what is one caveat?',
          sampleAnswer: 'Generators are great when you stream data once (memory efficiency), e.g., `sum(f(x) for x in data)`. Caveat: generators are single-use—once consumed, they’re exhausted. If you need to iterate multiple times, materialize into a list/tuple.'
        }
      ]
    };
  }

  if (k === 'tuple - program: sum and average') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Implement a robust `sum_and_avg(nums)` and define what happens on empty input.',
          sampleAnswer: 'One robust approach is to make the contract explicit for empty input. Example returning `(0, None)`:\n\n```python\ndef sum_and_avg(nums):\n    if not nums:\n        return 0, None\n    total = sum(nums)\n    return total, total / len(nums)\n```\n\nAlternatively, raise a `ValueError` with a clear message if empty input is invalid for your use-case.'
        },
        {
          prompt: 'Discuss numerical details: integer vs float average, and when you might use rounding.',
          sampleAnswer: 'In Python, `/` produces a float even for integers, which is typically what you want for an average. If you need a fixed number of decimals for display, use `round(avg, 2)` or formatting like `f"{avg:.2f}"`. Avoid using `//` for averages unless you explicitly want floor behavior.'
        },
        {
          prompt: 'What simple tests would you run to validate the function?',
          sampleAnswer: 'Test: (1) normal case `(1,2,3)` → sum=6, avg=2.0; (2) single element `(5,)` → avg=5.0; (3) empty `()` matches the chosen contract; (4) negative numbers; (5) floats. These cover shape and type edge cases.'
        }
      ]
    };
  }

  if (k === 'tuple vs list (when to use which)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the decision rule: when do you pick tuple vs list, beyond just “tuple is immutable”?',
          sampleAnswer: 'Pick based on *intent and API guarantees*. Use a tuple when the data is a fixed-size record (coordinates, RGB, (id, name)) or when you want to signal “do not mutate this”. Use a list when the collection is meant to change (append/remove/sort) or when you’re building up results incrementally.'
        },
        {
          prompt: 'Explain hashability: when can a tuple be a dict key, and when can it not?',
          sampleAnswer: 'A tuple is hashable only if all its elements are hashable. So `(1, "a")` can be a dict key, but `([1,2], 3)` cannot because the list is unhashable. This is why tuples are often used for compound keys like `(row, col)`.'
        },
        {
          prompt: 'Give an example where converting a list to a tuple at the boundary improves safety.',
          sampleAnswer: 'If a function receives a sequence of configuration values that should not be mutated, you can convert once: `config = tuple(config)` and then pass it around. Downstream code can’t accidentally append/remove elements, which prevents a whole class of “mysterious mutation” bugs.'
        }
      ]
    };
  }

  if (k === 'set (overview)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what sets are best at, and why their performance characteristics are different from lists/tuples.',
          sampleAnswer: 'Sets are best for uniqueness and fast membership testing. They are hash tables under the hood, so `x in s` is average O(1). Lists/tuples are sequences, so membership is a scan (O(n)). This makes sets ideal for deduplication and “is this allowed/seen?” checks.'
        },
        {
          prompt: 'What does “unordered” mean for sets, and what mistake does it commonly cause?',
          sampleAnswer: 'Unordered means you should not rely on element positions or stable iteration order for program logic. A common mistake is expecting “the first element” or a consistent `pop()` element. If you need both uniqueness and order, you keep a separate list or use an order-preserving technique (e.g., dict keys in modern Python) depending on requirements.'
        },
        {
          prompt: 'What elements can be in a set, and how do you explain “hashable” simply?',
          sampleAnswer: 'Set elements must be hashable: they need a stable hash value so the set can store/find them. Immutable types like ints/strings/tuples-of-hashables work. Mutable containers like lists/dicts/sets are unhashable and cannot be elements.'
        }
      ]
    };
  }

  if (k === 'set - creation (and the empty set pitfall)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the empty-set pitfall and show correct creation patterns for empty and non-empty sets.',
          sampleAnswer: '`{}` creates an empty dict, not a set. The empty set is `set()`. Non-empty sets use braces: `{1, 2, 3}`. To build from an iterable: `set([1, 1, 2])` or `set("banana")` (unique characters).' 
        },
        {
          prompt: 'Show a set comprehension and compare it to a list comprehension.',
          sampleAnswer: 'Set comprehension uses braces: `{expr for x in it if cond}` and produces unique results. Example: `{x*x for x in range(6) if x % 2 == 0}`. A list comprehension would keep duplicates and preserve order. Choose based on whether you need uniqueness or ordering.'
        },
        {
          prompt: 'What is one subtle behavior when building sets from strings, and how do you handle it?',
          sampleAnswer: 'Strings are iterables of characters, so `set("abc")` becomes `{ "a", "b", "c" }`. If you want the whole string as one element, use `s.add("abc")` instead of `update`, or wrap it in a 1-item iterable for construction: `set(["abc"])`.'
        }
      ]
    };
  }

  if (k === 'set - add() vs update() (very important)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `add` vs `update` precisely, and show why `update` on strings surprises beginners.',
          sampleAnswer: '`add(x)` adds one element `x`. `update(iterable)` loops over the iterable and adds each element. With a string, iteration yields characters:\n\n```python\ns = set()\ns.add("abc")    # {"abc"}\ns = set()\ns.update("abc") # {"a", "b", "c"}\n```'
        },
        {
          prompt: 'Give an example where `update` with a tuple does something different than `add` with a tuple.',
          sampleAnswer: '```python\ns = set()\ns.add((1, 2))      # adds the tuple as one element\ns = set()\ns.update((1, 2))   # adds 1 and 2 as separate elements\n```\n\nBecause `update` iterates the tuple. This is a common source of subtle bugs.'
        },
        {
          prompt: 'How do you add multiple items efficiently, and what does `update` accept?',
          sampleAnswer: 'Use `update` to add many items in one call: `s.update(other_iterable)`. It accepts any iterable, and also supports multiple iterables: `s.update(a, b, c)`.'
        }
      ]
    };
  }

  if (k === 'set - copy(), pop(), remove(), discard(), clear()') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `remove` vs `discard` and explain which one you prefer in defensive code.',
          sampleAnswer: '`remove(x)` raises `KeyError` if `x` is missing; `discard(x)` does nothing. In defensive code where “already missing” is acceptable, `discard` avoids extra checks/try-except. When missing indicates a bug, `remove` is better because it fails loudly.'
        },
        {
          prompt: 'Explain `pop()` for sets and why you shouldn’t use it for deterministic removal.',
          sampleAnswer: '`set.pop()` removes and returns an arbitrary element because sets are unordered. It is useful for “take some element” algorithms, but not for “remove the last/first” semantics. If the set is empty, `pop()` raises `KeyError`.'
        },
        {
          prompt: 'Explain aliasing vs copying for sets and show a quick identity check to debug shared references.',
          sampleAnswer: 'Aliasing: `b = a` points both names to the same set, so mutations affect both. Copying: `b = a.copy()` creates a new set object. Debug with identity: `a is b` (or `id(a) == id(b)`). If `a is b` is True, you have aliasing and should copy if independence is required.'
        }
      ]
    };
  }

  if (k === 'set - mathematical operations (union, intersection, ...)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain union, intersection, difference, and symmetric difference for sets. Include both operator and method forms, and mention in-place variants.',
          sampleAnswer: 'Union combines elements: `a | b` or `a.union(b)`. Intersection keeps common elements: `a & b` or `a.intersection(b)`. Difference removes elements in the other set: `a - b` or `a.difference(b)`. Symmetric difference keeps elements in exactly one set: `a ^ b` or `a.symmetric_difference(b)`\n\nNon-in-place forms return a new set. In-place forms mutate: `a |= b`, `a &= b`, `a -= b`, `a ^= b` (or `update`, `intersection_update`, `difference_update`, `symmetric_difference_update`).'
        },
        {
          prompt: 'Give a real-world example where set operations simplify code compared to loops.',
          sampleAnswer: 'Example: two classes of students. If `a` and `b` are lists of IDs, you can compute shared students with `set(a) & set(b)`, students only in class A with `set(a) - set(b)`, and all unique students with `set(a) | set(b)`. This replaces nested loops and makes intent obvious.'
        },
        {
          prompt: 'How do subset/superset checks work and what is a typical use-case?',
          sampleAnswer: 'Use `required <= granted` (or `required.issubset(granted)`) to verify all required permissions are present. Superset is `granted >= required`. Disjointness is `a.isdisjoint(b)` when you need to ensure no overlap (for example, forbidden tags and requested tags do not intersect).'
        }
      ]
    };
  }

  if (k === 'set - membership and "no indexing"') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why do sets not support indexing, and what does that imply for how you design algorithms with sets?',
          sampleAnswer: 'Sets are unordered; there is no meaningful or stable element position, so indexing would be misleading. Algorithm design should treat sets as bags of unique items: you ask membership, you add or remove, and you use set operations. If you need a stable order, either sort (`sorted(s)`) or choose an ordered structure (list, or dict keys for ordered uniqueness).'
        },
        {
          prompt: 'Explain `pop()` on a set and why it should not be used for deterministic behavior.',
          sampleAnswer: '`set.pop()` removes and returns an arbitrary element. It is useful for algorithms where you just need some pending item, but it should not be used when you need a predictable element (like smallest or first-inserted). For determinism, use `min(s)` or `sorted(s)`.'
        },
        {
          prompt: 'When is a set the right choice, and when is it the wrong choice?',
          sampleAnswer: 'Right choice: deduplication, fast membership tests, and computing overlaps (union/intersection/difference). Wrong choice: when duplicates matter, when you need stable ordering, or when you need random access by index.'
        }
      ]
    };
  }

  if (k === 'set - comprehensions (with examples)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Show a set comprehension that normalizes and deduplicates words from a list (case-insensitive, trimmed).',
          sampleAnswer: 'Example:\n\n```python\nwords = ["  Apple", "apple", "BANANA", "banana "]\nunique = {w.strip().casefold() for w in words if w.strip()}\n# {"apple", "banana"}\n```\n\n`casefold()` is stronger than `lower()` for some Unicode edge cases.'
        },
        {
          prompt: 'How do you explain the difference between a set comprehension and a dict comprehension in one sentence?',
          sampleAnswer: 'A set comprehension is `{expr for x in it}` (no colon) and produces unique values; a dict comprehension is `{k: v for ...}` (has a colon) and produces key-value pairs.'
        },
        {
          prompt: 'What is a common performance or correctness pitfall with comprehensions?',
          sampleAnswer: 'A common pitfall is relying on ordering (sets do not preserve a meaningful order for algorithm logic). Another pitfall is doing expensive work inside the expression repeatedly. Prefer clarity: if it gets complex, use a normal loop.'
        }
      ]
    };
  }

  if (k === 'set - program: different vowels in a word') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Implement a function that returns the unique vowels in a word. Use a set operation in your solution.',
          sampleAnswer: 'Use intersection between the character set and the vowel set:\n\n```python\ndef unique_vowels(word):\n    vowels = set("aeiou")\n    return set(word.lower()) & vowels\n```\n\nThis is concise and emphasizes the set concept: keep only characters that are vowels.'
        },
        {
          prompt: 'How would you extend it to ignore punctuation and spaces?',
          sampleAnswer: 'Filter characters before inserting: `set(ch for ch in word.lower() if ch.isalpha()) & vowels`. This keeps only letters and then intersects with the vowel set.'
        },
        {
          prompt: 'What tests would you run quickly to validate correctness?',
          sampleAnswer: 'Test mixed case (`"Apple"` -> `{ "a", "e" }`), repeated vowels (`"queue"` -> `{ "u", "e" }`), no vowels (`"rhythm"` -> empty set), and punctuation (`"a,e!"` -> `{ "a", "e" }`).'
        }
      ]
    };
  }

  if (k === 'set - program: remove duplicates from a list') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Show two ways to remove duplicates from a list: one that preserves order and one that does not.',
          sampleAnswer: 'Not preserving order (fast, simplest): `unique = list(set(items))` (order is not guaranteed).\n\nPreserving order: `unique = list(dict.fromkeys(items))` or the explicit pattern:\n\n```python\nseen = set()\nout = []\nfor x in items:\n    if x in seen:\n        continue\n    seen.add(x)\n    out.append(x)\n```\n\nChoose based on whether ordering is a requirement.'
        },
        {
          prompt: 'What happens if the list contains unhashable items like lists, and how do you handle it?',
          sampleAnswer: 'Sets and dict keys require hashable items, so `set([[1],[1]])` raises `TypeError`. You can convert items into a hashable representation (like tuples) when it is semantically correct, or deduplicate by equality with a custom key function (for example, serialize to JSON) depending on the data.'
        },
        {
          prompt: 'Explain the space and time complexity of the order-preserving solution.',
          sampleAnswer: 'Average O(n) time and O(n) extra space: the `seen` set (or dict) stores items to support fast membership checks.'
        }
      ]
    };
  }

  if (k === 'set - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Given two lists of emails, how do you deduplicate them case-insensitively and then find which emails are common to both lists?',
          sampleAnswer: 'Normalize first, then use set operations:\n\n```python\ndef norm(email):\n    return email.strip().casefold()\n\nsa = {norm(e) for e in a if e.strip()}\nsb = {norm(e) for e in b if e.strip()}\ncommon = sa & sb\n```\n\nThis avoids repeated scanning and makes intent explicit.'
        },
        {
          prompt: 'Explain a bug caused by confusing `add` and `update` and how you would spot it in a code review.',
          sampleAnswer: 'If code does `s.update(token)` where `token` is a string, it will add characters instead of the full token. In review, look for `update` called with strings or tuples when the intent was to add one element. The fix is `s.add(token)` or `s.update([token])`.'
        },
        {
          prompt: 'How do you decide between a list, set, and dictionary for a problem quickly?',
          sampleAnswer: 'List: ordering and duplicates matter. Set: uniqueness and membership checks or set algebra. Dict: associate keys to values (lookup by key, counting, grouping). Many problems use a combination: list for order, set for membership, dict for mapping or counting.'
        }
      ]
    };
  }

  if (k === 'dictionary (overview)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain how a Python dictionary works internally at a high level and why it is usually fast.',
          sampleAnswer: 'A dict is a hash table: it computes a hash for the key and uses it to find the storage location. This makes key lookup average O(1). Collisions exist but are handled internally; typical workloads remain close to constant time.'
        },
        {
          prompt: 'Why must keys be hashable, and why are lists not allowed as keys?',
          sampleAnswer: 'Hashable means the key has a stable hash and stable equality. Lists are mutable, so their contents can change, and they have no stable hash. If a key could change after insertion, the dict would not be able to find it reliably.'
        },
        {
          prompt: 'Show how you would use a dictionary to count frequencies in a string.',
          sampleAnswer: 'Example:\n\n```python\ncounts = {}\nfor ch in text:\n    counts[ch] = counts.get(ch, 0) + 1\n```\n\nThis is a standard dict pattern: accumulate values by key.'
        }
      ]
    };
  }

  if (k === 'dictionary - creating dictionaries') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Show how to create dictionaries from different inputs: literals, pairs, and two parallel lists.',
          sampleAnswer: 'Literals: `d = {"a": 1, "b": 2}`. From pairs: `d = dict([("a", 1), ("b", 2)])`. From parallel lists: `d = dict(zip(keys, values))`.'
        },
        {
          prompt: 'How do you merge two dictionaries, and what happens if keys overlap?',
          sampleAnswer: 'Use `{**a, **b}` or `a | b` (Python 3.9+). Overlapping keys take the value from the later dict (the right-hand side wins). For in-place merge, use `a.update(b)`.'
        },
        {
          prompt: 'What is a subtle pitfall with `dict.fromkeys(keys, value)` when `value` is mutable?',
          sampleAnswer: 'All keys reference the same mutable object. Example: `dict.fromkeys(["a", "b"], [])` makes both keys share one list, so mutating it affects both. Fix by creating a new object per key (loop) or use `defaultdict(list)` for accumulation.'
        }
      ]
    };
  }

  if (k === 'dictionary - keys: what is allowed (hashable)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain hashability with examples and give a simple rule of thumb for what can be a dict key.',
          sampleAnswer: 'Rule of thumb: keys should be immutable. Valid keys include ints, strings, and tuples of hashable elements. Invalid keys include lists, dicts, and sets. Example: `(1, "a")` is valid; `([1, 2], 3)` is invalid.'
        },
        {
          prompt: 'How do you convert a list into a safe key when the list contents represent identity?',
          sampleAnswer: 'Convert to a tuple: `key = tuple(lst)` (only works if elements are hashable). For nested structures, recursively convert or serialize to a stable representation.'
        },
        {
          prompt: 'What is the danger of using a mutable object as a key if it can change after insertion?',
          sampleAnswer: 'If the key hash or equality changes after insertion, the dict may not find the entry again because the entry is stored based on the original hash. Keys must be effectively immutable with respect to `__hash__` and `__eq__`.'
        }
      ]
    };
  }

  if (k === 'dictionary - accessing values ([], in, get)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `d[key]`, `d.get(key)`, and `key in d` and when you use each one.',
          sampleAnswer: '`d[key]` is strict and raises `KeyError` if missing (good when missing indicates a bug). `d.get(key, default)` is safe when missing is expected. `key in d` checks whether the key exists before accessing.'
        },
        {
          prompt: 'Show a robust pattern for reading optional fields from a dictionary input (for example, user JSON).',
          sampleAnswer: 'Use `get` with defaults and validate:\n\n```python\nage = data.get("age", 0)\n# validate/coerce as needed\nage = int(age)\n```\n\nThis avoids `KeyError` and keeps a clear default.'
        },
        {
          prompt: 'Explain `setdefault` in one sentence and give a grouping example.',
          sampleAnswer: '`setdefault(key, default)` returns the value for the key, inserting the default if the key is missing. Example:\n\n```python\ngroups = {}\nfor name, dept in rows:\n    groups.setdefault(dept, []).append(name)\n```'
        }
      ]
    };
  }

  if (k === 'dictionary - updating entries (assignment, update)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `d[key] = value`, `d.update(...)`, and the merge operators (`|`, `|=`). When would you use each one?',
          sampleAnswer: 'Use `d[key] = value` for a single known key assignment (most readable). Use `d.update(mapping_or_pairs)` to apply many updates at once or to merge from another mapping. Use `merged = d1 | d2` to create a new merged dict without mutating either input (Python 3.9+). Use `d1 |= d2` for an in-place merge. Overlapping keys are overwritten by the right-hand side in both `update` and `|`.'
        },
        {
          prompt: 'Show the different accepted input forms for `update` (mapping vs iterable of pairs) with examples.',
          sampleAnswer: 'Examples:\n\n```python\nd = {"a": 1}\nd.update({"b": 2})\nd.update([("c", 3), ("d", 4)])\nd.update(b=2, c=3)\n```\n\nAll of these mutate `d` and return `None`.'
        },
        {
          prompt: 'Describe a subtle bug caused by assuming `update` returns the updated dict.',
          sampleAnswer: '`update` returns `None`. A common bug is writing `d = d.update(other)` which sets `d` to `None`. Correct code is `d.update(other)` (no assignment), or create a new dict with `{**d, **other}` / `d | other` when you need a new object.'
        }
      ]
    };
  }

  if (k === 'dictionary - setdefault() (read-or-insert)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `setdefault` precisely (side effects + return value) and give a grouping example.',
          sampleAnswer: '`d.setdefault(key, default)` returns `d[key]`. If the key is missing, it inserts `default` under that key as a side effect. Grouping example:\n\n```python\ngroups = {}\nfor name, dept in rows:\n    groups.setdefault(dept, []).append(name)\n```'
        },
        {
          prompt: 'Compare `setdefault` with `get` and with `defaultdict`.',
          sampleAnswer: '`get` never inserts; it just returns a value or a default. `setdefault` may insert. `defaultdict(list)` is often cleaner for accumulation because you can do `groups[dept].append(name)` and the list is created automatically; it also avoids calling `setdefault` repeatedly.'
        },
        {
          prompt: 'What is a performance/clarity downside of `setdefault` in tight loops and how would you rewrite it?',
          sampleAnswer: 'You still evaluate the default expression you pass each iteration (even if the key exists). For heavy defaults, prefer an explicit `if key not in d` block or `defaultdict`. For clarity, many teams prefer `defaultdict(list)` for grouping.'
        }
      ]
    };
  }

  if (k === 'dictionary - deleting entries (del, pop, popitem, clear)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `del`, `pop`, `popitem`, and `clear`. Focus on return values and missing-key behavior.',
          sampleAnswer: '`del d[k]` removes a key but returns nothing and raises `KeyError` if missing. `d.pop(k)` removes and returns the value; it raises unless you give a default (`d.pop(k, default)`). `d.popitem()` removes and returns a `(key, value)` pair (in modern Python it removes the last inserted pair). `d.clear()` empties the dict in-place.'
        },
        {
          prompt: 'Give a realistic use-case for `popitem()`.',
          sampleAnswer: 'A simple example is consuming items while building something else: while the dict is not empty, `k, v = d.popitem()` processes and removes items. It can also be used to implement LIFO-style eviction with insertion-order semantics.'
        },
        {
          prompt: 'Explain the difference between `d.clear()` and reassigning `d = {}` in terms of references.',
          sampleAnswer: '`d.clear()` mutates the same dict object, so any other reference to that dict sees it become empty. `d = {}` just rebinds the name `d` to a new dict; other references still point to the old dict (unchanged).'
        }
      ]
    };
  }

  if (k === 'dictionary - iteration (keys, values, items)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what you get when iterating a dict directly, and when you would use `items()`.',
          sampleAnswer: 'Iterating a dict yields keys. Use `items()` when you need both key and value: `for k, v in d.items(): ...`. It avoids extra indexing like `d[k]` and makes intent clear.'
        },
        {
          prompt: 'What are dict view objects and how do they behave if the dict changes?',
          sampleAnswer: '`d.keys()`, `d.values()`, and `d.items()` return view objects that reflect the current contents of the dict (dynamic). If the dict changes, the view reflects the changes. For stable snapshots, wrap with `list(...)`.'
        },
        {
          prompt: 'Why is mutating a dictionary while iterating a common bug, and what safe alternatives do you use?',
          sampleAnswer: 'Changing dict size during iteration can raise runtime errors or lead to missed elements. Safe alternatives: iterate over `list(d.items())` (snapshot), build a new dict with a comprehension, or collect keys to delete first and delete after the loop.'
        }
      ]
    };
  }

  if (k === 'dictionary - copy() and nested dictionaries (shallow copy)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain shallow vs deep copy for dictionaries and demonstrate the bug with a minimal nested example.',
          sampleAnswer: 'Shallow copy duplicates only the top-level dict. Nested objects are shared. Example:\n\n```python\nimport copy\nd1 = {"a": {"x": 1}}\nd2 = d1.copy()\nd2["a"]["x"] = 99\n# d1["a"]["x"] is now 99 (shared inner dict)\n\nd3 = copy.deepcopy(d1)\nd3["a"]["x"] = 0\n# d1 stays unchanged\n```'
        },
        {
          prompt: 'When is `dict.copy()` sufficient, and when should you avoid `deepcopy`?',
          sampleAnswer: '`dict.copy()` is sufficient when values are immutable or you only need a separate outer mapping. `deepcopy` can be expensive and may copy more than you expect (or fail on non-copyable objects), so prefer explicit copying of only the parts you need when possible.'
        },
        {
          prompt: 'How would you debug a suspected shallow-copy bug quickly?',
          sampleAnswer: 'Print identities of nested objects: `id(d1["a"])` vs `id(d2["a"])`. If they match, you are sharing the same inner object. Then fix by deep copying, rebuilding the nested structure, or designing to avoid mutating shared nested state.'
        }
      ]
    };
  }

  if (k === 'dictionary - program: store students and percentages') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Design a program that stores student name -> percentage. What inputs do you accept and what validations do you add?',
          sampleAnswer: 'Accept either (name, scored, total) rows or interactive input. Validate: non-empty name, numeric scored/total, `total > 0`, and typically `0 <= scored <= total`. Decide policy for duplicate names (overwrite, reject, or store a list of attempts).'
        },
        {
          prompt: 'Show a clean implementation for computing and storing percentages, including rounding and output formatting.',
          sampleAnswer: 'Example:\n\n```python\nperc = {}\nfor name, scored, total in records:\n    pct = (float(scored) / float(total)) * 100\n    perc[name] = round(pct, 2)\n\nfor name, pct in perc.items():\n    print(f"{name}: {pct:.2f}%")\n```'
        },
        {
          prompt: 'How would you extend the design to store multiple subjects per student (nested dictionary)?',
          sampleAnswer: 'Use nested dict: `marks[name][subject] = score`. Initialize with `setdefault`: `marks.setdefault(name, {})[subject] = score`, or use `defaultdict(dict)`. Be careful with shallow copies if you later copy the structure.'
        }
      ]
    };
  }

  if (k === 'dictionary - program: sum of values (safe input)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Implement summing dictionary values robustly when values may be strings or missing/invalid. Explain your error-handling strategy.',
          sampleAnswer: 'Strategy: attempt numeric conversion and skip invalid values. Example:\n\n```python\ntotal = 0.0\nfor v in d.values():\n    try:\n        total += float(v)\n    except (TypeError, ValueError):\n        continue\n```\n\nThis avoids crashing on bad inputs.'
        },
        {
          prompt: 'How do you preserve information about invalid inputs instead of silently ignoring them?',
          sampleAnswer: 'Collect errors: keep a list of keys that failed parsing or count how many invalid values occurred. For example, iterate `for k, v in d.items()` and push `k` into `invalid` when conversion fails.'
        },
        {
          prompt: 'When is `sum(d.values())` safe and preferred?',
          sampleAnswer: 'When you control the data and all values are numeric (int/float/Decimal). It is concise and typically faster than manual loops.'
        }
      ]
    };
  }

  if (k === 'dictionary - program: count letter frequency') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Implement letter frequency counting and explain how you handle case and non-letter characters.',
          sampleAnswer: 'Normalize to a single case (prefer `casefold`) and filter letters using `isalpha()`:\n\n```python\ncounts = {}\nfor ch in text.casefold():\n    if not ch.isalpha():\n        continue\n    counts[ch] = counts.get(ch, 0) + 1\n```'
        },
        {
          prompt: 'How would you output results sorted by frequency (descending) and then letter?',
          sampleAnswer: 'Sort items with a key:\n\n```python\nfor ch, n in sorted(counts.items(), key=lambda kv: (-kv[1], kv[0])):\n    print(ch, n)\n```'
        },
        {
          prompt: 'When would you use `collections.Counter` instead of a manual dict?',
          sampleAnswer: '`Counter` is convenient when you just need counting and common operations (`most_common`, addition/subtraction). Manual dict is fine when you want full control over filtering, parsing, and custom logic.'
        }
      ]
    };
  }

  if (k === 'dictionary - program: count vowels (sorted output)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Design a vowel-counter that always outputs vowels in `a,e,i,o,u` order. Explain why this is easier than sorting dict keys alphabetically in general.',
          sampleAnswer: 'Because the required order is fixed, you can iterate a constant string `"aeiou"` and print counts in that order. You don’t depend on dict iteration order or sorting logic, and you can include zeros consistently.'
        },
        {
          prompt: 'Show an implementation that counts vowels case-insensitively and includes zeros.',
          sampleAnswer: 'Example:\n\n```python\nvowels = "aeiou"\ncounts = dict.fromkeys(vowels, 0)\nfor ch in text.casefold():\n    if ch in counts:\n        counts[ch] += 1\nfor v in vowels:\n    print(v, counts[v])\n```'
        },
        {
          prompt: 'What edge cases would you test?',
          sampleAnswer: 'All vowels present, no vowels, uppercase input, punctuation/spaces, and long input. Also test that output order is always `a,e,i,o,u` and that missing vowels appear as 0 when required.'
        }
      ]
    };
  }

  if (k === 'dictionary - program: student marks lookup (loop + get)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Implement a student marks lookup loop and explain how you distinguish “not found” from a real 0 value.',
          sampleAnswer: 'Use key membership or a sentinel default. `if name in marks: ...` works even when mark is 0. Avoid `marks.get(name) or "Not found"` because 0 is falsy and would be misclassified.'
        },
        {
          prompt: 'Show a safe implementation using `get` and a sentinel.',
          sampleAnswer: 'Example:\n\n```python\nmissing = object()\nval = marks.get(name, missing)\nif val is missing:\n    print("Not found")\nelse:\n    print(val)\n```'
        },
        {
          prompt: 'How would you make this lookup robust for user input (whitespace, case) and repeated queries?',
          sampleAnswer: 'Normalize user input with `strip()` and `casefold()`. Store keys normalized as well (or normalize at lookup time consistently). Keep the lookup in a loop until the user types `exit`.'
        }
      ]
    };
  }

  if (k === 'dictionary - dictionary comprehension') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain dictionary comprehension syntax and give two examples: one transform and one filter.',
          sampleAnswer: 'Syntax: `{k_expr: v_expr for item in iterable}` (often over `for k, v in d.items()`). Transform example: `{k: v*v for k, v in d.items()}`. Filter example: `{k: v for k, v in d.items() if v >= 10}`. The colon is what makes it a dict comprehension.'
        },
        {
          prompt: 'What happens on key collisions in a dict comprehension, and why can that be a hidden bug?',
          sampleAnswer: 'Collisions overwrite: the last produced value for a key wins. This can hide data loss if your transformation maps multiple inputs to the same key (e.g., casefolding usernames or truncating IDs). If collisions matter, you should group into lists instead of overwriting.'
        },
        {
          prompt: 'Show how to invert a dictionary (value -> key) safely when values might not be unique.',
          sampleAnswer: 'If values are unique, you can do `{v: k for k, v in d.items()}`. If values may repeat, you must group: `inv = {}; for k, v in d.items(): inv.setdefault(v, []).append(k)` so you don’t lose keys.'
        }
      ]
    };
  }

  if (k === 'dictionary - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Given two dictionaries, explain 3 different “merge” strategies and when to use each.',
          sampleAnswer: '1) Simple overwrite merge: `merged = a | b` (or `{**a, **b}`), where `b` wins on conflicts. 2) Keep-first merge: start with `merged = b.copy(); merged.update(a)` (so `a` wins). 3) Combine values (e.g., summing counts): iterate keys and add: `out[k] = a.get(k,0) + b.get(k,0)`.'
        },
        {
          prompt: 'Write a short frequency-counter solution and explain why normalization matters.',
          sampleAnswer: 'Normalize input (strip + casefold) so you count logically identical tokens together. Example: `counts[w] = counts.get(w, 0) + 1` after normalization. Without normalization, you get separate keys for `"Apple"`, `"apple"`, and `" apple "`.'
        },
        {
          prompt: 'Explain a common bug with `get(...) or default` and how you avoid it.',
          sampleAnswer: 'If a real value can be falsy (0, empty string), `or default` incorrectly treats it as missing. Prefer membership check (`if k in d`) or use a sentinel default object and compare with `is`.'
        }
      ]
    };
  }

  if (k === 'functions (overview)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what a function is, what a call stack is at a high level, and how functions help with maintainability.',
          sampleAnswer: 'A function packages logic under a name with inputs and outputs. When you call a function, Python pushes a new stack frame (locals + execution state) onto the call stack and returns to the caller when done. Functions improve maintainability by reducing duplication, making behavior testable, and clarifying intent.'
        },
        {
          prompt: 'What is the difference between a “pure” function and a function with side effects? Give examples.',
          sampleAnswer: 'A pure function depends only on inputs and returns an output without modifying external state (e.g., `def add(a,b): return a+b`). A side-effecting function changes external state or does I/O (e.g., writing a file, mutating a global, printing). Pure functions are easier to test and reason about.'
        },
        {
          prompt: 'Why is `return` generally more flexible than `print` inside functions?',
          sampleAnswer: 'Returning gives the caller control: they can print it, store it, combine it, or test it. Printing inside a function forces I/O and makes reuse/testing harder.'
        }
      ]
    };
  }

  if (k === 'functions - creating functions (def, docstring)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `def`, indentation, and the role of a docstring. How does `help()` use it?',
          sampleAnswer: '`def` defines a function object and binds it to a name. Indentation defines the function body block. A docstring is the first statement string literal in the function; it is stored in `func.__doc__` and displayed by `help(func)`, which is why docstrings are useful for interactive use and documentation.'
        },
        {
          prompt: 'Write a small function with a docstring and show how you would access the documentation programmatically.',
          sampleAnswer: 'Example:\n\n```python\ndef area_circle(r):\n    """Return area of a circle for radius r."""\n    return 3.14159 * r * r\n\nprint(area_circle.__doc__)\nhelp(area_circle)\n```'
        },
        {
          prompt: 'What docstring style do you prefer for beginners and why?',
          sampleAnswer: 'For beginners, a short summary line plus a simple Args/Returns description is enough. Overly complex formats can distract early learners; clarity matters more than strict formatting at this stage.'
        }
      ]
    };
  }

  if (k === 'functions - parameters vs arguments') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Define parameters vs arguments with an example, and explain why confusing them leads to bugs.',
          sampleAnswer: 'Parameters are names in the function signature; arguments are values passed at call time. Example: `def f(x): ...` has parameter `x`; calling `f(10)` passes argument 10. Confusing them can cause wrong explanations and also mistakes in reading code (e.g., thinking a default value is provided by the caller rather than the function definition).'
        },
        {
          prompt: 'Show how keyword arguments help prevent errors in functions with many parameters.',
          sampleAnswer: 'With many parameters, `process(user, True, 3, 10)` is unclear and easy to mis-order. `process(user=user, verbose=True, retries=3, timeout=10)` makes each argument explicit and prevents accidental swaps.'
        },
        {
          prompt: 'What is an API design guideline for functions that accept many optional parameters?',
          sampleAnswer: 'Prefer keyword arguments for optional settings, consider keyword-only parameters (using `*` in the signature), and keep parameter lists short. This makes calls readable and reduces mistakes.'
        }
      ]
    };
  }

  if (k === 'functions - returning values (and none default)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain how return values work in Python, including the implicit `None` behavior.',
          sampleAnswer: 'A function returns a value to the caller using `return`. If you reach the end without returning (or use bare `return`), Python returns `None` implicitly. This matters because callers often assume a real value and can crash later when they get `None`.'
        },
        {
          prompt: 'Show an example bug caused by forgetting to return, and how you would fix it.',
          sampleAnswer: 'Bug:\n\n```python\ndef area(r):\n    3.14 * r * r  # forgot return\n\nprint(area(2) + 1)\n```\n\nThis raises `TypeError` because `area(2)` is `None`. Fix by adding `return 3.14 * r * r`.'
        },
        {
          prompt: 'What is a best practice regarding consistent return types?',
          sampleAnswer: 'Try to return consistent types across all code paths. If sometimes you return a number and sometimes `None`, the caller must handle both. If `None` indicates failure, consider raising an exception or returning a structured result (value + status) depending on the context.'
        }
      ]
    };
  }

  if (k === 'functions - program: even or odd') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Implement `is_even(n)` and explain how you validate inputs in a beginner-friendly way.',
          sampleAnswer: 'Implementation: `return n % 2 == 0`. For user input, read a string and convert with `int(...)` inside try/except, then call the function. Validation keeps the function simple and the input-handling separate.'
        },
        {
          prompt: 'What tests would you run and why?',
          sampleAnswer: 'Test 0, a positive odd, a positive even, and a negative even. This ensures modulo behavior is correct and that edge cases like 0 are handled.'
        },
        {
          prompt: 'What is the advantage of returning a boolean rather than printing inside `is_even`?',
          sampleAnswer: 'Returning a boolean lets the caller decide how to use it (print, branch, count evens, etc.) and makes the function easy to test.'
        }
      ]
    };
  }

  if (k === 'functions - program: factorial (iterative)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Implement iterative factorial and explain your handling of 0 and negative inputs.',
          sampleAnswer: 'For `n == 0` (and `n == 1`), return 1. For negative `n`, raise `ValueError` because factorial is typically defined for non-negative integers. Iteratively multiply `2..n` into an accumulator.'
        },
        {
          prompt: 'Compare iterative factorial with recursive factorial in terms of safety and performance in Python.',
          sampleAnswer: 'Recursion is conceptually simple but can hit recursion depth limits and adds function call overhead. Iteration avoids recursion depth issues and is generally preferred for factorial in Python.'
        },
        {
          prompt: 'How would you handle extremely large `n` or performance constraints?',
          sampleAnswer: 'Python big integers can handle large factorials but the number grows extremely fast. Use `math.factorial(n)` for a well-optimized implementation, and consider whether you need the exact value or a logarithm/approximation for very large inputs.'
        }
      ]
    };
  }

  if (k === 'functions - returning multiple values') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How does Python “return multiple values” under the hood?',
          sampleAnswer: 'It returns a single tuple object. `return a, b` is tuple packing. The caller can unpack with `x, y = func()`.'
        },
        {
          prompt: 'When do you prefer returning a tuple vs returning a dictionary vs creating a small class?',
          sampleAnswer: 'Tuple is good for a small, fixed set of values with a clear order. Dict is good when values are optional or the result is naturally keyed. For many fields or when you want named attributes and type clarity, use a dataclass or namedtuple.'
        },
        {
          prompt: 'Show a safe pattern for returning a result and an error/status indicator.',
          sampleAnswer: 'One pattern is `return value, True/False`. Another is `return value` and raise exceptions for error cases. For beginners, tuple with a boolean can be easy: `return result, ok`.'
        }
      ]
    };
  }

  if (k === 'functions - argument types (positional, keyword)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain positional vs keyword arguments and the rule about their ordering in calls.',
          sampleAnswer: 'Positional arguments are matched by position; keyword arguments are matched by name. In a call, positional arguments must come first; after you use a keyword argument, all remaining arguments must be keyword arguments.'
        },
        {
          prompt: 'How do you make parameters keyword-only in a function signature, and why is that useful?',
          sampleAnswer: 'Use `*` in the signature: `def f(a, *, retry=3): ...`. This forces callers to pass `retry=` by keyword, improving readability and preventing accidental positional mis-ordering for optional settings.'
        },
        {
          prompt: 'Give an example where keyword arguments prevent a real bug.',
          sampleAnswer: 'If a function signature is `send(to, subject, body, retry, timeout)` then `send(to, subject, body, 30, 3)` could swap timeout/retry by mistake. Using `send(..., retry=3, timeout=30)` makes it unambiguous.'
        }
      ]
    };
  }

  if (k === 'functions - default arguments (and common pitfalls)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain how default arguments work in Python, including when defaults are evaluated.',
          sampleAnswer: 'Default argument expressions are evaluated once at function definition time, not each call. The default value is then reused when the caller omits that argument. This is why mutable defaults (like lists/dicts) can accumulate state across calls.'
        },
        {
          prompt: 'Demonstrate the mutable default pitfall and show the recommended pattern to fix it.',
          sampleAnswer: 'Pitfall:\n\n```python\ndef add(x, items=[]):\n    items.append(x)\n    return items\n```\n\nThe list is shared across calls. Fix with a sentinel:\n\n```python\ndef add(x, items=None):\n    if items is None:\n        items = []\n    items.append(x)\n    return items\n```'
        },
        {
          prompt: 'When is it OK to use a mutable default?',
          sampleAnswer: 'Only when you intentionally want shared state across calls (which is rare) and you document it. For most application code, avoid it; prefer `None` sentinel or explicit object state.'
        }
      ]
    };
  }

  if (k === 'functions - variable-length arguments (*args)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what `*args` captures, what type it is, and how it interacts with normal parameters.',
          sampleAnswer: '`*args` captures extra positional arguments as a tuple. Parameters before `*args` can be passed positionally or by keyword (unless made positional-only). After `*args`, parameters become keyword-only. You can loop over `args` like any tuple.'
        },
        {
          prompt: 'Show how to forward `*args` to another function and how to unpack a list into arguments.',
          sampleAnswer: 'Forwarding: `other(*args)`. Unpacking: if `nums = [1,2,3]`, then call `sum_all(*nums)` to pass them as separate positional arguments.'
        },
        {
          prompt: 'What is a common pitfall with `*args` in beginner code?',
          sampleAnswer: 'Overusing it when the function actually expects a clear fixed signature. `*args` can reduce readability if callers don’t know what to pass. Use it when you genuinely accept a variable number of positional items.'
        }
      ]
    };
  }

  if (k === 'functions - keyword-only parameters (after *)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain keyword-only parameters and show why they improve API safety.',
          sampleAnswer: 'Keyword-only parameters must be passed by name. You define them by adding `*` in the signature: `def f(a, *, timeout=5): ...`. They improve safety because optional tuning knobs can’t be passed positionally by mistake, and calls remain readable.'
        },
        {
          prompt: 'Given a function with many optional booleans/timeouts, how would you refactor the signature using keyword-only parameters?',
          sampleAnswer: 'Group required positional parameters first, then `*`, then optional keyword-only parameters. Example: `def send(to, subject, body, *, retry=3, timeout=10, dry_run=False): ...`.'
        },
        {
          prompt: 'What runtime error occurs when you pass a keyword-only parameter positionally?',
          sampleAnswer: 'Python raises `TypeError` because the function received too many positional arguments or a missing required keyword-only argument.'
        }
      ]
    };
  }

  if (k === 'functions - keyword varargs (**kwargs)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `**kwargs` and show a realistic use-case (wrapping/forwarding options).',
          sampleAnswer: '`**kwargs` captures extra keyword arguments into a dict. A realistic use-case is writing wrapper functions that accept extra options and forward them: `def wrapper(*args, **kwargs): return inner(*args, **kwargs)`.'
        },
        {
          prompt: 'How do `*args` and `**kwargs` help when building flexible APIs, and what is the readability tradeoff?',
          sampleAnswer: 'They allow forward compatibility and flexible option passing. The tradeoff is that the accepted parameters are less explicit, so documentation and validation become more important. Overuse can make code harder to understand.'
        },
        {
          prompt: 'Show how to merge keyword arguments and enforce/override a specific option.',
          sampleAnswer: 'Example:\n\n```python\nopts = {"timeout": 5, "retry": 2}\nopts["timeout"] = 10  # override\ncall(**opts)\n```\n\nOr `call(**{**opts, "timeout": 10})`.'
        }
      ]
    };
  }

  if (k === 'functions - mini case study (argument rules)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Walk through the argument binding order for a signature like `def f(a, b=2, *args, c, d=5, **kwargs)`.',
          sampleAnswer: 'Positional arguments bind to `a` and then `b` (if provided). Extra positional go into `args`. Then keyword arguments bind to named parameters like `c` and `d`. Any remaining extra keywords go into `kwargs`. `c` is required keyword-only in this signature.'
        },
        {
          prompt: 'Give examples of valid and invalid calls for that signature and explain why.',
          sampleAnswer: 'Valid: `f(1, c=10)` (uses default b). Valid: `f(1, 3, 4, 5, c=10, x=99)` where `args=(4,5)` and `kwargs={"x":99}`. Invalid: `f(1, 2, 3, 4)` because `c` is missing.'
        },
        {
          prompt: 'How do you decide whether to accept flexible arguments or keep a strict signature?',
          sampleAnswer: 'Prefer strict signatures for clarity. Use `*args/**kwargs` mainly for wrappers, adapters, or when you genuinely accept variable-length inputs. If options are known, prefer explicit keyword-only parameters.'
        }
      ]
    };
  }

  if (k === 'functions - function vs module vs library') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the relationship between a function, a module, a package, and a library.',
          sampleAnswer: 'A function is a callable unit of code. A module is a `.py` file that can define functions/classes/variables. A package is a directory of modules (usually with `__init__.py`). A library is a collection of packages/modules that provides a set of capabilities (standard library or third-party).' 
        },
        {
          prompt: 'Give an example of importing and using a standard library module vs a third-party library.',
          sampleAnswer: 'Standard library: `import math; math.sqrt(9)`. Third-party: `import requests; requests.get(url)` (after installing). Both are imported similarly; the difference is how they are distributed/installed.'
        },
        {
          prompt: 'What are the tradeoffs of `from module import name` vs `import module`?',
          sampleAnswer: '`import module` keeps the namespace explicit (`module.name`) and avoids collisions. `from module import name` can be shorter but may shadow other names and makes it less obvious where a symbol came from.'
        }
      ]
    };
  }

  if (k === 'functions - scope: global vs local') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain Python name resolution (LEGB) and give an example involving a nested function.',
          sampleAnswer: 'LEGB means Local, Enclosing, Global, Built-in. Example: an inner function can read a variable from the enclosing function scope. If you assign to that name inside the inner function, Python treats it as local unless you use `nonlocal`.'
        },
        {
          prompt: 'Why does assigning to a name inside a function change how Python treats that name throughout the function?',
          sampleAnswer: 'Because scope is determined statically by the presence of assignment in the function body. If Python sees `x = ...` anywhere in the function, it treats `x` as local everywhere in that function, which can lead to `UnboundLocalError` if you read it before assignment.'
        },
        {
          prompt: 'What are best practices to avoid scope-related bugs?',
          sampleAnswer: 'Avoid globals, pass values as parameters, return results, use descriptive names, and keep functions small. For shared state, prefer objects or closures with explicit intent rather than relying on global mutation.'
        }
      ]
    };
  }

  if (k === 'functions - global keyword (when you must modify)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what `global` changes and what it does not change.',
          sampleAnswer: '`global name` tells Python that assignments to `name` in this function refer to the module-level variable. It does not make objects “global”; it only affects binding. You can always read globals without `global`, but you need `global` to rebind them.'
        },
        {
          prompt: 'Show a minimal example of a bug without `global` and the corrected version.',
          sampleAnswer: 'Bug:\n\n```python\ncount = 0\ndef inc():\n    count += 1\n```\n\nThis raises `UnboundLocalError`. Fix:\n\n```python\ncount = 0\ndef inc():\n    global count\n    count += 1\n```'
        },
        {
          prompt: 'When would you avoid `global` and what alternative design would you use?',
          sampleAnswer: 'Avoid `global` in most application code. Prefer returning the updated value, storing state in a class instance, or passing a mutable object explicitly (like a dict) so dependencies are clear and testable.'
        }
      ]
    };
  }

  if (k === 'functions - recursion (with factorial)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain recursion, base case, and how the call stack evolves for factorial(4).',
          sampleAnswer: 'Recursion calls the same function with smaller inputs until a base case. For factorial(4): it calls factorial(3), factorial(2), factorial(1) base case returns 1, then unwinds: 2*1, 3*2, 4*6. Each call adds a stack frame, which is why deep recursion can fail.'
        },
        {
          prompt: 'Why is iterative factorial often preferred in Python, and when is recursion still a good fit?',
          sampleAnswer: 'Iterative avoids recursion limits and overhead. Recursion is still a good fit for naturally recursive structures (trees, DFS), where it can be very expressive if depth is manageable.'
        },
        {
          prompt: 'What are the two most common recursion bugs beginners make?',
          sampleAnswer: 'Missing/incorrect base case (infinite recursion) and not reducing the problem (calling with the same argument). Both lead to `RecursionError` or wrong results.'
        }
      ]
    };
  }

  if (k === 'functions - lambda (anonymous) functions') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what a lambda is, its limitations, and typical use-cases.',
          sampleAnswer: 'A lambda is an anonymous function limited to a single expression: `lambda x: x*x`. It is commonly used for short callbacks like `key=` in sorting. For complex logic, prefer `def` for readability and documentation.'
        },
        {
          prompt: 'Give an example using lambda with `sorted` and explain what the key function returns.',
          sampleAnswer: 'Example: `sorted(words, key=lambda w: (len(w), w))`. The key function returns a tuple, so sorting happens by length first, then alphabetically.'
        },
        {
          prompt: 'Describe the “late binding” pitfall with lambdas inside loops and how to fix it.',
          sampleAnswer: 'In a loop, lambdas capture the variable by reference, so they may all see the final loop value. Fix by binding a default: `funcs.append(lambda x, i=i: x+i)` so each lambda stores its own `i`.'
        }
      ]
    };
  }

  if (k === 'functions - filter(), map(), reduce() (with lambdas)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `map`/`filter` with list comprehensions in Python. When would you choose each?',
          sampleAnswer: 'List comprehensions are often the most readable and idiomatic when you want a list result. `map`/`filter` can be useful when you already have named functions (no lambdas), when you want lazy iteration (streaming), or when you are composing iterator pipelines. The key difference in Python 3 is that `map`/`filter` are lazy iterators, so you often wrap them in `list(...)` when you need a concrete list.'
        },
        {
          prompt: 'Explain `reduce` and why it is less common in Python than in some other languages. Provide an example where it is appropriate.',
          sampleAnswer: '`reduce` folds a sequence into a single value by repeatedly applying a function. In Python it is less common because many common reductions have clearer built-ins (`sum`, `min`, `max`, `any`, `all`) or library helpers. It can still be appropriate for custom folds like multiplying all numbers: `reduce(lambda acc, x: acc*x, nums, 1)` with an initializer to handle empty inputs.'
        },
        {
          prompt: 'What bugs can happen when you accidentally consume a `map`/`filter` iterator twice, and how would you prevent them?',
          sampleAnswer: 'Because they are iterators, once you iterate over them they are exhausted. A common bug is logging `list(m)` and then later expecting `m` to still have items. Prevent by materializing once (`data = list(m)`) or by recreating the iterator when needed. For streaming pipelines, keep the iterator single-pass intentionally and don’t reuse it.'
        }
      ]
    };
  }

  if (k === 'functions - functions are objects (aliasing)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what it means that functions are “first-class objects” in Python, and give three practical examples.',
          sampleAnswer: 'First-class means functions can be assigned to variables, passed as arguments, and returned from other functions. Examples: 1) callbacks like `sorted(items, key=func)`, 2) a dict dispatch table mapping strings to functions, 3) decorators and factories that return functions (closures).'
        },
        {
          prompt: 'Describe the difference between passing a function vs calling it immediately in a callback-style API (e.g., `key=` or `map`).',
          sampleAnswer: 'Passing a function means you provide the callable itself (e.g., `key=len`), so the API can call it later for each item. Calling it immediately (e.g., `key=len()`) is usually wrong because you’re passing the return value instead of a callable, leading to `TypeError` or incorrect behavior.'
        },
        {
          prompt: 'How would you design a simple plugin system using functions as objects?',
          sampleAnswer: 'Use a registry dict like `plugins[name] = handler_function`. Expose a `register(name, fn)` API, validate `callable(fn)`, and have the main program dispatch based on a name or event. This keeps the core decoupled from plugin implementations.'
        }
      ]
    };
  }

  if (k === 'functions - nested functions and returning functions') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain closures and free variables in Python. How can you inspect what a closure captured?',
          sampleAnswer: 'A closure occurs when an inner function references variables from an enclosing scope (free variables). The function keeps those bindings alive. You can inspect `fn.__closure__` and `fn.__code__.co_freevars` to see captured cells/names (mostly for debugging/education).'
        },
        {
          prompt: 'When would you use `nonlocal` vs `global`? Give a small example scenario for each.',
          sampleAnswer: 'Use `nonlocal` to rebind a variable in the nearest enclosing function scope (typical in closures like counters). Use `global` to rebind a module-level variable. Example `nonlocal`: a `make_counter()` function. Example `global`: updating a module-level flag (though it’s usually better to avoid globals).'
        },
        {
          prompt: 'How do you avoid the late-binding problem when returning lambdas/functions created in a loop?',
          sampleAnswer: 'Bind the loop variable at definition time using a default argument (`lambda x, i=i: ...`) or use `functools.partial`. This ensures each returned function has its own captured value instead of all sharing the final loop value.'
        }
      ]
    };
  }

  if (k === 'functions - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Design a small “data processing pipeline” function that takes a list of values and returns a transformed list. Which parts would you make configurable via function parameters?',
          sampleAnswer: 'I would accept a `keep` predicate and a `transform` function (callables) so callers can customize filtering and mapping. For example `process(values, keep=is_valid, transform=normalize)`. This keeps the pipeline generic and testable, and avoids hard-coding business rules.'
        },
        {
          prompt: 'A teammate used nested lambdas with `map(filter(...))` and the code is hard to read. How would you refactor it for clarity?',
          sampleAnswer: 'Replace lambdas with named functions (or local `def` helpers), or rewrite as a list comprehension. For multi-step transforms, break it into steps with clear variable names. Clarity is more important than being “functional” for its own sake in Python.'
        },
        {
          prompt: 'How would you test a function that accepts other functions as parameters?',
          sampleAnswer: 'Use small deterministic functions as test doubles (e.g., `lambda x: x+1`), and test behavior on representative inputs including edge cases. You can also verify the pipeline calls are composed correctly by checking outputs for known transformations.'
        }
      ]
    };
  }

  if (k === 'modules (overview)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain how Python’s import system finds modules. What is `sys.path` and how does it relate to the current working directory?',
          sampleAnswer: 'Python searches directories listed in `sys.path` (which includes the script’s directory, the standard library, and site-packages). The current working directory can matter depending on how you run the program, but the key is whether the module’s directory is on `sys.path`. Import errors often come from running a script from the wrong location.'
        },
        {
          prompt: 'Why can “work at import time” cause problems, and what patterns do you use to avoid it?',
          sampleAnswer: 'Import-time work can cause side effects (printing, network calls, DB connections), slow startup, and make tests flaky. I avoid it by putting logic in functions/classes and using `if __name__ == "__main__":` for script entry points. Constants and definitions are fine at import time; heavy work should be delayed.'
        },
        {
          prompt: 'What are circular imports, and how do you break them?',
          sampleAnswer: 'Circular imports happen when module A imports B and B imports A, often due to shared dependencies. Break them by refactoring shared code into a third module, moving imports inside functions where appropriate, or restructuring to remove tight coupling.'
        }
      ]
    };
  }

  if (k === 'modules - create your own module (example)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Walk through how you would structure a tiny project with a custom module and a main script. What would you name the files to avoid import conflicts?',
          sampleAnswer: 'I would keep a clear project root, put reusable code in a module file like `utils.py` (or a package), and have a `main.py` that imports it. I’d avoid naming files after standard library modules (e.g., `math.py`, `random.py`) to prevent shadowing.'
        },
        {
          prompt: 'How would you make a module both importable and runnable as a script for quick manual testing?',
          sampleAnswer: 'Put reusable functions at top-level, and add a `if __name__ == "__main__":` block that runs a small demo or calls a `main()` function. When imported, only the definitions load; when executed, the demo runs.'
        },
        {
          prompt: 'If a teammate says “it works in my IDE but fails in the terminal” for an import, what do you check first?',
          sampleAnswer: 'I check the working directory and how the script is being executed, then inspect `sys.path` to confirm the module folder is included. IDEs sometimes add the project root to `PYTHONPATH` automatically, hiding issues that appear in a plain terminal.'
        }
      ]
    };
  }

  if (k === 'modules - import and access members') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `import module` vs `from module import name` in terms of readability, collisions, and refactoring safety.',
          sampleAnswer: '`import module` is explicit (`module.name`), reduces collisions, and makes refactors easier because the origin stays clear. `from module import name` is shorter and can be fine for distinctive names, but it can shadow local names and makes it less obvious where a symbol came from.'
        },
        {
          prompt: 'A bug occurs because `math` functions are missing after `import math`. What is one likely cause and how do you diagnose it?',
          sampleAnswer: 'A likely cause is shadowing: a local file named `math.py` was imported instead of the standard library. Diagnose by printing `math.__file__` to see which file was imported, then rename the local module to avoid conflicts.'
        },
        {
          prompt: 'What strategies help keep imports clean and consistent in a larger codebase?',
          sampleAnswer: 'Use a consistent import style (often `import module`), avoid wildcard imports, group imports (standard library / third-party / local), and keep modules focused to reduce circular dependencies. Linters/formatters can enforce import ordering.'
        }
      ]
    };
  }

  if (k === 'modules - module aliasing (import ... as ...)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When is aliasing helpful and when can it hurt readability?',
          sampleAnswer: 'Aliasing is helpful for long module names and for community conventions (`numpy as np`). It can hurt readability if aliases are obscure or inconsistent, forcing readers to memorize what `m1`, `m2`, etc. mean. Prefer widely known aliases or clear short names.'
        },
        {
          prompt: 'How do you handle two modules that export the same common name without using wildcard imports?',
          sampleAnswer: 'Alias one or both modules (`import module_a as a`, `import module_b as b`) and reference `a.name` and `b.name`, or import specific members with aliases (`from module_a import func as func_a`). This keeps call sites unambiguous.'
        },
        {
          prompt: 'Does aliasing affect the module cache (`sys.modules`) or the actual module identity?',
          sampleAnswer: 'No. Aliasing only changes the local name binding. The underlying module object is the same and still cached in `sys.modules` under its real import name.'
        }
      ]
    };
  }

  if (k === 'modules - from ... import (import selected members)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'In code review, what guidelines would you set for using `from module import name`?',
          sampleAnswer: 'Allow it for distinctive, widely used names (e.g., `Counter`, `dataclass`) or when it improves clarity, but avoid it when it risks collisions or hides the symbol origin. For large modules, prefer `import module` for explicitness.'
        },
        {
          prompt: 'How can `from module import name` make refactoring harder, and what is a safer pattern?',
          sampleAnswer: 'If you import a name directly, renaming/moving it can require changing many files and it’s less obvious what module it came from. A safer pattern is `import module` and use `module.name`, which keeps references explicit and search-friendly.'
        },
        {
          prompt: 'Explain how importing a name directly can shadow other definitions in the same file.',
          sampleAnswer: 'If you `from math import sqrt` and later define your own `sqrt`, you overwrite the imported binding in that namespace. Or vice versa: importing can override a previously defined name. This can create subtle bugs, so unique names or module-qualified access helps.'
        }
      ]
    };
  }

  if (k === 'modules - importing everything (*) (why to avoid)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why is `from module import *` discouraged in production code? Give concrete failure modes.',
          sampleAnswer: 'It pollutes the namespace, makes it unclear where names came from, and can silently override existing names (including built-ins or local functions). It also makes static analysis and refactoring harder because dependencies aren’t explicit.'
        },
        {
          prompt: 'What is `__all__` and how does it interact with wildcard imports?',
          sampleAnswer: '`__all__` is an optional list of public names a module exports for `from module import *`. If defined, wildcard import uses it; otherwise, it may import many non-underscore names. Relying on this is still discouraged because it hides dependencies.'
        },
        {
          prompt: 'If you inherit a codebase that uses wildcard imports heavily, how would you refactor it safely?',
          sampleAnswer: 'Replace wildcard imports with explicit imports, one module at a time. Use search/IDE tooling to find where names come from, add explicit module qualifiers if needed, and run tests after each refactor step. This reduces collisions and makes dependencies visible.'
        }
      ]
    };
  }

  if (k === 'modules - member aliasing (from ... import x as y)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When is `from module import name as alias` a good choice, and when is `import module as alias` a better choice?',
          sampleAnswer: 'Member aliasing is good when you only need one or two distinctive members and the alias improves clarity or avoids a collision (e.g., `from math import sqrt as root`). Module aliasing is better when you use many members or want to keep the namespace explicit (e.g., `import numpy as np` then `np.array`, `np.mean`, etc.).'
        },
        {
          prompt: 'Explain name shadowing and give an example involving an imported member alias.',
          sampleAnswer: 'Shadowing happens when a later binding overwrites an earlier name in the same scope. Example: `from math import sqrt as root` then later `root = 5` overwrites the function reference; calling `root(9)` will fail. Similarly, importing can overwrite an existing variable name.'
        },
        {
          prompt: 'In a large codebase, what guidelines would you set for aliases to keep code readable?',
          sampleAnswer: 'Prefer standard community aliases (`np`, `pd`) and avoid overly clever abbreviations. Only alias when it prevents a collision or improves clarity. Keep aliases consistent across files, and avoid reusing alias names for other variables.'
        }
      ]
    };
  }

  if (k === 'modules - import caching and reloading') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what `sys.modules` is and how it impacts performance and side effects of imports.',
          sampleAnswer: '`sys.modules` is the in-memory cache of loaded modules. On first import, Python executes the module and stores the module object there. Later imports reuse the cached module, so imports are faster and module-level side effects usually only run once per process.'
        },
        {
          prompt: 'How does `importlib.reload` work, and what are two reasons reloading can be surprising?',
          sampleAnswer: '`importlib.reload(mod)` re-executes the module code in the existing module object. It can be surprising because: 1) other references (like `from mod import func`) won’t update automatically, and 2) module state may persist (objects referenced elsewhere), leading to mixed old/new behavior.'
        },
        {
          prompt: 'If you need hot-reload-like behavior in an application, what is a safer architectural approach than reloading modules at runtime?',
          sampleAnswer: 'Use a plugin boundary with explicit interfaces (e.g., subprocess restart, dependency injection, or a reloadable configuration/data layer) rather than trying to reload arbitrary Python code. In many apps the simplest safe approach is to restart the process when code changes.'
        }
      ]
    };
  }

  if (k === 'modules - discovering module members (dir, help)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do `dir()` and `help()` differ, and which would you choose when you need calling conventions?',
          sampleAnswer: '`dir()` lists attribute names available; it’s for discovery. `help()` shows documentation and signatures; it’s better when you need to know how to call something (parameters, behavior, return values).'
        },
        {
          prompt: 'A module import behaves oddly. How can you confirm which module file you actually imported?',
          sampleAnswer: 'Inspect `module.__file__` (or `module.__spec__`), and check `sys.path` ordering. Shadowing by a local file with the same name is a common cause.'
        },
        {
          prompt: 'What is a good way to find “public” members of a module without relying on `import *`?',
          sampleAnswer: 'Use `dir(module)` and filter out underscore-prefixed names, consult documentation via `help()`, and for libraries that define it, check `module.__all__` as a curated list of public exports.'
        }
      ]
    };
  }

  if (k === 'modules - special variable __name__ (main guard)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain why top-level code runs on import and how the `__main__` guard changes that behavior.',
          sampleAnswer: 'Import executes a module’s top-level statements to create the module object. The `if __name__ == "__main__":` guard ensures certain code only runs when the module is executed as the entry point, not when imported by other modules.'
        },
        {
          prompt: 'What’s the difference between running `python file.py` and `python -m package.module` in terms of imports?',
          sampleAnswer: '`python file.py` runs a file as a script and may not treat it as part of a package, which can break relative imports. `python -m package.module` runs it in package context with consistent module naming/resolution, making imports behave as they would when imported.'
        },
        {
          prompt: 'How would you structure a module to support both CLI usage and library usage cleanly?',
          sampleAnswer: 'Put logic in functions/classes, provide a `main()` that parses args/calls the logic, and use a `__main__` guard. For packages, optionally add a `__main__.py` so `python -m package` works.'
        }
      ]
    };
  }

  if (k === 'modules - working with math module (quick tour)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain common pitfalls with floating-point math and how the standard library helps mitigate them.',
          sampleAnswer: 'Floats can’t represent many decimals exactly, so results can have small rounding errors. Use `math.isclose` for comparisons, avoid direct equality for computed values, and consider `decimal.Decimal` for fixed-precision decimal needs (e.g., finance).'
        },
        {
          prompt: 'When would you use `math` vs `cmath`?',
          sampleAnswer: 'Use `math` for real-number operations. Use `cmath` when inputs/outputs may be complex (e.g., square root of a negative, complex exponentials). `math.sqrt(-1)` errors, while `cmath.sqrt(-1)` returns `1j`.'
        },
        {
          prompt: 'Describe a scenario where understanding rounding direction (`floor`, `ceil`, `trunc`) matters.',
          sampleAnswer: 'It matters for bucketing/pricing/indices and negative values. For example, converting an offset to an index: `floor` always goes to the lower bucket, while `trunc` moves toward zero, which can misclassify negative offsets.'
        }
      ]
    };
  }

  if (k === 'modules - working with random module (common functions)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the difference between pseudo-random and cryptographically secure randomness in Python.',
          sampleAnswer: '`random` is a pseudo-random generator: deterministic given a seed and not suitable for security. `secrets` uses a cryptographically secure source appropriate for tokens, passwords, and security-sensitive codes.'
        },
        {
          prompt: 'How do you make tests reproducible when randomness is involved?',
          sampleAnswer: 'Seed the RNG (`random.seed(...)`) or pass a `random.Random(seed)` instance into the code so randomness is controlled. Then assert expected outputs for a known seed.'
        },
        {
          prompt: 'What are common mistakes when using `random.shuffle` or `random.sample`?',
          sampleAnswer: '`shuffle` shuffles a list in place and returns `None` (people sometimes write `x = shuffle(lst)`). `sample` returns a new list of unique elements; for sampling with replacement you need repeated `choice` calls. Also, don’t use these for security-sensitive selection.'
        }
      ]
    };
  }

  if (k === 'packages (overview)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what a package is and what role `__init__.py` plays. Should `__init__.py` contain heavy logic?',
          sampleAnswer: 'A package is a namespace for modules, usually a directory with `__init__.py`. The `__init__.py` can define exports and initialization, but heavy work there is discouraged because it runs at import time and can cause side effects and slow imports.'
        },
        {
          prompt: 'Explain absolute vs relative imports and how they affect refactoring inside a package.',
          sampleAnswer: 'Absolute imports reference the full package path and are explicit. Relative imports use dots and can make internal refactors easier when moving package code, but they require correct package context and can confuse readers if overused. Teams often choose one style consistently.'
        },
        {
          prompt: 'What are namespace packages at a high level (no deep details required), and why might you encounter them?',
          sampleAnswer: 'Namespace packages are packages without an `__init__.py` that can span multiple directories/distributions. You might encounter them in large ecosystems where multiple distributions contribute subpackages under a shared namespace.'
        }
      ]
    };
  }

  if (k === 'packages - importing from packages (examples)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Given `mypkg/helpers.py` and `mypkg/service.py`, show a clean import strategy to avoid circular imports.',
          sampleAnswer: 'Keep modules focused and import only what you need. Prefer module-level imports where safe, but if a circular dependency occurs, refactor shared logic into a third module (e.g., `mypkg/common.py`) or move an import inside a function for a narrow dependency. Avoid wildcard imports and keep dependencies directional.'
        },
        {
          prompt: 'How can `__init__.py` be used to create a public API, and what is the tradeoff?',
          sampleAnswer: 'You can re-export selected functions/classes from submodules in `__init__.py` so users import from the top-level package. Tradeoff: it can add import-time coupling and sometimes increases import cost; it can also obscure where implementations live unless documented.'
        },
        {
          prompt: 'Why do IDEs sometimes resolve imports that fail in a terminal, and how do you fix the underlying issue?',
          sampleAnswer: 'IDEs may add the project root to `PYTHONPATH` automatically. Fix by using a proper package layout, running with `python -m ...`, and ensuring the project root is on the import path (or installing the package in your environment for development).' 
        }
      ]
    };
  }

  if (k === 'packages - subpackages and unique naming') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Describe best practices for naming modules and packages to avoid shadowing and collisions.',
          sampleAnswer: 'Avoid using names that collide with the standard library or popular third-party libraries (e.g., `random`, `math`, `requests`). Use clear, specific names and a unique top-level package name. Keep package boundaries clean and avoid deeply nested “utils” dumps that become dependency hubs.'
        },
        {
          prompt: 'You see `import random` but `random.choice` is missing. What is your debugging checklist?',
          sampleAnswer: '1) Print `random.__file__` to confirm what was imported, 2) search for local `random.py` or `random/` folder, 3) check `sys.path` order, 4) rename the conflicting local module and remove stale bytecode (`__pycache__`) if needed.'
        },
        {
          prompt: 'How do subpackages help scale code organization, and what is one anti-pattern to avoid?',
          sampleAnswer: 'Subpackages group related functionality and keep namespaces manageable (e.g., `mypkg.io`, `mypkg.models`). An anti-pattern is creating cyclic imports across many subpackages or putting everything in a single catch-all module, which defeats modularity.'
        }
      ]
    };
  }

  if (k === 'modules & packages - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Design a small package layout for a CLI tool (2–4 modules). How would you structure imports and entry points?',
          sampleAnswer: 'Example: `tool/__init__.py` for exports, `tool/core.py` for business logic, `tool/io.py` for file/network, `tool/cli.py` for argument parsing and calling `core`. Use `if __name__ == "__main__": main()` in `cli.py` and run with `python -m tool.cli`. Keep imports directional: `cli` depends on `core`, not the reverse.'
        },
        {
          prompt: 'A circular import appears after a refactor. What steps do you take to identify and fix it?',
          sampleAnswer: 'Identify the import cycle by reading tracebacks and inspecting import statements. Then break the cycle by moving shared pieces into a third module, removing top-level imports in favor of function-local imports where appropriate, or redesigning responsibilities so only one module depends on the other.'
        },
        {
          prompt: 'What are your rules of thumb for choosing between `import module` and `from module import name` in a shared codebase?',
          sampleAnswer: 'Prefer `import module` for explicitness and to reduce collisions, especially for large modules. Use `from module import name` for a small number of distinctive, stable names (often classes) where it improves readability. Avoid wildcard imports.'
        }
      ]
    };
  }

  if (k === 'oop (part 1) - overview') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain encapsulation in Python. What does Python enforce vs what is by convention?',
          sampleAnswer: 'Encapsulation is bundling data and behavior and controlling how state is accessed/modified. Python mostly relies on conventions rather than strict access control: a leading underscore indicates “internal”, and name-mangling with `__attr` reduces accidental access but doesn’t make it truly private.'
        },
        {
          prompt: 'How do you decide between using a class vs using plain functions + dictionaries for a small problem?',
          sampleAnswer: 'Use a class when you have cohesive state + behavior with invariants, multiple related operations, or you want a clear abstraction boundary. For simple data transformations or one-off scripts, functions and basic types may be simpler. Prefer the smallest structure that keeps code clear and testable.'
        },
        {
          prompt: 'What is an invariant, and where would you enforce it in an OOP design?',
          sampleAnswer: 'An invariant is a condition that should always hold true for an object’s state (e.g., balance can’t be negative). Enforce it in constructors (`__init__`), property setters, and methods that mutate state.'
        }
      ]
    };
  }

  if (k === 'oop - class, object, and reference variable') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain object identity vs equality and why this matters for mutables.',
          sampleAnswer: 'Identity (`is`) means two references point to the same object. Equality (`==`) means values are considered equal. With mutables, identity matters because mutating through one reference affects all references to that object. This is a common source of bugs when objects are shared unintentionally.'
        },
        {
          prompt: 'A bug occurs because two objects “share state unexpectedly”. What is your debugging approach?',
          sampleAnswer: 'Reduce to a minimal example, check where assignments alias objects, print `id(obj)` to confirm identity, inspect whether a shared mutable is stored at class level or passed by reference, and then fix by copying (`copy`/`deepcopy`) or by creating per-instance state in `__init__`.'
        },
        {
          prompt: 'When is shallow copy sufficient and when do you need deep copy?',
          sampleAnswer: 'Shallow copy is sufficient when contained values are immutable or sharing nested objects is acceptable. You need deep copy when nested mutables must be independent to avoid side effects propagating across copies.'
        }
      ]
    };
  }

  if (k === 'oop - defining a class (docstring + help)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What should a good class docstring contain, and how does it help maintainability?',
          sampleAnswer: 'A good class docstring describes the purpose, key attributes, invariants, and how to use the class (often a short example). It helps maintainability by making intent clear and supporting tooling (`help()`, docs generation) for future developers.'
        },
        {
          prompt: 'How would you design the public interface of a class vs its internal helpers?',
          sampleAnswer: 'Expose a small set of clear public methods/properties and keep internal helpers prefixed with `_`. Keep invariants enforced, document expected inputs/outputs, and avoid leaking implementation details. Aim for a stable API that callers can rely on.'
        },
        {
          prompt: 'In a dynamic language like Python, how do you keep class usage clear without strict typing?',
          sampleAnswer: 'Use docstrings and type hints, validate inputs where appropriate, choose descriptive names, and write tests. Type hints (PEP 484) improve readability and editor support even though enforcement is optional at runtime.'
        }
      ]
    };
  }

  if (k === 'oop - self (very important)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain method binding in Python: what does `obj.method` evaluate to, and how is `self` supplied?',
          sampleAnswer: '`obj.method` produces a bound method object that wraps the function defined on the class together with `obj`. When called, Python supplies `obj` as the first argument (`self`) automatically. This is why instance method signatures include `self`.'
        },
        {
          prompt: 'Can you call an instance method on the class directly? If yes, what must you provide?',
          sampleAnswer: 'Yes: `Class.method(instance, ...)` works because the method is just a function on the class. If you call it on the class, you must provide the instance explicitly as the first argument.'
        },
        {
          prompt: 'What code review signals suggest someone is misunderstanding `self`?',
          sampleAnswer: 'Forgetting `self` in method definitions, accessing attributes without `self.` inside instance methods, or writing methods that don’t use `self` (which might be better as `@staticmethod`/`@classmethod` or a standalone function).' 
        }
      ]
    };
  }

  if (k === 'oop - constructor __init__ (when it runs)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the lifecycle: `__new__` vs `__init__`. When would you override `__new__`?',
          sampleAnswer: '`__new__` creates the instance (returns a new object). `__init__` initializes it. You rarely override `__new__`, but it’s useful for immutable types (like `str`, `tuple`) or for controlling instance creation (singletons, caching) in advanced cases.'
        },
        {
          prompt: 'What constructor design choices improve testability and separation of concerns?',
          sampleAnswer: 'Keep `__init__` lightweight and deterministic, avoid I/O and global side effects, validate invariants, and accept dependencies via parameters (dependency injection) rather than creating them internally.'
        },
        {
          prompt: 'How do you handle optional configuration in constructors without creating many positional parameters?',
          sampleAnswer: 'Use keyword-only parameters (`*`) with defaults, or accept a config object/dataclass. This keeps calls readable and prevents misordered optional arguments.'
        }
      ]
    };
  }

  if (k === 'oop - methods vs constructors') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When do you prefer an explicit `.open()`/`.connect()` method over doing work in `__init__`?',
          sampleAnswer: 'When the work can fail, takes time, or has side effects (I/O). An explicit method makes the lifecycle clear, supports retries, and avoids objects existing in a half-initialized state if the constructor fails.'
        },
        {
          prompt: 'Explain what an alternate constructor/factory is and give an example of when it helps API design.',
          sampleAnswer: 'An alternate constructor is a `@classmethod` like `from_json` or `from_file` that creates an instance from a different representation. It helps keep `__init__` focused on invariants while offering multiple creation pathways with clear names.'
        },
        {
          prompt: 'How do you keep object creation consistent if there are multiple ways to create an instance?',
          sampleAnswer: 'Centralize invariant enforcement in `__init__` (or a shared validation method) and have factories call the main constructor. Avoid duplicating initialization logic across many places.'
        }
      ]
    };
  }

  if (k === 'oop - instance variables (what/where/how)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain how Python resolves attributes (instance vs class). Where does `obj.__dict__` fit?',
          sampleAnswer: 'Attribute lookup checks the instance dictionary (`obj.__dict__`) first, then the class and its bases. If not found, it may call `__getattr__`. `obj.__dict__` stores per-instance attributes for normal classes.'
        },
        {
          prompt: 'What are `__slots__` at a high level and what tradeoff do they introduce?',
          sampleAnswer: '`__slots__` restrict which attributes instances can have and can reduce memory by avoiding a per-instance `__dict__`. Tradeoffs: less flexibility, more complexity, and some tooling patterns change. It’s an optimization, not a default choice.'
        },
        {
          prompt: 'Describe a realistic bug caused by a shared mutable class attribute and how you would fix it.',
          sampleAnswer: 'Example: `class User: tags=[]` leads all users sharing the same tags list. Fix by making `self.tags = []` in `__init__` (per-instance), or by using an immutable default at class level.'
        }
      ]
    };
  }

  if (k === 'oop - accessing and deleting instance variables') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what `AttributeError` indicates and how you would design a class to avoid accidental missing attributes.',
          sampleAnswer: '`AttributeError` means an attribute wasn’t found during lookup. Avoid it by initializing all expected attributes in `__init__`, using clear defaults (like `None`), and using properties for controlled access where necessary.'
        },
        {
          prompt: 'When is deleting an attribute (`del obj.attr`) appropriate vs setting it to `None`?',
          sampleAnswer: 'Deleting removes the binding so attribute lookup may fall back to a class attribute or raise `AttributeError`. Setting to `None` preserves the attribute but marks “no value”. Use delete for caches or when you intentionally want fallback/absence; use `None` when the attribute should exist but can be empty.'
        },
        {
          prompt: 'How do class attributes interact with deleted instance attributes during lookup?',
          sampleAnswer: 'If an instance attribute is deleted, Python will look for the attribute on the class (and base classes). This can cause “value reappears” behavior if a class attribute of the same name exists.'
        }
      ]
    };
  }

  if (k === 'oop - static (class) variables') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the difference between class variables, instance variables, `@staticmethod`, and `@classmethod`.',
          sampleAnswer: 'Class variables are attributes on the class shared by instances. Instance variables are attributes on each instance. `@staticmethod` is a function stored on the class with no automatic `self`/`cls`. `@classmethod` receives the class as `cls` and is often used for factories or class-level behavior.'
        },
        {
          prompt: 'What is the “instance attribute shadows class attribute” rule and why is it important?',
          sampleAnswer: 'If an instance has an attribute with the same name as a class attribute, the instance attribute is found first and hides the class attribute for that instance. This is important because accidental assignment can create per-instance divergence when you intended a shared value.'
        },
        {
          prompt: 'How would you implement a safe shared counter of instances created?',
          sampleAnswer: 'Use a class variable and update it on the class in `__init__` (e.g., `type(self).count += 1`). Avoid `self.count += 1` which shadows. Optionally protect updates if concurrency matters.'
        }
      ]
    };
  }

  if (k === 'oop - modifying static variables (and shadowing pitfall)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain with an example why `self.x += 1` does not modify the class variable `x` when `x` is an int.',
          sampleAnswer: 'Because `self.x` first reads the class attribute, computes a new int, then assigns to `self.x`, creating an instance attribute. The class attribute remains unchanged. This is shadowing, and it’s especially common with immutable types like ints/strings.'
        },
        {
          prompt: 'How can you intentionally modify a class variable from an instance method in an inheritance-friendly way?',
          sampleAnswer: 'Use `type(self).x = ...` or `type(self).x += 1` so subclasses update their own class variable rather than hard-coding the base class name.'
        },
        {
          prompt: 'If the class variable is a mutable object (like a list), does `self.shared.append(...)` shadow it? Explain.',
          sampleAnswer: 'No. Mutating the object via `append` changes the shared object in place, so all instances see it. Shadowing happens on assignment to the name (`self.shared = ...`), not mutation of the referenced object.'
        }
      ]
    };
  }

  if (k === 'oop - local variables (method-level)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Describe a bug you’ve seen (or could imagine) caused by confusing a local variable with an instance attribute.',
          sampleAnswer: 'Example: in `def set_name(self, name): name = name` the assignment only updates a local variable, so other methods still see no `self.name` and later you get `AttributeError`. Fix: store state on the instance using `self.name = name`, and initialize expected attributes in `__init__`.'
        },
        {
          prompt: 'Why does Python raise `UnboundLocalError` in some functions that “try to use” a name from an outer scope?',
          sampleAnswer: 'Because Python decides at compile time that a name is local if it is assigned anywhere in the function body. Then reads of that name before assignment are treated as reads of an uninitialized local, causing `UnboundLocalError`. The fix is to use the correct scope (`self.x`, `global`, or `nonlocal`) depending on intent.'
        },
        {
          prompt: 'How would you write a quick unit test to catch “state not persisted” issues in a class method?',
          sampleAnswer: 'Create an instance, call the method that should mutate state, then assert the attribute changed and remains changed on subsequent calls. Example: call `deposit(100)` then assert `account.balance == 100`, call `deposit(50)` then assert `account.balance == 150`.'
        }
      ]
    };
  }

  if (k === 'oop - instance methods') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what a “bound method” is in Python, and why `obj.method` is not the same as `Class.method`.',
          sampleAnswer: '`Class.method` is the function defined on the class. `obj.method` is a bound method that bundles the function together with `obj` as `__self__`. When called, it automatically supplies `obj` as the first argument (`self`).'
        },
        {
          prompt: 'When would you choose an instance method over a `@staticmethod` or free function?',
          sampleAnswer: 'When the behavior depends on instance state (attributes) or must maintain object invariants. If the logic doesn’t use instance state, a staticmethod or module-level function is usually clearer.'
        },
        {
          prompt: 'What code smells suggest that instance methods are being misused in a codebase?',
          sampleAnswer: 'Methods that never touch `self`, heavy I/O in lots of small methods with hidden side effects, or methods that mutate many unrelated attributes (violating cohesion). These often indicate responsibilities should be split or moved into helper functions/classes.'
        }
      ]
    };
  }

  if (k === 'oop - getters and setters (and a pythonic note)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why do Python developers often avoid explicit `get_x()`/`set_x()` methods?',
          sampleAnswer: 'Because Python favors simple attribute access for readability. If you later need validation/computation, properties let you keep the same attribute-style API without changing callers.'
        },
        {
          prompt: 'Show how you’d enforce an invariant (e.g., non-negative) using `@property` without breaking the public API.',
          sampleAnswer: 'Expose `obj.radius` as the public attribute via a property, but store data in `_radius`. In the setter, validate and assign `_radius`. This allows existing code that reads/writes `radius` to keep working.'
        },
        {
          prompt: 'What is a common bug when writing property setters, and how do you avoid it?',
          sampleAnswer: 'Accidentally assigning to the property name inside its own setter (e.g., `self.radius = value`), causing infinite recursion. Avoid it by using a separate backing attribute (e.g., `self._radius`).'
        }
      ]
    };
  }

  if (k === 'oop - class methods (@classmethod)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Give an example of an API that benefits from a `@classmethod` alternate constructor.',
          sampleAnswer: 'Parsing: `User.from_json(data)` or `Date.from_iso("2026-02-18")`. The classmethod can validate input, then call `cls(...)` to construct an instance while keeping `__init__` focused on invariants.'
        },
        {
          prompt: 'Why is `cls(...)` often preferred over hard-coding the class name inside a classmethod?',
          sampleAnswer: 'Using `cls` supports inheritance: if a subclass calls the classmethod, `cls` is the subclass, so it constructs the right type without overriding the factory.'
        },
        {
          prompt: 'How do `@classmethod` and class variables commonly work together?',
          sampleAnswer: 'Classmethods often read/update class-level configuration or registries (`cls.default_timeout`, `cls.registry.append(...)`) in a way that’s shared across instances and respects subclassing.'
        }
      ]
    };
  }

  if (k === 'oop - static methods (@staticmethod)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What problem does `@staticmethod` solve, and what problem does it NOT solve?',
          sampleAnswer: 'It solves organization/namespacing: you can place a helper inside a class definition. It does not provide access to `self` or `cls`, and it doesn’t make code “more OOP” by itself.'
        },
        {
          prompt: 'How do you decide between a `@staticmethod` and a free function in a module?',
          sampleAnswer: 'If the helper is tightly coupled to the class concept and is mostly used alongside it, staticmethod can improve discoverability. If it’s general-purpose, a module-level function is simpler and more reusable.'
        },
        {
          prompt: 'How would you test a staticmethod compared to an instance method?',
          sampleAnswer: 'Staticmethods are tested like pure functions: call `Class.helper(args)` and assert outputs. Instance methods require constructing an instance and potentially setting up state.'
        }
      ]
    };
  }

  if (k === 'oop - mini program: bankaccount (deposit/withdraw)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Sketch a `BankAccount` API. What methods and validations would you include?',
          sampleAnswer: 'Typical: `deposit(amount)`, `withdraw(amount)`, `balance` (property), maybe `transfer_to(other, amount)`. Validate `amount > 0`, enforce non-negative balance (or explicit overdraft rules), and raise clear exceptions on invalid operations.'
        },
        {
          prompt: 'What data type would you use for `balance` and why?',
          sampleAnswer: 'Prefer `decimal.Decimal` (with controlled rounding/quantization) or integer cents to avoid floating-point rounding issues. `float` can produce subtle errors like 0.1 + 0.2 != 0.3.'
        },
        {
          prompt: 'How do you ensure `withdraw()` is “atomic” and doesn’t partially update state on error?',
          sampleAnswer: 'Validate first (amount, sufficient funds) and only mutate `balance` after all checks pass. If you maintain transaction logs, append the log entry only after success as well.'
        }
      ]
    };
  }

  if (k === 'oop (part 1) - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain when you would use an instance method vs `@classmethod` vs `@staticmethod` in a real codebase.',
          sampleAnswer: 'Instance method: depends on per-instance state/invariants. Classmethod: alternate constructors or class-level behavior/config/registries that should work with subclasses via `cls`. Staticmethod: helper logic that conceptually belongs with the class but doesn’t need `self`/`cls`.'
        },
        {
          prompt: 'How do properties help you evolve a class API over time?',
          sampleAnswer: 'You can start with a plain attribute (simple data container). If you later need validation, lazy computation, or deprecation warnings, you can convert it to a property with the same name so callers don’t change.'
        },
        {
          prompt: 'Describe a debugging approach for “attribute value is not what I expect” issues in OOP code.',
          sampleAnswer: 'Check whether the attribute is instance vs class (`obj.__dict__` vs `Class.__dict__`), look for shadowing from assignments, print both `obj.attr` and `type(obj).attr`, and search for places mutating the attribute. Tracebacks and unit tests help reproduce.'
        }
      ]
    };
  }

  if (k === 'exception handling - overview (syntax vs runtime)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why can’t you “handle” a syntax error with `try/except` the same way you handle runtime exceptions?',
          sampleAnswer: 'Because the program must parse successfully before it can execute. A syntax error prevents the interpreter from creating the code object, so no runtime `try/except` block can run.'
        },
        {
          prompt: 'What are good reasons to catch exceptions instead of letting them crash the program?',
          sampleAnswer: 'To recover (retry or ask again), to provide user-friendly errors, to clean up resources reliably, and to keep long-running services resilient.'
        },
        {
          prompt: 'What’s the risk of overusing exceptions for control flow?',
          sampleAnswer: 'It can hide real bugs, make code harder to understand, and incur overhead. Exceptions are best for exceptional/error paths, not normal branching logic.'
        }
      ]
    };
  }

  if (k === 'exception handling - what is an exception? (and why handle it)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When should you handle an exception locally vs letting it propagate upward?',
          sampleAnswer: 'Handle it locally when you can recover or add meaningful context. Let it propagate when you can’t recover meaningfully; the caller may handle it at a higher level (e.g., request boundary) or crash with a useful traceback.'
        },
        {
          prompt: 'Why is catching broad exceptions like `Exception` sometimes still appropriate?',
          sampleAnswer: 'At a boundary (CLI entrypoint, web request handler, background job runner) to log errors and convert them into a consistent user/HTTP response, while still preferring specific exceptions in inner layers.'
        },
        {
          prompt: 'What should you include when raising your own exceptions to make debugging easier?',
          sampleAnswer: 'A specific exception type, a clear message including key values/inputs, and optional chaining using `raise NewError(...) from e` when wrapping lower-level exceptions.'
        }
      ]
    };
  }

  if (k === 'exception handling - default exception handling (tracebacks)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Walk through how you read a traceback to find the root cause quickly.',
          sampleAnswer: 'Start from the last line to see the exception type/message. Then look at the last stack frame in your code (not library code) to find the exact line that raised. Read upward to understand how data flowed into that line.'
        },
        {
          prompt: 'How do you add context when re-raising an exception without losing the original cause?',
          sampleAnswer: 'Use exception chaining: `raise HigherLevelError("...") from e`. This keeps the original traceback as the cause while adding domain context.'
        },
        {
          prompt: 'What’s a good practice for logging exceptions in production services?',
          sampleAnswer: 'Log the full traceback (not just the message), include request/job identifiers, and avoid leaking secrets. In Python, capture stack traces using logging with `exc_info=True`.'
        }
      ]
    };
  }

  if (k === 'exception handling - exception hierarchy (baseexception vs exception)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain why a blanket `except:` is usually a mistake, and what you do instead.',
          sampleAnswer: 'Bare `except:` catches `BaseException` including `KeyboardInterrupt` and `SystemExit`, which can make programs hard to stop and can hide termination. Prefer catching specific exceptions. At a boundary, use `except Exception as e:` to log/return a friendly error while letting Ctrl+C and exits propagate.'
        },
        {
          prompt: 'How do you design an exception hierarchy for a small library so callers can handle errors cleanly?',
          sampleAnswer: 'Define a base library exception like `class MyLibError(Exception): ...` and have specific errors inherit from it (`ParseError`, `ConfigError`). This lets callers catch `MyLibError` broadly while still distinguishing cases when needed.'
        },
        {
          prompt: 'When might you intentionally let an exception propagate without catching it?',
          sampleAnswer: 'When you cannot recover meaningfully, or when a higher-level layer has better context to handle it (e.g., a request boundary). Letting it propagate keeps the traceback intact for debugging.'
        }
      ]
    };
  }

  if (k === 'exception handling - try/except basics (risky vs handling code)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What are your rules of thumb for writing `try/except` blocks that stay maintainable?',
          sampleAnswer: 'Keep `try` blocks small (only the lines that can fail), catch the most specific exceptions you expect, avoid silent passes, and either recover, add context + re-raise, or convert to a domain-specific error.'
        },
        {
          prompt: 'Explain exception chaining (`raise ... from e`). When do you use it?',
          sampleAnswer: 'Use it when you catch a low-level exception but want to raise a higher-level domain exception while preserving the root cause. It keeps the original exception as the cause in the traceback.'
        },
        {
          prompt: 'How do you test exception-handling code?',
          sampleAnswer: 'Write tests that trigger each expected failure mode and assert the exception type/message. For boundaries, assert that you log or return the correct error code/response and that state is not partially mutated.'
        }
      ]
    };
  }

  if (k === 'exception handling - control flow rules in try/except') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain what “stack unwinding” means when an exception is raised.',
          sampleAnswer: 'When an exception is raised, Python stops normal execution and walks back up the call stack looking for a matching handler. Each frame is popped until an `except` matches or the program terminates with a traceback.'
        },
        {
          prompt: 'How do you prevent a handler from catching exceptions that belong to the “success path” work?',
          sampleAnswer: 'Use `else` to separate success-path code from the risky code, and keep the `try` minimal. This prevents unrelated bugs from being treated as expected failures.'
        },
        {
          prompt: 'What’s a sign in code review that `try/except` is being used to hide bugs?',
          sampleAnswer: '`except Exception: pass` or broad catches with no logging, or handlers that continue with corrupted/unknown state. Good handlers log, recover, or fail fast with a clear error.'
        }
      ]
    };
  }

  if (k === 'exception handling - printing exception information (as e)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you log an exception with a full traceback in Python production code?',
          sampleAnswer: 'Use the logging module with `exc_info=True` (or `logging.exception(...)` inside an except block). This records the full traceback while keeping logs structured.'
        },
        {
          prompt: 'When is it appropriate to show `str(e)` to end users, and when is it not?',
          sampleAnswer: 'Show a sanitized, user-friendly message for expected errors (bad input, missing file). Avoid showing raw exception messages for internal errors because they can leak implementation details or secrets; log the details and show a generic message.'
        },
        {
          prompt: 'How would you capture additional context (like the input value) when reporting an exception?',
          sampleAnswer: 'Add context to logs (structured fields) and/or raise a higher-level exception with a message including key values, using exception chaining to preserve the root cause.'
        }
      ]
    };
  }

  if (k === 'exception handling - multiple except blocks (and ordering)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why does `except Exception:` belong last when you have multiple handlers?',
          sampleAnswer: 'Because it would match most exceptions and prevent more specific handlers from running. Order handlers from specific subclasses to general superclasses.'
        },
        {
          prompt: 'How do you decide whether to split exceptions into multiple except blocks or combine them?',
          sampleAnswer: 'Split when recovery or messaging differs by type; combine (tuple) when the handling is identical. Clarity is the goal, not minimizing lines.'
        },
        {
          prompt: 'Give a real example where exception ordering changes behavior.',
          sampleAnswer: 'If you put `except OSError:` before `except FileNotFoundError:`, you’ll never reach the file-not-found handler because `FileNotFoundError` is a subclass of `OSError`. The specific case must come first.'
        }
      ]
    };
  }

  if (k === 'exception handling - one except for many exceptions') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the tradeoffs of catching `(TypeError, ValueError)` in one block vs two blocks.',
          sampleAnswer: 'One block is concise if handling is identical. Two blocks are clearer if you want different messages, different recovery, or different tests. Over-combining can hide intent.'
        },
        {
          prompt: 'How can you keep tuple-catching readable as it grows?',
          sampleAnswer: 'Prefer small tuples and keep them near the code that can raise them. If it becomes large, consider catching a common base class (only if appropriate) or refactoring code into smaller functions with targeted handlers.'
        },
        {
          prompt: 'What should you avoid when catching multiple exceptions?',
          sampleAnswer: 'Avoid catching unrelated exceptions just because “it works.” Different exceptions often need different recovery. Also avoid catching too broadly and then continuing silently.'
        }
      ]
    };
  }

  if (k === 'exception handling - default except block (use carefully)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When is a broad `except Exception` acceptable, and what must it do?',
          sampleAnswer: 'At a boundary (CLI main, request handler, worker loop) to ensure consistent logging and user-visible errors. It must log with traceback, avoid swallowing termination signals, and either re-raise or return a controlled failure result.'
        },
        {
          prompt: 'How do you ensure a broad handler doesn’t hide repeated failures in a loop?',
          sampleAnswer: 'Log each failure with context, consider limiting retries, and fail fast after a threshold. Otherwise you can create infinite loops that spam logs while doing no useful work.'
        },
        {
          prompt: 'What’s a safer alternative to a broad catch when you’re handling user input?',
          sampleAnswer: 'Validate input explicitly and catch only the expected parsing/validation exceptions (`ValueError`, `TypeError`). Unexpected exceptions should propagate so you discover bugs early.'
        }
      ]
    };
  }

  if (k === 'exception handling - finally block (cleanup code)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `finally` with `with` (context managers). When do you prefer each?',
          sampleAnswer: 'Prefer `with` for resource management (files, locks) because it is concise and reliable. Use `finally` for cleanup that spans multiple operations or when you can’t easily wrap the lifecycle in a single context manager.'
        },
        {
          prompt: 'What subtle bug can happen if someone returns from inside a `finally`?',
          sampleAnswer: 'It can suppress exceptions and override returns, making failures disappear and behavior hard to reason about. In code review, returns in `finally` are a strong red flag.'
        },
        {
          prompt: 'How do you ensure cleanup runs even if an exception occurs during cleanup itself?',
          sampleAnswer: 'Keep cleanup simple and defensive (check for None, ignore close errors if safe), and if cleanup errors matter, log them and consider chaining. Sometimes nested try inside finally is justified.'
        }
      ]
    };
  }

  if (k === 'exception handling - try/except/else/finally') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why does `else` exist on a `try` statement? What design problem does it solve?',
          sampleAnswer: '`else` prevents your handler from catching exceptions from follow-up code that should not be considered part of the risky operation. It keeps exception handling precise and reduces accidental masking of bugs.'
        },
        {
          prompt: 'Show a real-world example where `else` prevents a bug from being misclassified as an I/O error.',
          sampleAnswer: 'Example: put only file open/read in `try`, and parse JSON in `else`. If JSON parsing fails, it raises `JSONDecodeError` and won’t be caught by an `except OSError`, avoiding an incorrect “file read failed” message.'
        },
        {
          prompt: 'How would you structure error handling for a function that does I/O then validation then computation?',
          sampleAnswer: 'Catch I/O exceptions around I/O only, validate inputs explicitly (raising `ValueError`), and let unexpected computation errors bubble up or be handled at a boundary. Use `else` for success-path transitions and `finally` for cleanup.'
        }
      ]
    };
  }

  if (k === 'exception handling - nested try/except/finally (when useful)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s a good rule of thumb for nested exception handling before it becomes “spaghetti” code?',
          sampleAnswer: 'If nesting exceeds 1–2 levels, it’s usually time to extract helper functions or use context managers. Each try level should have a distinct purpose (per-item recovery vs outer cleanup).'
        },
        {
          prompt: 'Give an example of nested error handling that is legitimately helpful in data processing.',
          sampleAnswer: 'Outer try/finally manages a resource (temp dir, DB connection). Inner try/except handles per-record parsing errors by skipping or recording failures, while continuing the batch.'
        },
        {
          prompt: 'How do you ensure nested handlers don’t accidentally swallow exceptions that should stop the program?',
          sampleAnswer: 'Catch only specific exceptions you expect in the inner handler, and re-raise unexpected exceptions. Avoid bare catches; log with traceback at a boundary.'
        }
      ]
    };
  }

  if (k === 'exception handling - types: predefined vs user-defined') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When would you create a user-defined exception instead of using a built-in one like `ValueError`?',
          sampleAnswer: 'Create a user-defined exception when you want a domain-specific signal that callers can catch precisely (e.g., `PaymentDeclinedError`). Use built-ins for generic programming errors (bad types, bad values) unless your domain benefits from a dedicated type.'
        },
        {
          prompt: 'How do you design exceptions so they are both user-friendly and developer-friendly?',
          sampleAnswer: 'Use clear messages for humans, store structured context as attributes (IDs, paths), and avoid requiring callers to parse message strings. Keep types stable so catching is reliable.'
        },
        {
          prompt: 'What are the risks of relying on exception message text for control flow?',
          sampleAnswer: 'Messages can change, be localized, or differ by Python version/library. Types are the correct mechanism for control flow; use message text for reporting, not branching.'
        }
      ]
    };
  }

  if (k === 'exception handling - custom exceptions: define and raise') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Show how you’d define a custom exception class that includes extra attributes and still has a good string representation.',
          sampleAnswer: 'Define the class inheriting from `Exception`, call `super().__init__(message)` for the message, and store extra attributes (like `path`, `code`). Then `str(e)` shows the message while attributes carry structured context.'
        },
        {
          prompt: 'Explain exception chaining and why it matters in layered code (I/O layer → domain layer).',
          sampleAnswer: 'In layered code, you often catch a low-level exception (e.g., `OSError`) and raise a domain exception (e.g., `ConfigError`). Using `raise ConfigError(...) from e` preserves the original cause so debugging shows both the domain context and the real root failure.'
        },
        {
          prompt: 'What’s a good practice for documenting exceptions in a public API?',
          sampleAnswer: 'Document which exception types can be raised and under what conditions (docstrings/README). Provide a base exception type for the library so callers can catch all your errors consistently.'
        }
      ]
    };
  }

  if (k === 'exception handling - mini program: safe division utility') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Design `safe_divide(a, b)` for a library. Would you return a default value, return a tuple, or raise? Why?',
          sampleAnswer: 'For a library, raising is often better so failures aren’t silently ignored. If the domain wants a fallback, returning a sentinel (like `None`) or a result/error tuple can be acceptable, but it must be documented clearly so callers don’t mistake failures for valid zeros.'
        },
        {
          prompt: 'How do you balance “robustness” with “hiding errors” when you catch exceptions?',
          sampleAnswer: 'Catch only expected failures you can handle. For unexpected errors, log and re-raise. Robustness means controlled failure and clear errors, not silently continuing with incorrect values.'
        },
        {
          prompt: 'What test cases would you write for a safe division helper?',
          sampleAnswer: 'Normal division (`6/2`), division by zero (`6/0`), negative numbers, float inputs, and invalid types (strings/None). Assert both return values and which exceptions propagate.'
        }
      ]
    };
  }

  if (k === 'exception handling - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'If you had to set one team guideline about exceptions for beginners, what would it be?',
          sampleAnswer: 'Catch specific exceptions, keep `try` blocks small, never use `except: pass`, and don’t swallow `KeyboardInterrupt`/`SystemExit`. If you can’t recover, add context and re-raise.'
        },
        {
          prompt: 'How do you decide where to handle exceptions in a multi-layer program (UI, service, DB)?',
          sampleAnswer: 'Handle exceptions where you can meaningfully recover. Lower layers should raise specific errors; higher layers (boundaries) translate them into user-visible responses and logging. Avoid mixing UI concerns into low-level code.'
        },
        {
          prompt: 'What’s the most common anti-pattern you see with exception handling and what’s the fix?',
          sampleAnswer: 'Overly broad catches that hide bugs. Fix by narrowing exception types, adding logging, and using `else`/`finally` or context managers for clean structure.'
        }
      ]
    };
  }

  if (k === 'decorator functions - overview (why decorators exist)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What kinds of problems are decorators good for, and what kinds are they bad for?',
          sampleAnswer: 'Good: cross-cutting concerns like logging, timing, caching, auth, validation, retries. Bad: hiding complex control flow or business logic; if the decorator makes behavior non-obvious, a normal function call/composition may be clearer.'
        },
        {
          prompt: 'How can decorators make debugging harder, and how do you mitigate that?',
          sampleAnswer: 'They can obscure call stacks and change function identity/metadata. Mitigate by keeping decorators simple, documenting behavior, and using tooling patterns like preserving metadata (commonly via `functools.wraps`).'
        },
        {
          prompt: 'Explain in your own words what `@dec` does without using jargon.',
          sampleAnswer: 'It takes the function you wrote and passes it into another function (`dec`), then replaces your original name with the wrapped version that `dec` returns.'
        }
      ]
    };
  }

  if (k === 'decorator functions - functions are objects (first-class)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What does it mean that Python has “first-class functions”, and why is that essential for decorators?',
          sampleAnswer: 'It means functions can be treated like data: stored, passed around, and returned. Decorators rely on this because they accept a function object and return a new function object.'
        },
        {
          prompt: 'What is a “callable” in Python besides a function?',
          sampleAnswer: 'A class instance with `__call__`, classes themselves (calling constructs an instance), and bound methods are all callables. You can test with `callable(x)`.'
        },
        {
          prompt: 'Give a real example of passing a function object to customize behavior.',
          sampleAnswer: 'Sorting with `key=...` (e.g., `sorted(users, key=lambda u: u.id)`), callbacks in event handlers, or injecting a dependency function for testability.'
        }
      ]
    };
  }

  if (k === 'decorator functions - build a simple decorator (single parameter)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Walk through the execution: when you write `@dec` above `def f(...):`, what runs immediately and what runs later?',
          sampleAnswer: 'Immediately: the `def` creates `f`, then Python calls `dec(f)` and assigns the returned wrapper back to the name `f`. Later: when you call `f(...)`, you are calling the wrapper, which then calls the original function it closed over.'
        },
        {
          prompt: 'What are common beginner mistakes when writing the first decorator?',
          sampleAnswer: 'Forgetting to return the wrapper, forgetting to return the underlying result, hard-coding a single argument shape, or calling the function during decoration instead of returning a callable.'
        },
        {
          prompt: 'How do you test that a decorator actually wraps behavior (not just the function result)?',
          sampleAnswer: 'Write tests that assert pre/post behavior (e.g., log calls, validate inputs), and ensure the original function is still executed and its return value is preserved.'
        }
      ]
    };
  }

  if (k === 'decorator functions - using a decorator with and without @syntax') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why might you apply a decorator manually (without `@`) in real code?',
          sampleAnswer: 'To decorate conditionally (based on config), to wrap a function dynamically, or to make the decoration step explicit for clarity during debugging.'
        },
        {
          prompt: 'Where can decorators introduce surprising side effects at import time?',
          sampleAnswer: 'If the decorator performs work while being applied (e.g., registering routes, validating config, printing/logging), that happens at import/definition time. This can cause unexpected startup behavior.'
        },
        {
          prompt: 'How would you explain “definition time” decoration to someone who thinks decorators run on each call?',
          sampleAnswer: 'The wrapping happens once when the function is created; after that, every call goes through the wrapper. It’s like replacing the function with a new function one time, not re-wrapping every call.'
        }
      ]
    };
  }

  if (k === "decorator functions - decorators + return values (don't lose results)") {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you ensure a decorator preserves semantics (return values + exceptions)?',
          sampleAnswer: 'Always return the underlying result, forward args/kwargs correctly, and don’t catch exceptions unless the decorator’s explicit purpose is to handle them. A decorator should be transparent unless intentionally changing behavior.'
        },
        {
          prompt: 'Why is it risky for a decorator to convert exceptions into default return values?',
          sampleAnswer: 'It can hide real failures and make downstream logic operate on incorrect values. If you do it, it must be a clearly named decorator and documented so callers understand the contract.'
        },
        {
          prompt: 'What small improvement helps preserve function identity when wrapping (name/docstring), and why does it matter?',
          sampleAnswer: 'Preserve metadata (commonly with `functools.wraps`). It improves debugging, logging, help/doc output, and tools that rely on `__name__`/`__doc__`.'
        }
      ]
    };
  }

  if (k === 'decorator functions - practical: safe division (avoid crash)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Should a “safe division” decorator return `None`, return a default number, or raise? What drives the choice?',
          sampleAnswer: 'It depends on the contract. Returning `None` (or a result/error tuple) makes failure explicit without throwing; raising is often better for libraries where silent failures are dangerous. The key is that callers must be forced/encouraged to handle failure correctly.'
        },
        {
          prompt: 'How would you ensure this decorator doesn’t hide unrelated bugs (like `TypeError`)?',
          sampleAnswer: 'Catch only `ZeroDivisionError` (and maybe explicitly validated domain errors), and let other exceptions propagate. Keep the `try` block tight around the wrapped call.'
        },
        {
          prompt: 'What tests would you write to prove the decorator preserves correct results and doesn’t swallow exceptions?',
          sampleAnswer: 'Test normal division returns the real value, division by zero returns the chosen fallback, and other exceptions (e.g., passing a string) still raise. Also test that it works with different signatures if it uses `*args/**kwargs`.'
        }
      ]
    };
  }

  if (k === 'decorator functions - decorator chaining (order matters)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain the equivalence between stacked decorators and nested function calls.',
          sampleAnswer: 'Stacked decorators translate to nested calls: `@a` on top of `@b` means `f = a(b(f))`. It’s applied at definition time; at call time the outer wrapper runs first.'
        },
        {
          prompt: 'Describe a real scenario where decorator order changes behavior significantly.',
          sampleAnswer: 'Auth + caching: if caching runs before auth, you might cache unauthorized results or leak data. Another example is retries + logging/timing: you may want timing to include retries or not, depending on your goal.'
        },
        {
          prompt: 'How do you debug stacked decorators when behavior is surprising?',
          sampleAnswer: 'Expand the `@` syntax mentally to `f = a(b(f))`, inspect each wrapper, add targeted logging, and use `functools.wraps` so tracebacks and `__name__` help identify the original function.'
        }
      ]
    };
  }

  if (k === 'decorator functions - preserving function metadata (functools.wraps)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What breaks (or becomes confusing) when you don’t use `functools.wraps`?',
          sampleAnswer: 'The wrapper hides the original function’s name/docstring, making logs, tracebacks, docs, and debugging tools less informative. Some frameworks also rely on attributes/signatures that can be lost.'
        },
        {
          prompt: 'Where exactly do you apply `@wraps`, and what do you pass to it?',
          sampleAnswer: 'Apply `@wraps(func)` directly above the inner wrapper function, passing the original function object you’re wrapping.'
        },
        {
          prompt: 'If someone says “wraps is optional”, when is it actually worth insisting on it?',
          sampleAnswer: 'Almost always in production: it’s a tiny change that pays off in debugging/observability. The only times you might skip it are quick scripts or teaching minimal mechanics first.'
        }
      ]
    };
  }

  if (k === 'decorator functions - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you explain “decorators are just functions” to a learner, using one concrete example?',
          sampleAnswer: 'Show `f = dec(f)` and explain it replaces the function name with a wrapped function. The wrapper can run code before/after calling the original.'
        },
        {
          prompt: 'What guidelines would you set for a team to keep decorators readable?',
          sampleAnswer: 'Keep decorators small and single-purpose, document the contract (what it changes), preserve metadata with `wraps`, avoid surprising side effects at import time, and don’t stack many decorators unless each is simple.'
        },
        {
          prompt: 'How do you decide between a decorator and explicit composition (calling a helper around a function)?',
          sampleAnswer: 'If it’s a cross-cutting concern applied consistently across many functions, decorators fit. If it’s business logic or makes behavior hard to see, explicit calls/composition is clearer.'
        }
      ]
    };
  }

  if (k === 'generator functions - overview (yield + lazy sequences)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When would you choose a generator over returning a list?',
          sampleAnswer: 'When the data is large, streaming, or potentially infinite; when you want to start producing results early; or when you want to reduce peak memory. Lists are fine when you need random access or multiple passes.'
        },
        {
          prompt: 'What’s the relationship between generators and the iterator protocol?',
          sampleAnswer: 'A generator is an iterator: it implements `__iter__` and `__next__`, and signals completion with `StopIteration`. That’s why it works with `for`, `sum`, `list`, etc.'
        },
        {
          prompt: 'What is a practical pitfall of generators in real code?',
          sampleAnswer: 'They can be accidentally consumed once and then “empty” on a second pass. You must be careful when passing generators to multiple consumers or when you need to iterate more than once.'
        }
      ]
    };
  }

  if (k === 'generator functions - your first generator (next + stopiteration)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you explain `StopIteration` to someone who only knows `for` loops?',
          sampleAnswer: 'It’s the signal an iterator uses to say “I’m done”. `for` loops catch it automatically; `next()` exposes it directly if you ask for another item after the end.'
        },
        {
          prompt: 'Why might you use `next(it, default)` instead of `try/except StopIteration`?',
          sampleAnswer: 'It’s a concise way to provide a fallback value when the iterator is exhausted, avoiding exception handling for a common control-flow case.'
        },
        {
          prompt: 'What’s one debugging trick to confirm a function is a generator?',
          sampleAnswer: 'Call it and check the type/behavior: it returns a generator object (iterable iterator), and you can `next()` it. You can also inspect that it contains `yield`.'
        }
      ]
    };
  }

  if (k === 'generator functions - using generators with for-loops') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What does a `for` loop do under the hood when iterating a generator?',
          sampleAnswer: 'It calls `iter(gen)` to get an iterator, then repeatedly calls `next()` until `StopIteration` is raised, at which point it stops.'
        },
        {
          prompt: 'How can generator exhaustion cause subtle bugs in data pipelines?',
          sampleAnswer: 'If you pass a generator through one consumer (e.g., logging or `list(...)`) it gets drained, and later steps see no data. You may need to recreate the generator or materialize once intentionally.'
        },
        {
          prompt: 'How would you write tests for a generator?',
          sampleAnswer: 'Usually by consuming it into a list for small cases and comparing to expected output, and by testing boundary behavior (empty, one item, exhaustion raising `StopIteration` with `next()`).'
        }
      ]
    };
  }

  if (k === 'generator functions - generate first n numbers') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the difference between yielding `range(n)` values and returning `list(range(n))`?',
          sampleAnswer: 'Yielding is lazy and doesn’t allocate the list; returning the list materializes all values immediately. Both produce the same sequence for finite `n`, but memory and timing differ.'
        },
        {
          prompt: 'What off-by-one mistakes do you watch for in “first n” generators?',
          sampleAnswer: 'Mixing inclusive/exclusive endpoints (`0..n-1` vs `1..n`), or forgetting that `range(n)` stops before `n`.'
        },
        {
          prompt: 'If you needed both the generator and the count of produced items, how would you structure it?',
          sampleAnswer: 'Keep state in the caller (increment while consuming) or wrap consumption in a helper that counts. Generators themselves can’t easily “return” two things besides yielding; you typically handle metadata externally.'
        }
      ]
    };
  }

  if (k === 'generator functions - fibonacci generator (with a limit)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why is Fibonacci a good teaching example for generators?',
          sampleAnswer: 'It has evolving internal state and a natural “produce next value” pattern. It demonstrates `yield` + state updates without needing to store the whole sequence.'
        },
        {
          prompt: 'How do you decide on a stopping condition for an “unbounded” sequence generator?',
          sampleAnswer: 'Use a clear limit (max value, max count, time budget) or accept that it’s infinite and rely on the consumer to stop. For beginners, explicit finite limits reduce bugs.'
        },
        {
          prompt: 'What’s one performance-related pitfall with generators?',
          sampleAnswer: 'Generators can be slower per-item than tight loops in some cases due to Python overhead, so you measure. But they often win in memory and pipeline composition.'
        }
      ]
    };
  }

  if (k === 'generator functions - generators vs lists (memory intuition)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you explain “lazy evaluation” in practical terms?',
          sampleAnswer: 'Work is done only when you need a value. With generators, values are computed on demand during iteration rather than all at once up front.'
        },
        {
          prompt: 'Give a scenario where a list comprehension is the better choice.',
          sampleAnswer: 'When the dataset is small and you’ll reuse the results multiple times, or you need indexing/slicing. Materializing once can be simpler and faster overall.'
        },
        {
          prompt: 'What’s a concrete sign in code review that a generator is being used incorrectly?',
          sampleAnswer: 'Consuming it multiple times unintentionally (e.g., `len(list(gen))` and then later iterating `gen`), or mixing side-effect consumers that drain it before the main consumer.'
        }
      ]
    };
  }

  if (k === 'generator functions - performance note (what to measure)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When someone says “generators are faster”, how do you respond?',
          sampleAnswer: 'They’re often more memory-efficient and enable streaming, but not always faster. There’s per-item overhead, and sometimes list comprehensions are faster for pure CPU transformations. You measure runtime and memory for your actual workload.'
        },
        {
          prompt: 'How would you benchmark a generator pipeline fairly?',
          sampleAnswer: 'Use representative data, isolate the pipeline from unrelated I/O, run multiple iterations (e.g., `timeit`), and compare both time and peak memory. Make sure both versions do the same amount of work and produce equivalent results.'
        },
        {
          prompt: 'What’s an example of a misleading microbenchmark involving generators?',
          sampleAnswer: 'Timing only generator creation (which is cheap) instead of consumption. The real cost is in iterating/processing the yielded values.'
        }
      ]
    };
  }

  if (k === 'generator functions - mini program: streaming a big file safely') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the safest basic pattern for streaming a big file in Python, and why?',
          sampleAnswer: 'Use `with open(...) as f:` and iterate `for line in f:`. The context manager guarantees the file is closed, and line iteration avoids reading everything into memory.'
        },
        {
          prompt: 'How would you handle “bad” lines while streaming (e.g., decode issues or parse failures) without losing the whole run?',
          sampleAnswer: 'Decide a policy: use `errors="replace"`/`ignore` for decoding, or catch parse exceptions per-line, record/report the failure, and continue. Keep error handling local so one bad line doesn’t kill the entire job unless required.'
        },
        {
          prompt: 'Why can generators be a good fit for file-processing pipelines?',
          sampleAnswer: 'They naturally express “read → transform → filter → aggregate” as a lazy pipeline, reducing memory and allowing early results.'
        }
      ]
    };
  }

  if (k === 'generator functions - common pitfalls (exhaustion + one-time use)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Tell me about a real bug you can get from generator exhaustion in a multi-step program.',
          sampleAnswer: 'One step logs or inspects data by iterating the generator (or converting to a list), which drains it. The “real” processing step then sees no items and silently produces wrong output. The fix is to materialize intentionally or pass a generator factory.'
        },
        {
          prompt: 'How do you decide between materializing to a list vs keeping things lazy?',
          sampleAnswer: 'If you need multiple passes, random access, or the dataset is small, materialize. If the dataset is large/streaming and single-pass, keep it lazy. Pick clarity first, then optimize when needed.'
        },
        {
          prompt: 'How do you “debug” what’s inside a generator without breaking the program?',
          sampleAnswer: 'Use a small `islice` peek during development, or add a tee/logging stage that is explicit about consumption. Be careful: any peek consumes items unless you duplicate the stream intentionally.'
        }
      ]
    };
  }

  if (k === 'generator functions - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'If you were reviewing code that uses a generator pipeline, what questions would you ask to confirm correctness?',
          sampleAnswer: 'Who consumes the generator? Is it consumed exactly once? Are there any hidden conversions to list that change memory/performance? Is the stopping condition correct? Are errors handled per-item where appropriate?' 
        },
        {
          prompt: 'How do you communicate generator “one-shot” behavior in an API?',
          sampleAnswer: 'Name things clearly (`iter_*`, `stream_*`), document that the return is an iterator, and avoid returning a generator object that must be reused. Provide a factory function when callers might need multiple passes.'
        },
        {
          prompt: 'What’s the simplest “checkpoint test” you’d write for a generator function?',
          sampleAnswer: 'Consume it into a list for a small input and compare to expected output, and separately test exhaustion behavior with `next(gen, sentinel)` or that it raises `StopIteration`.'
        }
      ]
    };
  }

  if (k === 'assertions - overview (debugging vs production)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you explain assertions to a beginner without encouraging misuse?',
          sampleAnswer: 'Assertions are “developer checks” for assumptions that should always be true if the program is correct. They help catch bugs early, but they’re not how you handle normal bad input or runtime failures.'
        },
        {
          prompt: 'Why can assertions be problematic for validation in production systems?',
          sampleAnswer: 'They can be disabled with optimization flags, so the validation may vanish. Also, they signal programmer errors, not user-facing failures with a stable error contract.'
        },
        {
          prompt: 'What’s a good use of `assert` in data-processing code?',
          sampleAnswer: 'Checking internal invariants after an internal transformation (e.g., “this list is sorted now” or “lengths match”) during testing/debugging.'
        }
      ]
    };
  }

  if (k === 'assertions - simple assert (condition must be true)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Give an example of a strong assertion vs a weak assertion.',
          sampleAnswer: 'Strong: `assert 0 <= i < len(items)` (captures the real invariant). Weak: `assert i != -1` (blocks one bad value but misses others). Strong assertions are specific and match the contract.'
        },
        {
          prompt: 'Where do you place assertions: at function boundaries or inside functions?',
          sampleAnswer: 'Typically inside, near where assumptions matter, especially for internal invariants. For public APIs, use explicit validation/exceptions for caller input rather than assertions.'
        },
        {
          prompt: 'How do you handle an assertion failure in a test suite?',
          sampleAnswer: 'Treat it as a bug: investigate why the invariant was violated, add/adjust tests, and fix the code or contract. Don’t paper over it by catching `AssertionError` unless you’re intentionally testing it.'
        }
      ]
    };
  }

  if (k === 'assertions - augmented assert (custom message)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What makes a good assertion message?',
          sampleAnswer: 'It states the expected invariant and includes the key values needed to debug (e.g., lengths, indexes, IDs). It should help you diagnose without re-running with extra prints.'
        },
        {
          prompt: 'When might you avoid a heavy/expensive assertion message?',
          sampleAnswer: 'If building the message requires expensive work or sensitive data. You can keep the message simple or compute it cheaply; remember it only evaluates on failure, but “failure paths” might still matter.'
        },
        {
          prompt: 'How can assertion messages improve code reviews?',
          sampleAnswer: 'They document intent: reviewers can see the invariant being enforced and whether it matches the function’s contract.'
        }
      ]
    };
  }

  if (k === 'assertions - catching a real bug (example)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Describe a bug that an assertion would catch earlier than a later crash.',
          sampleAnswer: 'A function assumes inputs are normalized (e.g., no empty strings). An assert near normalization (`assert all(s for s in items)`) catches the bad state immediately instead of failing later with confusing errors in unrelated code.'
        },
        {
          prompt: 'How do you avoid turning assertions into hidden business rules?',
          sampleAnswer: 'Only assert internal invariants, not user-facing validation. If it’s a rule that must always run, make it explicit with `if ...: raise ...` and document it as part of the API.'
        },
        {
          prompt: 'If asserts are disabled, what should still be true about your program’s correctness?',
          sampleAnswer: 'Core correctness and safety checks must still run. Asserts should be “extra confidence”, not required enforcement for correctness or security.'
        }
      ]
    };
  }

  if (k === 'assertions - assertions vs exception handling') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you decide whether a failure is an “assert” case or an “exception handling” case?',
          sampleAnswer: 'If the failure can happen in normal operation (bad input, I/O, network, user choices), handle it with exceptions/validation. If it indicates a broken assumption in the code path, assert it during development.'
        },
        {
          prompt: 'Why is `AssertionError` a poor public API error type?',
          sampleAnswer: 'It doesn’t communicate a stable, intentional contract; it signals a programming mistake. Public APIs should raise meaningful exceptions like `ValueError`/`TypeError` so callers can handle them predictably.'
        },
        {
          prompt: 'Can you combine both approaches in layered architecture?',
          sampleAnswer: 'Yes: lower-level code may assert internal invariants, while boundaries validate inputs and translate failures into domain-specific exceptions or user-facing errors.'
        }
      ]
    };
  }

  if (k === 'assertions - enabling/disabling asserts (important note)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you explain the `-O` flag’s impact to someone relying on asserts for validation?',
          sampleAnswer: 'With `-O`, assert statements are removed, so validation disappears. If a check must always run, it cannot be an assert; it must be explicit code.'
        },
        {
          prompt: 'What is `__debug__`, and when might you use it?',
          sampleAnswer: '`__debug__` is `True` normally and `False` under optimization. You can guard debug-only code with it, but you still shouldn’t put required logic behind it.'
        },
        {
          prompt: 'What’s the best practice if you want both: strict validation and helpful development-time assertions?',
          sampleAnswer: 'Implement explicit validation/exceptions for required behavior, and optionally add assertions for internal invariants and sanity checks during development.'
        }
      ]
    };
  }

  if (k === 'assertions - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s your mental model for “assertions are for developers” vs “exceptions are for callers”?',
          sampleAnswer: 'Assertions check internal invariants that should never be violated if the code is correct; exceptions/validation handle bad input and expected failures in production. Public APIs should not rely on asserts for correctness.'
        },
        {
          prompt: 'How do you teach a team to use asserts without creating production risks?',
          sampleAnswer: 'Set a rule: no business logic or required validation in asserts. Use explicit checks/exceptions for required behavior. Use asserts to document invariants and catch bugs during testing, and keep messages informative.'
        },
        {
          prompt: 'What’s one good place to add an assert in a multi-step transformation function?',
          sampleAnswer: 'Right after an internal transformation where you can state an invariant (e.g., “lengths match”, “values are within range”, “sorted after sort”). It fails close to the cause and helps debugging.'
        }
      ]
    };
  }

  if (k === 'file handling - why files? (text vs binary)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you decide whether to open a file in text mode or binary mode?',
          sampleAnswer: 'If you’re working with human-readable text (CSV/JSON/logs), use text mode with an explicit encoding. If you’re working with raw bytes (images, PDFs, compressed data), use binary mode.'
        },
        {
          prompt: 'What goes wrong when you treat binary data as text?',
          sampleAnswer: 'Decoding can fail or silently corrupt data because bytes may not be valid in the chosen encoding. Newline translation and character normalization can also change bytes.'
        },
        {
          prompt: 'What’s your default encoding choice and why?',
          sampleAnswer: 'Often `utf-8` because it’s widely supported and consistent across systems. Being explicit avoids platform defaults causing surprises.'
        }
      ]
    };
  }

  if (k === 'file handling - open() and file modes') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the fastest way you’ve seen data get lost with file modes?',
          sampleAnswer: 'Using `"w"` by accident truncates an existing file. A safer approach is `"x"` for “create new only” or writing to a temp file then renaming.'
        },
        {
          prompt: 'How do you explain `r+` vs `w+` to a beginner?',
          sampleAnswer: '`r+` opens an existing file for reading and writing without truncating; `w+` creates/truncates the file then allows reading/writing. `w+` is destructive if the file exists.'
        },
        {
          prompt: 'When would you use append mode `a` in real systems?',
          sampleAnswer: 'For logs or incremental output where you never want to destroy existing content. It also works well when multiple runs add to the same file.'
        }
      ]
    };
  }

  if (k === 'file handling - closing files (and why with is better)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why are context managers a big deal for file handling?',
          sampleAnswer: 'They guarantee cleanup: the file gets closed even if an exception occurs. This prevents resource leaks and file locks, and it keeps code simpler and safer.'
        },
        {
          prompt: 'What kinds of bugs show up when files aren’t closed properly?',
          sampleAnswer: 'Locked files on Windows, running out of file descriptors, buffered writes not being flushed, and unpredictable behavior in long-running processes.'
        },
        {
          prompt: 'If you must manage a file manually (no `with`), what must you do?',
          sampleAnswer: 'Use a `try/finally` to ensure `close()` runs, or wrap file usage in a helper/context manager. The key is guaranteeing closure on all paths.'
        }
      ]
    };
  }

  if (k === 'file handling - file object properties') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What quick checks do you do when file I/O behaves strangely?',
          sampleAnswer: 'Confirm mode (`f.mode`), encoding (`f.encoding` in text mode), file path (`f.name`), whether it’s closed (`f.closed`), and current position (`tell()`).'
        },
        {
          prompt: 'How do you debug “my file read returns empty string” bugs?',
          sampleAnswer: 'Check the file pointer (maybe you already read to EOF), verify you opened the correct file, and ensure you’re reading in the right mode/encoding. `tell()` and `seek(0)` can confirm pointer state.'
        },
        {
          prompt: 'Why does “mode/encoding mismatch” matter for program correctness?',
          sampleAnswer: 'It changes the type (`str` vs `bytes`) and can change the data (decoding errors, newline translation). Downstream parsing can fail or silently misinterpret content.'
        }
      ]
    };
  }

  if (k === 'file handling - writing text: write() and writelines()') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s a safe strategy to write a file without risking a partial/corrupt result if the program crashes mid-write?',
          sampleAnswer: 'Write to a temporary file, flush/close it, then atomically rename/replace the destination. This prevents leaving a half-written main file.'
        },
        {
          prompt: 'Why do people get surprised by `writelines()`?',
          sampleAnswer: 'Because it doesn’t add newline characters. You must include `\\n` yourself, otherwise everything runs together.'
        },
        {
          prompt: 'When might you prefer `print(..., file=f)` over `f.write(...)`?',
          sampleAnswer: 'When you want convenient formatting and automatic newline handling. For performance or precise control, `write()` is clearer.'
        }
      ]
    };
  }

  if (k === 'file handling - reading text: read / read(n) / readline / readlines') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you choose between `read()`, `readline()`, and iterating lines?',
          sampleAnswer: '`read()` is fine for small files; `readline()` is fine when you need precise control; iterating `for line in f` is usually best for large files and simple processing. `readlines()` materializes everything and can be memory-heavy.'
        },
        {
          prompt: 'What’s a common bug with `read(n)` on text files?',
          sampleAnswer: 'Assuming `n` means bytes; in text mode it’s characters (and encoding complicates bytes). If you need byte-level chunking, use binary mode.'
        },
        {
          prompt: 'How do you avoid stripping meaningful whitespace when processing lines?',
          sampleAnswer: 'Use `rstrip("\\n")` instead of `strip()` when you only want to remove the newline, or be deliberate about which characters you remove.'
        }
      ]
    };
  }

  if (k === 'file handling - reading with for-loop (best for big files)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the performance/memory advantage of `for line in f`?',
          sampleAnswer: 'It’s streaming: you process one line at a time with low memory overhead, and Python’s file object buffering makes it efficient.'
        },
        {
          prompt: 'How do you handle per-line parse errors without losing the whole run?',
          sampleAnswer: 'Catch exceptions inside the loop for that line, log/report it, and continue (or keep a counter). Keep the try block small and avoid swallowing unexpected exceptions silently.'
        },
        {
          prompt: 'How do you make line-processing code testable?',
          sampleAnswer: 'Separate “parse one line” into a pure function and test it, then keep the file loop thin. You can also use `io.StringIO` to simulate files in tests.'
        }
      ]
    };
  }

  if (k === 'file handling - tell() and seek() (file pointer)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When is `seek()` genuinely useful in real programs?',
          sampleAnswer: 'For random-access reads (e.g., simple file formats with headers), re-reading from the start, implementing retry/rewind in parsers, or when you need to skip to known offsets (especially in binary files).' 
        },
        {
          prompt: 'Why do text files make “byte offsets” a little weird?',
          sampleAnswer: 'Because decoding and newline translation mean the relationship between characters and underlying bytes isn’t 1:1. For precise byte offsets, use binary mode.'
        },
        {
          prompt: 'What’s the fastest way to diagnose “I’m reading nothing” using tell/seek?',
          sampleAnswer: 'Print `tell()` to see if you’re at EOF, then `seek(0)` and read again. It reveals pointer state immediately.'
        }
      ]
    };
  }

  if (k === 'file handling - check file exists (pathlib)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you check “exists and is a file” vs “exists and is a directory” in pathlib?',
          sampleAnswer: 'Use `Path.is_file()` for files and `Path.is_dir()` for directories. `exists()` only tells you something exists, not what it is.'
        },
        {
          prompt: 'Why is exception-first file handling often better than pre-checking existence?',
          sampleAnswer: 'Pre-checks can race (the filesystem can change). Handling `FileNotFoundError`/`PermissionError` from the actual open is more robust.'
        },
        {
          prompt: 'What other failure besides “missing file” should you plan for when opening a path?',
          sampleAnswer: 'Permission problems (`PermissionError`), directories where you expected a file (`IsADirectoryError`), and encoding/IO errors depending on the operation.'
        }
      ]
    };
  }

  if (k === 'file handling - count lines, words, characters') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you count lines/words/chars for a multi-GB file without running out of memory?',
          sampleAnswer: 'Stream it: iterate `for line in f` and update counters incrementally. Avoid `read()`/`readlines()` because they materialize the whole file. For chars/words, process each line (e.g., `len(line.rstrip("\\n"))` and `len(line.split())`).'
        },
        {
          prompt: 'What does “word count” mean exactly, and how does `split()` behave with multiple spaces/tabs?',
          sampleAnswer: 'You must define “word”: a common definition is runs of non-whitespace separated by whitespace. `str.split()` (no args) splits on any whitespace and collapses repeated whitespace, which is usually what you want for simple word counts.'
        },
        {
          prompt: 'Why can character counting be tricky with Unicode, and what do you count in Python?',
          sampleAnswer: 'In text mode, `len(str)` counts Unicode code points, not bytes. A character like “é” may be multiple bytes in UTF-8, so byte size differs from character count. If you need bytes, open in binary mode and count `len(bytes)`.'
        }
      ]
    };
  }

  if (k === 'file handling - binary files (copy an image safely)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Show two ways to copy a binary file in Python and compare them.',
          sampleAnswer: 'Way 1: manual chunk loop with `rb`/`wb` (gives control over buffer size). Way 2: `shutil.copyfileobj` or `shutil.copy2` (simpler and reliable). Both must use binary mode to avoid corruption.'
        },
        {
          prompt: 'What bug happens if you open a PNG with `encoding="utf-8"` and read as text?',
          sampleAnswer: 'It will fail decoding (`UnicodeDecodeError`) or silently corrupt the bytes when re-encoded. Even if it “reads”, writing it back won’t match the original binary stream.'
        },
        {
          prompt: 'When would you prefer chunked copying over reading all bytes at once?',
          sampleAnswer: 'For large files or when memory matters. Chunking keeps memory usage bounded and is usually just as fast due to OS buffering.'
        }
      ]
    };
  }

  if (k === 'file handling - csv files (write/read)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why is `newline=""` recommended with the `csv` module on Windows?',
          sampleAnswer: 'Because newline translation can interact with the CSV writer/reader and produce extra blank lines. Opening with `newline=""` lets the `csv` module manage newlines correctly.'
        },
        {
          prompt: 'What are two common CSV gotchas that cause messy data?',
          sampleAnswer: '1) Commas/newlines inside fields require quoting; use the `csv` module rather than manual `split(",")`. 2) Types come in as strings; you must convert (e.g., `int(row["score"])`) and handle missing values.'
        },
        {
          prompt: 'How would you read a CSV and compute an aggregate (e.g., average score) robustly?',
          sampleAnswer: 'Use `csv.DictReader`, validate required columns, convert types with `try/except`, skip or report bad rows, and keep a running sum/count rather than storing all rows in memory.'
        }
      ]
    };
  }

  if (k === 'file handling - zip files (zip/unzip)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What is Zip Slip and how do you defend against it when extracting?',
          sampleAnswer: 'Zip Slip is path traversal via crafted archive paths like `../../pwned`. Defend by normalizing each member path, rejecting absolute paths or those that escape the destination directory, and only then extracting.'
        },
        {
          prompt: 'How do you add files to a zip while keeping relative paths clean?',
          sampleAnswer: 'Use `arcname=os.path.relpath(full_path, start=root_dir)` when calling `ZipFile.write`. That avoids embedding full machine-specific paths into the archive.'
        },
        {
          prompt: 'When would you choose to zip files in Python instead of calling an OS zip command?',
          sampleAnswer: 'When you want cross-platform behavior, structured control (which files to include, metadata, compression), and to avoid shell quoting/injection issues.'
        }
      ]
    };
  }

  if (k === 'file handling - directories with os (mkdir, listdir, walk)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you create nested directories safely if they already exist?',
          sampleAnswer: 'Use `os.makedirs(path, exist_ok=True)`. It creates parents as needed and doesn’t fail if the directory already exists.'
        },
        {
          prompt: 'How does `os.walk` help you build tools like “find all .log files” or “compute total size of a folder”?',
          sampleAnswer: '`os.walk` yields each directory with its files, so you can filter by extension and accumulate results incrementally (paths, counts, total sizes) without manual recursion.'
        },
        {
          prompt: 'What’s a common bug when building file paths from `os.listdir()` output?',
          sampleAnswer: 'Forgetting to join with the directory: `os.listdir()` returns names, not full paths. Use `os.path.join(dir, name)`.'
        }
      ]
    };
  }

  if (k === 'file handling - file stats with os.stat (size + timestamps)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the difference between file size and “number of characters” in a text file?',
          sampleAnswer: 'Size (`st_size`) is bytes on disk. Character count depends on decoding (UTF-8 uses variable bytes per character). For ASCII they match closely; for Unicode they can differ a lot.'
        },
        {
          prompt: 'How would you display a “last modified” time in a human-friendly way?',
          sampleAnswer: 'Use `os.stat(path).st_mtime` and convert with `datetime.fromtimestamp`. Format with `strftime` or `isoformat()` depending on requirements.'
        },
        {
          prompt: 'What’s one portability caveat about “creation time”?',
          sampleAnswer: 'Some platforms/filesystems don’t expose a stable creation time the same way. “ctime” can mean metadata change time on Unix-like systems, not creation.'
        }
      ]
    };
  }

  if (k === 'file handling - running a command (os.system)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why is `subprocess.run` usually preferred over `os.system`?',
          sampleAnswer: '`subprocess.run` provides better control over arguments, exit codes, stdout/stderr capture, and avoids shell injection risks when you pass a list of arguments.'
        },
        {
          prompt: 'If you must call a shell command, how do you reduce injection risk?',
          sampleAnswer: 'Avoid concatenating untrusted strings into a shell command. Prefer `subprocess.run([prog, arg1, arg2], shell=False)`. Validate/escape inputs if a shell is unavoidable.'
        },
        {
          prompt: 'How do you capture output from a command for logging/debugging?',
          sampleAnswer: 'Use `subprocess.run(..., capture_output=True, text=True, check=False)` (or redirect stdout/stderr). Then log `result.stdout`/`result.stderr` and inspect `result.returncode`.'
        }
      ]
    };
  }

  if (k === 'file handling - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Given a path, outline a robust flow to build a summary report file (counts + metadata) and handle failures cleanly.',
          sampleAnswer: 'Validate input path (or attempt open and handle exceptions), stream file to compute counts, call `os.stat` for size/mtime, ensure output directory exists (`makedirs`), write a report using `with open(..., "w")`, and handle `FileNotFoundError`/`PermissionError` explicitly.'
        },
        {
          prompt: 'What are two signs your file-processing code will break on “real-world” data?',
          sampleAnswer: 'Assuming everything fits in memory (using `read()` on large files) and assuming clean encoding/formatting (not handling decode errors, missing columns, or unexpected whitespace).' 
        },
        {
          prompt: 'How would you test a file-handling pipeline without touching the filesystem too much?',
          sampleAnswer: 'Extract core logic into pure functions (e.g., count from an iterable of lines) and unit test those. For I/O boundaries, use `tempfile.TemporaryDirectory` and small fixtures, or `io.StringIO`/`io.BytesIO` where appropriate.'
        }
      ]
    };
  }

  if (k === 'object serialization - big picture (serialize vs deserialize)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When would you choose JSON over pickle, and when would you choose pickle over JSON?',
          sampleAnswer: 'Choose JSON for interoperability, human readability, and safer data exchange (basic types). Choose pickle when you control both ends, need Python-specific object fidelity, and performance/feature completeness matters more than portability.'
        },
        {
          prompt: 'What are the security implications of deserializing data?',
          sampleAnswer: 'Some formats can execute code during deserialization (pickle). Even “data-only” formats can have risks (resource exhaustion, unexpected structure). Treat deserialization as a trust boundary and validate input.'
        },
        {
          prompt: 'How do you manage schema evolution when serialized data changes over time?',
          sampleAnswer: 'Version your payloads, provide default values for new fields, handle missing/renamed fields, and write migration code or loaders that accept older versions.'
        }
      ]
    };
  }

  if (k === 'object serialization - pickle basics (dump/load)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the single most important rule for using pickle safely?',
          sampleAnswer: 'Only unpickle data you fully trust. Never load pickle from untrusted users or the network.'
        },
        {
          prompt: 'Why does pickle require binary file modes, and what breaks if you use text mode?',
          sampleAnswer: 'Pickle streams are bytes; text mode may decode/encode and translate newlines, corrupting the byte stream and causing `UnpicklingError` or subtle corruption.'
        },
        {
          prompt: 'If you need a portable, human-readable serialization format for configuration, what would you pick and why?',
          sampleAnswer: 'JSON (or YAML in some ecosystems). JSON is widely supported across languages, easy to inspect, and safer than pickle for exchange of simple data.'
        }
      ]
    };
  }

  if (k === 'object serialization - pickle multiple objects (eoferror pattern)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you model “multiple records” in a pickle file, and what are the trade-offs?',
          sampleAnswer: 'Option 1 is to dump multiple objects back-to-back and read them in a loop until `EOFError`. Option 2 is to store a single list/dict containing all records and dump once. The stream approach supports append-like patterns but makes reading/writing logic slightly more complex and versioning harder.'
        },
        {
          prompt: 'If `pickle.load` raises `EOFError`, is that always a bug?',
          sampleAnswer: 'Not necessarily—`EOFError` is the normal termination signal when you’re intentionally reading a stream of multiple objects. It is only a bug if it happens unexpectedly (e.g., file truncated or you expected more objects).' 
        },
        {
          prompt: 'When would you avoid pickle entirely for “record logs”?',
          sampleAnswer: 'When you need portability across languages/tools or need to share the data externally. In those cases, use JSON (possibly newline-delimited), CSV for tabular, or a small database.'
        }
      ]
    };
  }

  if (k === 'object serialization - pickle security + compatibility') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the security posture you should assume when dealing with pickled data?',
          sampleAnswer: 'Pickle is “trusted input only”. Treat unpickling as code execution risk; never accept pickle from untrusted users or network sources. Use JSON for untrusted data exchange.'
        },
        {
          prompt: 'What usually breaks pickle compatibility across versions/refactors, and how do teams handle it?',
          sampleAnswer: 'Pickled custom class instances can break when module paths or class names change. Teams mitigate by versioning payloads, keeping stable import paths, writing migrations/loaders that accept older versions, or by serializing plain dicts rather than class instances.'
        },
        {
          prompt: 'How do you choose a pickle protocol in production systems?',
          sampleAnswer: 'Pick a protocol that matches your deployment constraints: highest protocol for performance when all runtimes are compatible; a specific protocol when you must support older Python. Document it and include a version field in your data so you can evolve formats safely.'
        }
      ]
    };
  }

  if (k === 'object serialization - json basics (python types mapping)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What are the practical limitations of JSON compared to Python objects?',
          sampleAnswer: 'JSON only supports objects/arrays/strings/numbers/booleans/null. You can’t represent sets, tuples distinctly, bytes, datetimes, or custom classes without defining an encoding (e.g., convert to lists/strings/dicts).' 
        },
        {
          prompt: 'How do you handle non-ASCII text and pretty printing in JSON output?',
          sampleAnswer: 'Use `ensure_ascii=False` to keep Unicode readable, and `indent=2` (plus `sort_keys=True` if desired) for stable, human-friendly formatting.'
        },
        {
          prompt: 'What’s your approach to validation after `json.loads`?',
          sampleAnswer: 'Parsing only guarantees syntactic validity. I validate the structure: required keys, types, and constraints. For bigger projects I use dataclasses/pydantic-style models or explicit validation functions.'
        }
      ]
    };
  }

  if (k === 'object serialization - json.dumps vs json.dump') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you explain `dump` vs `dumps` to a junior developer in one sentence?',
          sampleAnswer: '`dumps` returns a JSON string; `dump` writes JSON to a file-like object. The “s” stands for “string”.'
        },
        {
          prompt: 'What options matter most for producing stable JSON in repos/config files?',
          sampleAnswer: '`indent` for readability, `sort_keys=True` for stable ordering, `ensure_ascii=False` for readable Unicode, and consistent newline/encoding settings when writing to disk.'
        },
        {
          prompt: 'How do you avoid corrupting JSON files during writes?',
          sampleAnswer: 'Write to a temp file and atomically replace the destination (plus flushing/closing). It prevents partial writes if the process crashes.'
        }
      ]
    };
  }

  if (k === 'object serialization - json.loads vs json.load') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you debug a `JSONDecodeError` quickly?',
          sampleAnswer: 'Inspect the error position (line/column), print a small slice around the offset, and look for common issues like trailing commas, mismatched quotes, or non-JSON values like `NaN`. If reading from a file, confirm encoding is correct.'
        },
        {
          prompt: 'What’s a safe pattern for reading optional config from JSON?',
          sampleAnswer: 'Wrap file open in `try/except FileNotFoundError`, parse with `json.load`, then merge with defaults. Validate critical keys/types and fail loudly for missing required fields.'
        },
        {
          prompt: 'When would you prefer streaming JSON parsing, and what limitation exists in the stdlib?',
          sampleAnswer: 'For massive JSON you might want streaming, but Python’s stdlib `json` module doesn’t provide true streaming parsing; you typically need a different format (NDJSON) or third-party libraries.'
        }
      ]
    };
  }

  if (k === 'object serialization - json for custom classes (to_dict/from_dict)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you design `to_dict/from_dict` so it survives schema changes?',
          sampleAnswer: 'Include a version field, give defaults for new fields, tolerate missing optional fields, and keep the mapping explicit rather than relying on `__dict__`. For nested objects, delegate to nested `to_dict/from_dict` and keep types clear.'
        },
        {
          prompt: 'Why is serializing arbitrary objects with `default=lambda o: o.__dict__` risky?',
          sampleAnswer: 'It can leak private/internal fields, isn’t stable across refactors, and can break when fields include non-serializable types. Explicit schemas are safer and more maintainable.'
        },
        {
          prompt: 'How do you represent datetimes in JSON?',
          sampleAnswer: 'Convert to ISO-8601 strings (`dt.isoformat()`) and parse back explicitly (`datetime.fromisoformat`). Keep timezone handling explicit to avoid subtle bugs.'
        }
      ]
    };
  }

  if (k === 'object serialization - json from an http api (requests)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What production-grade checks do you add around `requests.get(...).json()`?',
          sampleAnswer: 'Set a timeout, call `raise_for_status()`, handle JSON parse errors, and validate the shape of the response. Optionally check `Content-Type` and add retries/backoff depending on the API.'
        },
        {
          prompt: 'Why is a timeout non-negotiable in HTTP calls?',
          sampleAnswer: 'Without a timeout your program can hang indefinitely on network issues. Timeouts bound failure and improve reliability.'
        },
        {
          prompt: 'How do you handle API versioning changes that add/rename fields?',
          sampleAnswer: 'Code defensively: tolerate extra fields, use defaults for missing optional fields, validate required fields, and keep parsing logic isolated so it’s easy to update. If possible, pin API versions.'
        }
      ]
    };
  }

  if (k === 'object serialization - yaml basics (pyyaml, safe_load)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the YAML equivalent of “don’t unpickle untrusted data”?',
          sampleAnswer: 'Use `yaml.safe_load` and avoid unsafe loaders for untrusted YAML. Treat YAML parsing as a trust boundary and validate the parsed structure.'
        },
        {
          prompt: 'Why do teams like YAML for configs despite the pitfalls?',
          sampleAnswer: 'It’s readable, supports comments, and is ergonomic for humans. The trade-off is indentation sensitivity and loader security; teams standardize style and use safe loaders.'
        },
        {
          prompt: 'What’s a common YAML bug that wastes time, and how do you prevent it?',
          sampleAnswer: 'Indentation errors or accidental type coercion. Prevent by keeping YAML small, validating after load, using consistent indentation, and adding tests/linting for configs.'
        }
      ]
    };
  }

  if (k === 'object serialization - choose the right format (quick guide)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you decide between JSON, YAML, CSV, and pickle for a new feature?',
          sampleAnswer: 'Start with consumers and trust boundaries: JSON for interop and untrusted exchange; YAML for human-edited config (safe_load + validation); CSV for tabular interchange; pickle only for trusted internal Python-to-Python storage.'
        },
        {
          prompt: 'What’s the biggest mistake developers make when “choosing a format”?',
          sampleAnswer: 'Optimizing for convenience over correctness/security—e.g., using pickle for network payloads or parsing CSV/JSON with ad-hoc string splitting without validation.'
        },
        {
          prompt: 'What do you do when data grows too big for “one JSON file”?',
          sampleAnswer: 'Switch to streaming-friendly formats (NDJSON), chunk processing, or a database. Also reconsider access patterns: append-only logs vs random access.'
        }
      ]
    };
  }

  if (k === 'object serialization - section practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Propose a checkpoint exercise that forces good security habits with serialization.',
          sampleAnswer: 'Have learners load configuration from YAML with `safe_load`, fetch JSON from an API with timeouts + status checks, validate required fields, write output JSON using an atomic write pattern, and explicitly forbid loading pickle from untrusted input.'
        },
        {
          prompt: 'What’s the “minimum viable validation” you expect after parsing JSON/YAML?',
          sampleAnswer: 'Check it’s the expected top-level type (dict/list), validate required keys and basic types, and fail with clear errors. Parsing alone is not validation.'
        },
        {
          prompt: 'How would you structure code so serialization details don’t leak everywhere?',
          sampleAnswer: 'Centralize encode/decode in a small module (e.g., `storage.py`) with functions like `load_config`, `save_report`, `parse_api_response`. Keep the rest of the app working with normal Python objects.'
        }
      ]
    };
  }

  if (k === 'oop - part 2 overview (inheritance + relationships)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain IS-A vs HAS-A and give one example of each in Python terms.',
          sampleAnswer: 'IS-A is inheritance: `class Dog(Animal)`. HAS-A is composition: `class Car: self.engine = Engine()`. IS-A creates a type/substitutability relationship; HAS-A models a dependency/containment relationship.'
        },
        {
          prompt: 'What is Liskov Substitution in plain language, and how does it influence inheritance decisions?',
          sampleAnswer: 'If code works with the base type, it should also work with any subtype without surprises. If your subclass changes expectations (inputs/outputs/invariants), inheritance is likely the wrong tool and composition may fit better.'
        },
        {
          prompt: 'Describe a refactor where you replaced inheritance with composition and why it improved the design.',
          sampleAnswer: 'A common refactor is when a subclass only used a small part of a base class and overrode many methods. By extracting a helper component and delegating to it, behavior became more explicit, testing got easier (mockable dependency), and the type hierarchy stopped lying about “is-a”.'
        }
      ]
    };
  }

  if (k === 'oop - has-a relationship (composition) with an example') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How does composition improve testability compared to inheritance?',
          sampleAnswer: 'With composition you can inject dependencies (real vs fake implementations) and test behavior in isolation. Inheritance bakes behavior into the type hierarchy and often makes substitution harder (you end up mocking internals).'
        },
        {
          prompt: 'What’s the difference between “delegation” and “composition” in everyday coding?',
          sampleAnswer: 'Composition is holding an object as a field; delegation is forwarding work to that field (e.g., `self.engine.start()`). You often use both together.'
        },
        {
          prompt: 'When can composition go wrong?',
          sampleAnswer: 'If you create a huge number of tiny wrapper classes that just forward methods, you can end up with indirection and confusing APIs. It’s still usually preferable to a wrong inheritance model, but you should keep boundaries meaningful.'
        }
      ]
    };
  }

  if (k === 'oop - composition vs aggregation (strong vs weak ownership)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'In Python, how do you represent “ownership” if the language doesn’t enforce it?',
          sampleAnswer: 'It’s mostly API design and conventions: who creates the object, who is allowed to mutate it, and who holds the primary reference. You can also enforce it by not exposing internal parts directly and by controlling construction via factory methods.'
        },
        {
          prompt: 'Why can shared mutable objects make aggregation tricky?',
          sampleAnswer: 'If multiple owners reference the same mutable object, a change in one place affects others. You need clear contracts about mutation, copying, or immutability to avoid surprising side effects.'
        },
        {
          prompt: 'Give an example of a bug caused by unclear ownership and how you’d prevent it.',
          sampleAnswer: 'Example: a `Team` and `League` both modify the same `Player.stats` dict unexpectedly. Prevent by making `Player` responsible for mutations via methods, using immutable snapshots, or copying when appropriate.'
        }
      ]
    };
  }

  if (k === 'oop - is-a relationship (inheritance) basics') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What does overriding mean, and how does method lookup work at a high level?',
          sampleAnswer: 'Overriding means the subclass provides a method with the same name, replacing the base version for that subclass. Python looks for attributes on the instance, then the class, then base classes following the MRO.'
        },
        {
          prompt: 'What’s the difference between `isinstance` and `issubclass`?',
          sampleAnswer: '`isinstance(obj, C)` checks an object’s type relationship. `issubclass(Sub, Base)` checks class-to-class relationships. Both respect inheritance.'
        },
        {
          prompt: 'When would you use an abstract base class or protocol instead of direct inheritance?',
          sampleAnswer: 'When you want to define an interface/contract without sharing implementation, or when you want structural typing (“duck typing”) while still getting clarity and type-checking support.'
        }
      ]
    };
  }

  if (k === 'oop - inheritance example (reusing parent members)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Show an inheritance example where `super()` is important even with single inheritance.',
          sampleAnswer: 'If a base class enforces invariants (e.g., validating inputs) or sets up shared state, calling `super()` in the override ensures you keep that behavior. For example, `Base.save()` might log/validate, and `Child.save()` should call `super().save()` before/after its extra steps.'
        },
        {
          prompt: 'What’s a sign that a base class is doing too much?',
          sampleAnswer: 'It has many unrelated responsibilities, many subclasses override most of its methods, or changes to the base break many children. That usually indicates the base needs splitting or composition-based design.'
        },
        {
          prompt: 'How do you keep inheritance hierarchies maintainable?',
          sampleAnswer: 'Keep them shallow, keep base classes small and focused, avoid forcing unrelated features into a shared base, and document invariants and expected override points. Prefer composition where variation is orthogonal.'
        }
      ]
    };
  }

  if (k === 'oop - constructors in inheritance + super().__init__') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What can go wrong if a subclass forgets to call `super().__init__()`?',
          sampleAnswer: 'Parent attributes/invariants may not be set, causing later `AttributeError` or inconsistent state. The bug may appear far from construction, making it harder to debug.'
        },
        {
          prompt: 'Why is `super()` preferred over calling the parent class name directly?',
          sampleAnswer: '`super()` follows the MRO and works correctly in multiple inheritance. Direct calls can skip classes in the MRO and cause duplicated or missing initialization.'
        },
        {
          prompt: 'How would you design constructors in an inheritance tree to minimize bugs?',
          sampleAnswer: 'Keep `__init__` small, pass required parameters explicitly, call `super().__init__` consistently, and avoid heavy work in constructors. For complex setup, use factory methods or separate initialization functions.'
        }
      ]
    };
  }

  if (k === 'oop - has-a vs is-a (when to use what)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Give an example where using inheritance creates a misleading API, and how you’d fix it.',
          sampleAnswer: 'If `class Car(Engine)` then a `Car` “is an Engine” which is nonsense and exposes engine methods as car methods. Fix by composition: `Car` has an `Engine` attribute and delegates only what makes sense.'
        },
        {
          prompt: 'How do you think about code reuse without inheritance?',
          sampleAnswer: 'Use composition, helper modules, strategy objects, higher-order functions, or mixins when behavior is truly orthogonal. Reuse should not force an incorrect type hierarchy.'
        },
        {
          prompt: 'What is the biggest long-term cost of the wrong inheritance choice?',
          sampleAnswer: 'Tight coupling: changing a base class risks breaking many subclasses, and design constraints become hard to undo. You can end up with “inheritance tax” where every change requires careful auditing of overrides.'
        }
      ]
    };
  }

  if (k === 'oop - types of inheritance (overview)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the practical difference between multilevel and hierarchical inheritance?',
          sampleAnswer: 'Multilevel is a chain (`A -> B -> C`). Hierarchical is one base with many children (`Base -> Child1`, `Base -> Child2`). Both can exist together in a project.'
        },
        {
          prompt: 'How would you explain MRO and why developers should care?',
          sampleAnswer: 'MRO is the order Python uses to search base classes for methods/attributes. In multiple inheritance, it determines which method is called and how `super()` chains behave, so it affects correctness and predictability.'
        },
        {
          prompt: 'When can multiple inheritance be acceptable in Python?',
          sampleAnswer: 'For small, behavior-focused mixins that are designed to compose (and cooperate via `super()`). Avoid deep, complex multiple inheritance trees where responsibilities overlap.'
        }
      ]
    };
  }

  if (k === 'oop - single inheritance') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why do many teams prefer single inheritance (or shallow inheritance) as a default?',
          sampleAnswer: 'It’s easier to reason about, avoids MRO complexity, and makes behavior more predictable. Shallow hierarchies are easier to change safely.'
        },
        {
          prompt: 'What’s a good use case for overriding in single inheritance?',
          sampleAnswer: 'Specializing a base behavior while keeping the same contract, e.g., a `Shape.area()` method implemented differently by `Circle` and `Rectangle`, while callers rely on a consistent interface.'
        },
        {
          prompt: 'How do you ensure overrides don’t break expectations?',
          sampleAnswer: 'Keep the same method signature/return expectations, call `super()` when base behavior is required, and test using the base type interface (polymorphic tests).'
        }
      ]
    };
  }

  if (k === 'oop - multilevel inheritance') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What’s the main risk of multilevel inheritance as it grows?',
          sampleAnswer: 'Behavior becomes distributed across many levels, making it harder to predict outcomes and harder to safely modify. A change in a high-level base can have wide impact.'
        },
        {
          prompt: 'How can `super()` help in multilevel hierarchies?',
          sampleAnswer: 'It lets each layer extend behavior while still calling the next implementation up the chain, so invariants and shared setup remain intact.'
        },
        {
          prompt: 'When would you refactor a multilevel hierarchy into composition?',
          sampleAnswer: 'When subclasses are combining orthogonal behaviors (mix-and-match features) or when overrides become extensive and fragile. Composition with strategy objects makes variation explicit and reduces coupling.'
        }
      ]
    };
  }

  if (k === 'oop - hierarchical inheritance') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you keep a base class stable when many subclasses depend on it?',
          sampleAnswer: 'Keep the base small and focused, document invariants and expected override points, avoid adding unrelated features to the base, and test through the base interface using representative subclasses (polymorphic tests).'
        },
        {
          prompt: 'What’s a real-world case where hierarchical inheritance fits well?',
          sampleAnswer: 'UI widgets or shapes: many specialized classes share a common interface (`render`, `area`, etc.) but implement it differently. The key is that they are truly substitutable.'
        },
        {
          prompt: 'What’s one reason composition can still be useful even inside a good inheritance tree?',
          sampleAnswer: 'Because not all variation is along the same axis. If behavior is orthogonal (e.g., “loggable”, “cacheable”), composition or small mixins can be cleaner than forcing everything into the base class.'
        }
      ]
    };
  }

  if (k === 'oop - multiple inheritance (method name conflicts)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you debug a “wrong parent method called” bug in multiple inheritance?',
          sampleAnswer: 'Print the class MRO (`C.mro()` / `C.__mro__`) and check where the method is first defined. That shows exactly why Python picked that implementation.'
        },
        {
          prompt: 'What are two strategies to avoid method name conflicts across mixins?',
          sampleAnswer: '1) Keep mixins small and behavior-focused with carefully chosen method names. 2) Use composition instead of inheritance for shared helpers. Also, ensure cooperative `super()` so methods chain predictably.'
        },
        {
          prompt: 'When is multiple inheritance worth it in Python?',
          sampleAnswer: 'When using mixins that are designed to compose and cooperate via `super()`, providing orthogonal behaviors. Avoid it for large feature inheritance trees with overlapping responsibilities.'
        }
      ]
    };
  }

  if (k === 'oop - hybrid inheritance (why mro matters)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What does the diamond problem look like, and how does Python prevent double-calling a shared base when using `super()` cooperatively?',
          sampleAnswer: 'In a diamond, two parents share a common base. Python’s C3 MRO linearizes the graph so the shared base appears once. With cooperative `super()` calls, each class runs once in MRO order rather than duplicating the base.'
        },
        {
          prompt: 'Why can base class order in `class C(A, B)` matter so much?',
          sampleAnswer: 'Because it influences the MRO, which changes method dispatch and the order of `super()` chaining. That can affect correctness when methods have side effects or initialize state.'
        },
        {
          prompt: 'What’s the “design smell” that suggests hybrid inheritance is getting out of hand?',
          sampleAnswer: 'When you need to constantly inspect MRO to reason about behavior, when overrides and `super()` chains become fragile, or when you see frequent regressions based on base-class order changes.'
        }
      ]
    };
  }

  if (k === 'oop - cyclic inheritance (not supported)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'If Python doesn’t support cyclic inheritance, how do you model cyclic relationships between concepts?',
          sampleAnswer: 'Use composition/references between instances, not inheritance. For example, two objects can reference each other via attributes, or you can use IDs/weakrefs if you need to manage lifetime concerns.'
        },
        {
          prompt: 'Why is a cycle in the inheritance graph fundamentally problematic?',
          sampleAnswer: 'It prevents a consistent method lookup order (no valid linearization), and would create infinite recursion in attribute resolution. Inheritance must be acyclic.'
        },
        {
          prompt: 'What’s a safe refactoring move when you discover a design pushing toward cyclic inheritance?',
          sampleAnswer: 'Split responsibilities: extract shared behavior into a helper object or module, use composition, and make dependencies explicit instead of encoding them in the type hierarchy.'
        }
      ]
    };
  }

  if (k === 'oop - method resolution order (mro) concept') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you explain MRO to someone who understands single inheritance but not multiple inheritance?',
          sampleAnswer: 'With multiple inheritance there are multiple potential parents, so Python needs a consistent order to search for methods. MRO is that order; it explains which method wins and what `super()` calls next.'
        },
        {
          prompt: 'Why is `super()` best thought of as “next in MRO” rather than “parent”?',
          sampleAnswer: 'Because in multiple inheritance there may not be a single parent; `super()` follows the MRO chain. Thinking “parent” leads to incorrect direct base calls and broken cooperative behavior.'
        },
        {
          prompt: 'What kinds of bugs does misunderstanding MRO create?',
          sampleAnswer: 'Wrong method dispatch, skipped initializers, duplicated side effects, and brittle behavior that changes when base-class order changes.'
        }
      ]
    };
  }

  if (k === 'oop - checking mro with .mro() and __mro__') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What does `__mro__` show that’s useful for debugging?',
          sampleAnswer: 'It shows the exact class search order, so you can pinpoint why a particular method implementation is being selected and what `super()` will call next.'
        },
        {
          prompt: 'How can you use MRO to verify cooperative `__init__` calls will run all initializers once?',
          sampleAnswer: 'Inspect the MRO to ensure each class in the chain appears once, then ensure each `__init__` calls `super().__init__` and accepts compatible args. The MRO order becomes the initialization order.'
        },
        {
          prompt: 'What’s a quick sanity test when troubleshooting mixins?',
          sampleAnswer: 'Print `C.mro()` and run a method that builds a trace string using `super()`. If the trace matches the MRO, cooperative chaining is working.'
        }
      ]
    };
  }

  if (k === 'oop - super() basics (call parent behavior)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why is `super()` a good default even in single inheritance?',
          sampleAnswer: 'It keeps the code consistent and future-proofs for refactors (e.g., introducing mixins). It also avoids hard-coding base class names, which can be brittle.'
        },
        {
          prompt: 'What’s the most common `super()` mistake beginners make?',
          sampleAnswer: 'Assuming `super()` always means “my direct parent” and then mixing it with direct base calls. The correct mental model is “next in MRO”.'
        },
        {
          prompt: 'How do you use `super()` in `__init__` safely?',
          sampleAnswer: 'Call `super().__init__(...)` early, pass through required parameters, and keep constructors small. In multiple inheritance, accept `*args, **kwargs` in mixins and forward them.'
        }
      ]
    };
  }

  if (k === 'oop - super() in multiple inheritance (cooperative calls)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What is required for cooperative `super()` chains to work across many classes?',
          sampleAnswer: 'Every class must call `super()` (not direct base calls) and signatures must be compatible (often via `*args, **kwargs`). If one class stops the chain, others won’t run.'
        },
        {
          prompt: 'Why do mixins often implement behavior without owning the whole “contract”?',
          sampleAnswer: 'Mixins typically add orthogonal behavior (logging, validation, caching) and rely on other classes for core semantics. Cooperative `super()` lets each mixin add its layer without hard dependencies.'
        },
        {
          prompt: 'How do you decide the correct base class order for mixins?',
          sampleAnswer: 'Order mixins by how you want their behavior stacked (outer-to-inner). Then validate with MRO and tests. Avoid mixins with overlapping responsibilities or conflicting method names.'
        }
      ]
    };
  }

  if (k === 'oop - important super() notes (common pitfalls)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What are two subtle bugs caused by mixing direct base calls with `super()`?',
          sampleAnswer: 'You can skip classes in the MRO (missing initialization/behavior) or call a shared base twice in diamond patterns (duplicated side effects).'
        },
        {
          prompt: 'What’s a practical way to make mixin constructors “play nice” together?',
          sampleAnswer: 'Use keyword-only configs when possible, accept `*args, **kwargs` in mixins, consume only what you need, and forward the rest to `super().__init__`. Keep `__init__` work minimal.'
        },
        {
          prompt: 'How do you explain why `super()` sometimes calls a sibling mixin rather than the base you expect?',
          sampleAnswer: 'Because `super()` follows the MRO. The “next” class could be another mixin before reaching the concrete base. That’s expected in multiple inheritance and is the core idea of cooperative calls.'
        }
      ]
    };
  }

  if (k === 'oop - part 2 practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Propose a checkpoint exercise that verifies the student understands MRO and cooperative `super()`.',
          sampleAnswer: 'Have them build two mixins that add to a trace string using `super()`, combine them in different orders, print `mro()`, and explain why the output changes. Then add `__init__` with `*args, **kwargs` forwarding and verify each initializer runs once.'
        },
        {
          prompt: 'If a team bans multiple inheritance, what alternatives would you use to compose behavior?',
          sampleAnswer: 'Composition with strategy objects, decorators/wrappers, helper modules/functions, or dependency injection. You can still get layered behavior without MI by explicit delegation.'
        },
        {
          prompt: 'How do you review a PR that introduces mixins for correctness?',
          sampleAnswer: 'Check MRO expectations, ensure all overridden methods call `super()` when needed, confirm signature compatibility, look for name conflicts, and require tests that validate order-dependent behavior.'
        }
      ]
    };
  }

  if (k === 'oop - part 3 overview (polymorphism)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you design for polymorphism without overusing inheritance in Python?',
          sampleAnswer: 'Define the behavior contract first (the methods your code needs). You can express it via a small base class/ABC, a documented protocol, or `typing.Protocol`. Then write code against that interface and add tests that run the same behavior against multiple implementations.'
        },
        {
          prompt: 'What is an example of polymorphism that uses composition rather than inheritance?',
          sampleAnswer: 'Strategy pattern: a `Checkout` object can accept a `pricing_strategy` object with a `price(items)` method. Different strategies implement that method and can be swapped without changing `Checkout`.'
        },
        {
          prompt: 'What’s a red flag that polymorphism has turned into a messy hierarchy?',
          sampleAnswer: 'Many `isinstance` checks, duplicated logic across subclasses, or base classes with unrelated responsibilities. Those often mean the “interface” is unclear and composition would be cleaner.'
        }
      ]
    };
  }

  if (k === 'oop - duck typing ("if it acts like...")') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'EAFP vs LBYL: when would you prefer each in real code?',
          sampleAnswer: 'EAFP is great when the “happy path” is common and failures are exceptional (try the operation, catch `AttributeError`/`KeyError`). LBYL (pre-checks) can be better when you need custom error messages, when exceptions are expensive in tight loops, or when you must avoid triggering side effects.'
        },
        {
          prompt: 'How can you make duck typing more explicit for maintainability?',
          sampleAnswer: 'Use `typing.Protocol` to document the required methods, add runtime validation at boundaries if needed, and write tests that assert the contract (e.g., objects passed into a function implement the expected methods).'
        },
        {
          prompt: 'What’s a good example of “duck typing” already built into Python?',
          sampleAnswer: 'Iteration: anything that implements the iteration protocol (`__iter__` returning an iterator, or `__getitem__` with 0..n indexing) can be used in `for` loops.'
        }
      ]
    };
  }

  if (k === 'oop - duck typing pitfall + safer handling (hasattr)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why can `hasattr` be risky with properties/descriptors?',
          sampleAnswer: 'Accessing an attribute can execute code (property getter). `hasattr` effectively attempts access and can swallow `AttributeError` while letting other exceptions propagate, leading to confusing control flow and hidden bugs.'
        },
        {
          prompt: 'How would you safely call an optional method if it exists?',
          sampleAnswer: 'Fetch it and ensure it’s callable: `m = getattr(obj, "method", None); if callable(m): m()`. For behavior that should work when missing, prefer EAFP: try calling and catch `AttributeError`.'
        },
        {
          prompt: 'How do you prevent duck typing from turning into “anything goes”?',
          sampleAnswer: 'Constrain it with a clear contract at module boundaries, use types/Protocols where helpful, and keep error handling specific. Duck typing is about behavior, not avoiding design.'
        }
      ]
    };
  }

  if (k === 'oop - overloading in python (what exists and what doesn\'t)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you emulate overloaded behavior in a clean, testable way?',
          sampleAnswer: 'Prefer explicit APIs first (separate method names or keyword-only args). If you need multiple call shapes, use defaults/keyword-only and validate inputs. For type-driven dispatch, use `functools.singledispatch` or a manual `isinstance` gate with clear error messages.'
        },
        {
          prompt: 'What’s the difference between `typing.overload` and real runtime dispatch?',
          sampleAnswer: '`typing.overload` helps static type checkers understand multiple call signatures, but at runtime only one implementation exists. Real dispatch must be implemented explicitly.'
        },
        {
          prompt: 'What’s a sign you should not implement overload-like behavior?',
          sampleAnswer: 'If call shapes represent different concepts, the API becomes ambiguous. In that case, create separate functions/methods or require keyword arguments for clarity.'
        }
      ]
    };
  }

  if (k === 'oop - operator overloading (magic methods idea)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why is returning `NotImplemented` better than raising `TypeError` inside `__add__`/`__mul__`?',
          sampleAnswer: 'Returning `NotImplemented` lets Python try the reflected method on the other operand (`__radd__`, `__rmul__`). Only if neither operand supports the operation does Python raise `TypeError`.'
        },
        {
          prompt: 'What are good tests to write for operator overloading?',
          sampleAnswer: 'Test happy-path behavior, mixed-type behavior (including reflected ops), immutability vs in-place ops, error cases, and algebraic expectations when relevant (associativity/commutativity if you claim them).'
        },
        {
          prompt: 'When is operator overloading a bad idea?',
          sampleAnswer: 'When the operator meaning is domain-unclear, when it hides expensive operations, or when it makes debugging harder than an explicit method call would.'
        }
      ]
    };
  }

  if (k === 'oop - overload + for custom objects (__add__)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you handle adding different types (e.g., vector + vector vs vector + scalar)?',
          sampleAnswer: 'Be explicit about supported combinations. If you support both, define clear rules, return `NotImplemented` for unsupported types, and add `__radd__` if you want the reversed order. Avoid “guessing” behavior that could surprise users.'
        },
        {
          prompt: 'What’s the difference between `__add__` and `__iadd__`?',
          sampleAnswer: '`__add__` implements `+` and typically returns a new object. `__iadd__` implements `+=` and may mutate in place (or fall back to `__add__` if not defined).'
        },
        {
          prompt: 'How would you make `sum([vectors])` work?',
          sampleAnswer: 'Implement `__radd__` so that `0 + vector` is handled (commonly by returning `self` when the other operand is 0), or pass a start value to sum: `sum(vectors, Vector2D(0,0))`.'
        }
      ]
    };
  }

  if (k === 'oop - overload comparisons (__gt__, __le__)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you decide what it means to compare two custom objects?',
          sampleAnswer: 'Pick a single, documented ordering key (e.g., volume, timestamp, priority). Comparisons should be consistent with equality (if `a == b`, neither should be `<` the other). If no natural ordering exists, consider not implementing ordering at all.'
        },
        {
          prompt: 'Why can mixed-type comparisons be tricky in Python 3?',
          sampleAnswer: 'Python 3 generally disallows ordering comparisons between unrelated types by default. Your custom comparisons should return `NotImplemented` for unsupported types so Python can fail correctly rather than inventing an arbitrary order.'
        },
        {
          prompt: 'What’s a clean way to avoid writing repetitive comparison code?',
          sampleAnswer: 'Use `functools.total_ordering` with `__eq__` and `__lt__`, or compare by a key: `return self.key() < other.key()` and keep the key logic centralized.'
        }
      ]
    };
  }

  if (k === 'oop - overload * across two classes (__mul__)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When should you implement `__rmul__`?',
          sampleAnswer: 'When you want `other * self` to work for mixed types (e.g., scalar-left multiplication). It’s also important when the left operand is a built-in type that doesn’t know how to multiply your custom type.'
        },
        {
          prompt: 'How do you avoid ambiguous meanings for `*` (scale vs dot product vs repetition)?',
          sampleAnswer: 'Pick one meaning per operator and expose others as named methods (`dot`, `scale`, `repeat`). Ambiguity is a strong reason to avoid overloading `*` beyond one clear operation.'
        },
        {
          prompt: 'What’s the correct behavior when multiplication is not supported for the operand type?',
          sampleAnswer: 'Return `NotImplemented` so Python can try the reflected method or raise `TypeError` consistently.'
        }
      ]
    };
  }

  if (k === 'oop - method overloading: not supported (what happens)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you explain to a Java/C++ developer why “overloaded methods” don’t work in Python?',
          sampleAnswer: 'Python binds a name to a single function object. A second `def` with the same name just reassigns that name, replacing the previous function. There’s no built-in dispatch table keyed by signatures.'
        },
        {
          prompt: 'What’s a clean error-handling approach when accepting multiple call shapes via `*args`?',
          sampleAnswer: 'Validate early and raise a clear `TypeError` with a helpful message showing supported forms. Avoid silent behavior changes that mask incorrect calls.'
        },
        {
          prompt: 'When would you use `singledispatch` instead of `isinstance` checks?',
          sampleAnswer: 'When you want extensibility: new types can register their own implementation without editing a central `if/elif` ladder. It keeps code open for extension and easier to test.'
        }
      ]
    };
  }

  if (k === 'oop - handling "method overloading" needs (defaults, *args)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you design a function to support multiple forms while keeping it readable?',
          sampleAnswer: 'Prefer keyword-only args for optional features, use defaults for simple variations, and limit the number of valid call shapes. If complexity grows, split into separate functions or use a small argument object (dataclass) to make intent explicit.'
        },
        {
          prompt: 'What’s the biggest maintainability risk of heavy `*args/**kwargs` APIs?',
          sampleAnswer: 'They become self-documentation-hostile: readers can’t easily tell what’s supported, and errors surface late. Use them sparingly and validate inputs with clear error messages.'
        },
        {
          prompt: 'How do you combine overload-like needs with type hints effectively?',
          sampleAnswer: 'Use `typing.overload` to document valid call signatures for type checkers, then implement one runtime function that handles those forms with clear validation.'
        }
      ]
    };
  }

  if (k === 'oop - constructor overloading: not supported (workarounds)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you design constructors so the “main” `__init__` stays simple?',
          sampleAnswer: 'Keep `__init__` focused on assigning validated fields. For alternate inputs (dict/JSON/file/env), use `@classmethod` constructors (`from_dict`, `from_json`, `from_file`) that parse and then call `cls(...)`. This separates parsing from object initialization.'
        },
        {
          prompt: 'When would `*args/**kwargs` in `__init__` be justified, and what\'s the risk?',
          sampleAnswer: 'It\'s justified for flexible wrappers, frameworks, or cooperative multiple inheritance patterns. The risk is unclear API, late failures, and silently ignored arguments unless you validate aggressively.'
        },
        {
          prompt: 'How do you make alternative constructors type-safe and discoverable?',
          sampleAnswer: 'Use clear method names, docstrings, and type hints; optionally provide `@overload` signatures for the classmethod. Keep parsing errors explicit and include examples in tests/docs.'
        }
      ]
    };
  }

  if (k === 'oop - method overriding (child replaces behavior)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What does “Liskov Substitution Principle” mean in practical Python override terms?',
          sampleAnswer: 'If code expects the base type, substituting a subclass should not break correctness. Practically: keep method meaning consistent, don\'t narrow accepted inputs unexpectedly, and don\'t violate base invariants.'
        },
        {
          prompt: 'How can you safely extend behavior in an override without duplicating base logic?',
          sampleAnswer: 'Call `super()` and add extra steps before/after, or factor shared logic into a protected helper method. Write tests that run the same scenarios against base and subclass behavior.'
        },
        {
          prompt: 'What are “fragile base class” problems and how do you reduce them?',
          sampleAnswer: 'Changes in the base can subtly break subclasses. Reduce by keeping bases small, documenting extension points, preferring composition for orthogonal behavior, and writing integration tests covering multiple subclasses.'
        }
      ]
    };
  }

  if (k === 'oop - using super() inside an overridden method') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why do teams sometimes require `super()` in overrides even in single inheritance?',
          sampleAnswer: 'Consistency and future-proofing: refactors that introduce mixins or reorder bases won\'t require rewriting direct base calls. It also avoids hard-coding base class names.'
        },
        {
          prompt: 'How do you debug a bug where `super()` appears to call an unexpected method?',
          sampleAnswer: 'Print the class MRO (`C.mro()` / `C.__mro__`) and trace which class defines the method. Remember: `super()` means “next in MRO”, not “my direct parent”.'
        },
        {
          prompt: 'What\'s a safe pattern for cooperative methods with extra parameters?',
          sampleAnswer: 'Use keyword arguments and `*args/**kwargs` forwarding in mixins, consume only what you need, and forward the rest to `super()`. Validate required args in the concrete leaf class.'
        }
      ]
    };
  }

  if (k === 'oop - constructor overriding + calling parent constructor') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When should you call `super().__init__()` first vs last in a subclass constructor?',
          sampleAnswer: 'Call it early when the base sets required invariants or allocates resources needed by subclass logic. Call it later only if the base depends on subclass-prepared state (rare and should be documented). In cooperative MI, call `super().__init__` and forward args.'
        },
        {
          prompt: 'How do you handle constructors with many optional knobs without making `__init__` unreadable?',
          sampleAnswer: 'Use keyword-only parameters with defaults, group related options into small config objects (dataclasses), and/or provide multiple named classmethods for common cases. Keep validation centralized.'
        },
        {
          prompt: 'What is a subtle bug with multiple inheritance constructors?',
          sampleAnswer: 'Skipping `super()` breaks the cooperative chain and some base initializers never run; or mixing direct base calls can double-initialize shared bases in a diamond.'
        }
      ]
    };
  }

  if (k === 'oop - part 3 practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Design a small exercise that demonstrates duck typing without `isinstance` checks.',
          sampleAnswer: 'Ask the candidate to implement `def render_all(items):` that calls `item.render()` on each object. Provide two unrelated classes that implement `render()`. Use EAFP to handle missing `render` with a clear error message.'
        },
        {
          prompt: 'How would you review a PR that adds operator overloading to a domain model?',
          sampleAnswer: 'Check semantics for least surprise, ensure `NotImplemented` is returned for unsupported types, ensure reflected ops exist when needed, and require tests for edge cases and mixed types. Verify it doesn\'t hide expensive operations.'
        },
        {
          prompt: 'What\'s a sign an OO design should shift from inheritance to composition?',
          sampleAnswer: 'Many overrides that completely replace base behavior, lots of `super()` calls with conditionals, or a hierarchy that mixes unrelated features. Composition makes dependencies explicit and reduces coupling.'
        }
      ]
    };
  }

  if (k === 'oop - part 4 overview (abc, interfaces, access conventions)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do ABCs differ from “just raising NotImplementedError” in a base class?',
          sampleAnswer: 'ABCs can enforce the contract at instantiation time (TypeError if abstract methods remain), provide clearer intent, and integrate with tooling. `NotImplementedError` is a runtime failure only when the method is called.'
        },
        {
          prompt: 'When would you choose `typing.Protocol` over an ABC?',
          sampleAnswer: 'When you want structural typing (any object with the right methods) without inheritance, and you primarily need static type checking rather than runtime enforcement.'
        },
        {
          prompt: 'How would you explain Python\'s “private” (`__name`) vs “protected” (`_name`) to a beginner?',
          sampleAnswer: '`_name` is a convention: “internal, don\'t touch”. `__name` triggers name mangling to reduce accidental overrides in subclasses, but it\'s still accessible if you know the mangled name. Neither is strict access control.'
        }
      ]
    };
  }

  if (k === 'oop - abstract methods (contract without implementation)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What\'s the biggest benefit of `@abstractmethod` in a large team codebase?',
          sampleAnswer: 'It makes required methods explicit and fails fast when someone forgets to implement them, reducing runtime surprises and making plugin/adapter systems safer.'
        },
        {
          prompt: 'Can an abstract method have an implementation? When would you do that?',
          sampleAnswer: 'Yes. You can mark a method abstract but still provide a default implementation to be called via `super()`. This can be useful for shared validation or logging while still requiring subclasses to override.'
        },
        {
          prompt: 'How do you test ABC contracts?',
          sampleAnswer: 'Test that incomplete subclasses fail to instantiate (TypeError), and that concrete implementations satisfy the contract via behavioral tests that run the same suite against multiple implementations.'
        }
      ]
    };
  }

  if (k === 'oop - abstract class (partial implementation)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Give a real-world example where an abstract class (not a pure interface) is the right tool.',
          sampleAnswer: 'Base HTTP client/adapter: shared retry/backoff/logging lives in the abstract base, while subclasses implement transport-specific details (requests vs aiohttp) via a small abstract method.'
        },
        {
          prompt: 'What\'s the risk of putting too much logic into the abstract base class?',
          sampleAnswer: 'Subclasses become tightly coupled to base internals (fragile base class). It becomes hard to change or to support alternative implementations. Keep bases small and extension points clear.'
        },
        {
          prompt: 'How do you structure an abstract base class to be easy to extend?',
          sampleAnswer: 'Provide small, well-named abstract hooks, keep concrete methods thin, document invariants, and avoid depending on subclass state that isn\'t guaranteed to exist.'
        }
      ]
    };
  }

  if (k === 'oop - interface concept in python (abc with only abstract methods)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'If Python doesn\'t have interfaces, how do you still get interface-like guarantees?',
          sampleAnswer: 'Use ABCs with `@abstractmethod` for runtime enforcement, and/or `typing.Protocol` + static type checking for structural typing. Combine with tests to ensure behavior.'
        },
        {
          prompt: 'What\'s a common misuse of ABC “interfaces” in Python?',
          sampleAnswer: 'Using inheritance purely for “type membership” when composition or protocols would be cleaner, or forcing unrelated implementations into a deep inheritance hierarchy.'
        },
        {
          prompt: 'How do you design an interface so it stays stable over time?',
          sampleAnswer: 'Keep it minimal, version it carefully, add new methods with defaults or separate optional capabilities, and avoid breaking changes. Prefer small, composable interfaces over one huge contract.'
        }
      ]
    };
  }

  if (k === 'oop - concrete vs abstract vs interface (quick guide)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you decide between a concrete base class, an abstract base class, and a Protocol?',
          sampleAnswer: 'Concrete base: when you want shared code and a natural “is-a” relationship. Abstract base: when you want shared code plus enforced required methods. Protocol: when you want structural typing without inheritance, mainly for type checking.'
        },
        {
          prompt: 'Why can “just make a base class” be worse than an interface/Protocol?',
          sampleAnswer: 'It couples implementers to base behavior and initialization, can force awkward inheritance, and makes alternative implementations harder. Contracts are often better expressed as small interfaces.'
        },
        {
          prompt: 'What tests give you confidence that a contract is respected?',
          sampleAnswer: 'A shared behavioral test suite that runs against every implementation (real or fake). For ABCs, also test instantiation failures for incomplete implementations.'
        }
      ]
    };
  }

  if (k === 'oop - public, protected, private (python conventions)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How does Python handle public/protected/private? Contrast conventions with enforcement.',
          sampleAnswer: 'Python doesn\'t enforce access modifiers. Public is the default. A single underscore (e.g., `_x`) is a convention meaning “internal/protected”. A double underscore (e.g., `__x`) triggers name mangling to `_ClassName__x`, which helps avoid accidental name clashes in subclasses. None of these are true security boundaries.'
        },
        {
          prompt: 'What is name mangling? Show how you\'d confirm it at runtime.',
          sampleAnswer: 'For `__x` defined in class `A`, Python stores it as `_A__x`. You can confirm by printing `obj.__dict__` or using `dir(obj)` and seeing `_A__x`. Attempting to access `obj.__x` will fail, but `obj._A__x` works.'
        },
        {
          prompt: 'When would you avoid using `__private` attributes?',
          sampleAnswer: 'When the class is intended for easy subclassing, testing, or public consumption. Name mangling can make extension and mocking awkward. In many cases `_internal` plus a documented public API is cleaner.'
        }
      ]
    };
  }

  if (k === 'oop - protected members example (convention only)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What does a single underscore communicate to other developers? Does it change runtime behavior?',
          sampleAnswer: 'It communicates intent: “this is internal, don\'t rely on it”. It doesn\'t change runtime behavior; the attribute is fully accessible. Enforcement is done via conventions, reviews, and documentation.'
        },
        {
          prompt: 'How do you design a class so consumers don\'t need to touch internal attributes?',
          sampleAnswer: 'Expose small, stable public methods/properties that enforce invariants and hide representation. Keep mutable state internal (often prefixed with `_`) and provide operations like `deposit()` rather than letting callers mutate `_balance` directly.'
        },
        {
          prompt: 'Give one example where “protected” members are still useful in Python.',
          sampleAnswer: 'In frameworks or base classes where subclasses need extension points. You can provide `_validate()` or `_compute()` methods for subclasses to override while keeping the public API stable.'
        }
      ]
    };
  }

  if (k === 'oop - private members (name mangling) + how it works') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why does Python mangle `__name`? What problem is it solving?',
          sampleAnswer: 'It reduces accidental name collisions, especially across inheritance. If a base class uses `__x` and a subclass also defines `__x`, they become `_Base__x` and `_Sub__x` rather than clobbering each other.'
        },
        {
          prompt: 'Can you still access a mangled attribute? Should you?',
          sampleAnswer: 'Yes: `obj._ClassName__attr`. You generally shouldn\'t from outside the class unless you\'re debugging or doing controlled introspection, because it couples you to implementation details.'
        },
        {
          prompt: 'How does name mangling affect subclass overrides?',
          sampleAnswer: 'If you define `__x` in both base and subclass, they don\'t override each other—they become different attributes. That\'s useful for avoiding collisions, but it can surprise people expecting a normal override.'
        }
      ]
    };
  }

  if (k === 'oop - __str__() (human-readable object printing)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What is the purpose of `__str__` and when is it called?',
          sampleAnswer: '`__str__` returns a human-friendly string for an instance. It\'s used by `str(obj)` and `print(obj)`, and often in f-strings like `f"{obj}"`.'
        },
        {
          prompt: 'If you had to choose only one to implement, `__str__` or `__repr__`, which would you pick and why?',
          sampleAnswer: 'Usually `__repr__`, because `__str__` can fall back to it. A good `__repr__` helps debugging everywhere, including in containers and interactive sessions.'
        },
        {
          prompt: 'What makes a bad `__str__` implementation?',
          sampleAnswer: 'One that hides important information, is ambiguous, or is expensive/side-effectful. `__str__` should be fast, deterministic, and not mutate state.'
        }
      ]
    };
  }

  if (k === 'oop - __repr__() and str() vs repr()') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain `str()` vs `repr()` with a concrete example.',
          sampleAnswer: '`str(obj)` is for end users; `repr(obj)` is for developers. For example, a datetime might show `2026-02-18 10:00` for `str`, but `datetime.datetime(2026, 2, 18, 10, 0)` for `repr`.'
        },
        {
          prompt: 'What\'s the “eval-able repr” guideline and when is it realistic?',
          sampleAnswer: 'The idea is that `repr(obj)` should ideally be something you could `eval()` to recreate the object. It\'s realistic for simple value objects, but for complex objects it\'s enough to be unambiguous and informative.'
        },
        {
          prompt: 'How do containers (lists/dicts) typically display their elements?',
          sampleAnswer: 'They use `repr()` of the contained objects, which is why a good `__repr__` matters for debugging collections.'
        }
      ]
    };
  }

  if (k === 'oop - mini project: banking app (account + savings/current)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you model the bank account mini-project with OOP? Outline your classes and methods.',
          sampleAnswer: 'I\'d start with an `Account` base class storing balance as internal state, exposing methods like `deposit`, `withdraw`, and `get_balance`. Then `SavingsAccount` and `CurrentAccount` can inherit and override only the rules that differ—like withdrawal limits, minimum balance, interest calculation, or overdraft policy.'
        },
        {
          prompt: 'What invariants and error handling would you include?',
          sampleAnswer: 'Reject non-positive amounts, prevent invalid state transitions (like going below minimum balance), and raise clear exceptions for insufficient funds. I\'d also ensure state updates are consistent—update balance once after validation.'
        },
        {
          prompt: 'How would you test this mini-project?',
          sampleAnswer: 'Unit tests for `deposit/withdraw` behaviors (happy path + invalid inputs), tests for subclass-specific rules, and a few integration-style scenarios (multiple operations). Tests should interact through the public API rather than poking internal balance.'
        }
      ]
    };
  }

  if (k === 'oop - part 4 practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Checkpoint: What\'s the value of abstract base classes in Python if duck typing exists?',
          sampleAnswer: 'ABCs make contracts explicit and catch errors early. They\'re helpful for larger teams/codebases: you can enforce required methods, document intent, and provide shared behavior while still supporting duck typing where appropriate.'
        },
        {
          prompt: 'If you see a class exposing many public fields, what design concerns come to mind?',
          sampleAnswer: 'It can leak representation and make invariants hard to enforce. I\'d prefer a small public API with methods/properties that validate changes and keep internal state private-by-convention.'
        },
        {
          prompt: 'Describe one example where you would intentionally use a single underscore attribute in a public library.',
          sampleAnswer: 'For subclass extension points: e.g., a public method `run()` that calls an internal hook `_step()` that advanced users can override, while typical users never touch it.'
        }
      ]
    };
  }

  if (k === 'logging - introduction (why logging exists)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why is structured logging important in production systems?',
          sampleAnswer: 'Because it makes issues diagnosable: you can filter by severity, correlate events, and keep a durable record. Logging frameworks let you route logs to files or central systems and standardize formatting, which `print()` can\'t do well.'
        },
        {
          prompt: 'How do you decide what level to log an event at?',
          sampleAnswer: 'DEBUG for detailed internals, INFO for normal milestones, WARNING for unexpected but recoverable situations, ERROR for failures of an operation, and CRITICAL for system-wide emergencies. The choice should reflect actionability and urgency.'
        },
        {
          prompt: 'What should you avoid logging?',
          sampleAnswer: 'Secrets and sensitive personal data (tokens, passwords, full credit card numbers). Also avoid huge payload dumps unless gated behind debug and carefully sanitized.'
        }
      ]
    };
  }

  if (k === 'logging - levels and defaults') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What are the standard logging levels in Python and what is the default behavior?',
          sampleAnswer: 'DEBUG, INFO, WARNING, ERROR, CRITICAL. The root logger defaults to WARNING, so INFO/DEBUG won\'t show unless configured.'
        },
        {
          prompt: 'A developer says “my DEBUG logs don\'t print.” What do you check first?',
          sampleAnswer: 'Check configuration: the logger level and handler level thresholds, and whether `basicConfig` was called. Also check whether another module configured logging earlier, preventing your later `basicConfig` from taking effect.'
        },
        {
          prompt: 'How does logger hierarchy affect log emission?',
          sampleAnswer: 'Loggers are hierarchical by name (e.g., `app.db`). Records propagate to parent handlers by default. Levels and handlers at each point can filter output, so you need to consider both the logger and its parents.'
        }
      ]
    };
  }

  if (k === 'logging - basicconfig(): write logs to a file') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Show how you\'d configure Python logging to write INFO+ logs to a file with timestamps.',
          sampleAnswer: 'Use `logging.basicConfig(filename="app.log", level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")` at startup, then call `logging.getLogger(__name__)` and log via `logger.info(...)` etc.'
        },
        {
          prompt: 'What are common pitfalls with `basicConfig`?',
          sampleAnswer: 'Calling it after logging has already been configured (it may do nothing), calling it multiple times expecting changes, and forgetting that default level filters out DEBUG/INFO. Also, mixing root logging with custom handlers can create duplicates if propagation isn\'t considered.'
        },
        {
          prompt: 'If you need log rotation, is `basicConfig` enough?',
          sampleAnswer: 'Usually no—you\'d use handlers like `RotatingFileHandler` or `TimedRotatingFileHandler` for rotation, because `basicConfig` is a simple one-shot setup.'
        }
      ]
    };
  }

  if (k === 'logging - append vs overwrite (filemode)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Explain append vs overwrite for log files. When would you choose each?',
          sampleAnswer: 'Append keeps history across runs and is the default; overwrite truncates the file each run, which can be useful for short-lived scripts or demo runs where you want a clean log. In production, you typically append and rely on rotation/retention for file management.'
        },
        {
          prompt: 'A dev set `filemode="w"` and later couldn\'t debug an incident. What went wrong and what would you do instead?',
          sampleAnswer: 'They lost history because each restart wiped the file. Instead, append (`a`) and implement rotation via `RotatingFileHandler`/`TimedRotatingFileHandler`, or ship logs to a central system so restarts don\'t erase evidence.'
        },
        {
          prompt: 'Where does `filemode` apply: logger, handler, or file itself?',
          sampleAnswer: 'It\'s a handler/file-opening concern: it controls how the file is opened (append vs write/truncate). In `basicConfig`, it affects the file handler created under the hood.'
        }
      ]
    };
  }

  if (k === 'logging - console logging (no filename)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Describe what happens when you call `basicConfig` without `filename`. Where do records go?',
          sampleAnswer: 'Logging configures a `StreamHandler`, so records go to the console (typically stderr). You still need to set `level` if you want INFO/DEBUG output.'
        },
        {
          prompt: 'A script logs to console locally but not in a deployed environment. What are a few things you would check?',
          sampleAnswer: 'Check the effective level (root/logger/handler), whether another module configured logging first, and whether the runtime captures stderr/stdout. Also check if the environment redirects streams or uses a process manager that handles logs differently.'
        },
        {
          prompt: 'Why is configuring logging in multiple imported modules problematic?',
          sampleAnswer: 'Because logging is global and `basicConfig` is effectively one-shot; multiple modules can fight over handlers/levels and create duplicates. It\'s better to configure once in the entry point.'
        }
      ]
    };
  }

  if (k === 'logging - formatting log messages (format=...)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'What makes a log format “good” for debugging distributed systems?',
          sampleAnswer: 'Consistency and context: timestamp, severity, logger/module name, and an actionable message. If possible include correlation IDs (request/user) and keep the format stable so you can search and parse logs.'
        },
        {
          prompt: 'Explain the difference between formatting in the logger call vs in the handler/formatter.',
          sampleAnswer: 'You should log structured parameters (e.g., `logger.info("x=%s", x)`) and let the logging system format when emitting. The handler\'s Formatter controls the final output shape and can include metadata like time, module name, etc.'
        },
        {
          prompt: 'How would you avoid expensive string building for debug logs?',
          sampleAnswer: 'Use logging\'s lazy formatting (`logger.debug("val=%s", val)`) and ensure the logger level filters DEBUG in production. Avoid building huge f-strings or serializing large objects when DEBUG is disabled.'
        }
      ]
    };
  }

  if (k === 'logging - timestamps and datefmt') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How do you include timestamps in logs and customize their format?',
          sampleAnswer: 'Include `%(asctime)s` in the formatter and set `datefmt` to a strftime pattern like `%Y-%m-%d %H:%M:%S`. You can do this via `basicConfig` or by creating a `Formatter` explicitly.'
        },
        {
          prompt: 'What\'s a common timestamp-related pitfall when debugging issues across services?',
          sampleAnswer: 'Time zone/clock differences. Without a consistent timezone (often UTC) and synchronized clocks, correlating events is hard. Using a consistent format and timezone across services helps.'
        },
        {
          prompt: 'Where does `asctime` come from in a log record?',
          sampleAnswer: 'It\'s derived from the LogRecord creation time (`record.created`) and formatted by the formatter when rendering the record.'
        }
      ]
    };
  }

  if (k === 'logging - writing exceptions to the log (logging.exception)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When should you use `logger.exception` vs `logger.error(..., exc_info=True)`?',
          sampleAnswer: '`logger.exception` is a convenience inside an `except` block: it logs at ERROR and includes the active traceback. `logger.error(..., exc_info=True)` is more explicit and can be used similarly, but you must pass `exc_info=True`.'
        },
        {
          prompt: 'Why is logging the traceback valuable compared to just logging the exception message?',
          sampleAnswer: 'The traceback shows the call path and line numbers, which is often the fastest way to locate the real root cause. The exception message alone can be ambiguous.'
        },
        {
          prompt: 'What security concern should you keep in mind when logging exceptions?',
          sampleAnswer: 'Exceptions can include sensitive data (inputs, tokens, filenames). You should sanitize messages and avoid logging secrets/PII, especially in production logs.'
        }
      ]
    };
  }

  if (k === 'logging - root logger pitfalls (why custom loggers)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why is the root logger a frequent source of duplicate or missing logs?',
          sampleAnswer: 'Because configuration is global and handlers can be added multiple times. Missing logs happen when levels/handlers filter records. Duplicates happen when a logger has handlers and also propagates to root handlers.'
        },
        {
          prompt: 'Describe a clean logging strategy for a multi-module application.',
          sampleAnswer: 'Configure logging once in the entry point (handlers, formats, levels). In modules, create `logger = logging.getLogger(__name__)` and emit logs. Avoid calling `basicConfig` in modules/libraries.'
        },
        {
          prompt: 'How would you temporarily increase verbosity for just one module?',
          sampleAnswer: 'Set the level on that module\'s named logger (e.g., `logging.getLogger("app.db").setLevel(logging.DEBUG)`) or adjust handler filters for that logger only.'
        }
      ]
    };
  }

  if (k === 'logging - logger/handler/formatter (advanced logging model)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Walk through the lifecycle of a log message from `logger.info(...)` to output.',
          sampleAnswer: 'The logger creates a LogRecord, checks its level, then passes it to attached handlers (and optionally propagates to parents). Each handler can filter by level and then uses its Formatter to render the record and emit to its destination.'
        },
        {
          prompt: 'How do logger level and handler level interact?',
          sampleAnswer: 'Both can filter: if the logger level blocks a record, handlers never see it. Even if the logger allows it, a handler can still drop it if its own level is higher.'
        },
        {
          prompt: 'Why might you set `propagate=False` on a logger?',
          sampleAnswer: 'To prevent the record from being handled again by parent/root handlers, which avoids duplicates when you attach dedicated handlers to a specific logger.'
        }
      ]
    };
  }

  if (k === 'logging - console handler demo (streamhandler)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'When would you create a StreamHandler manually instead of relying on `basicConfig`?',
          sampleAnswer: 'When you want more control: multiple handlers, different formats/levels, routing to stdout vs stderr, or attaching handlers to specific named loggers.'
        },
        {
          prompt: 'How would you send logs to stdout rather than stderr?',
          sampleAnswer: 'Create `logging.StreamHandler(sys.stdout)` and attach it, then set a formatter/level as needed. By default, StreamHandler uses stderr if no stream is provided.'
        },
        {
          prompt: 'What would you do if you see each log line printed twice?',
          sampleAnswer: 'Check handler duplication and propagation. Ensure you don\'t add handlers multiple times, and set `logger.propagate=False` when using custom handlers alongside root.'
        }
      ]
    };
  }

  if (k === 'logging - filehandler and multiple handlers (console + file)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you configure different log levels for console vs file output?',
          sampleAnswer: 'Keep the logger at the lowest needed level (e.g., DEBUG), then set handler levels independently: console INFO, file DEBUG. Attach both handlers with appropriate formatters.'
        },
        {
          prompt: 'What\'s a common mistake when adding a FileHandler that results in no file output?',
          sampleAnswer: 'Forgetting to attach the handler to the logger, or filtering it out with level settings (logger or handler). Also, relative paths can write to an unexpected working directory.'
        },
        {
          prompt: 'Why might you want different formats for console and file logs?',
          sampleAnswer: 'Console logs should be compact and readable; file logs can include richer context (timestamps, module, thread/process) for later forensics.'
        }
      ]
    };
  }

  if (k === 'logging - different modules, different log files') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How can you route logs from module A to `a.log` and module B to `b.log`?',
          sampleAnswer: 'Create separate named loggers (e.g., `app.a` and `app.b`), attach separate FileHandlers to each, and typically set `propagate=False` so records don\'t also go to shared parent handlers.'
        },
        {
          prompt: 'How would you keep shared “app-wide” logs while still having module-specific files?',
          sampleAnswer: 'Attach a shared handler higher in the hierarchy (or root) for app-wide output, and attach module-specific handlers to particular loggers. Then decide whether to propagate based on whether you want duplication.'
        },
        {
          prompt: 'What\'s a good way to debug logger routing problems?',
          sampleAnswer: 'Inspect logger names and the handler chain: check `logger.handlers`, `logger.level`, `logger.propagate`, parent loggers, and handler levels/formatters. Duplicates or missing output usually come from propagation and filtering.'
        }
      ]
    };
  }

  if (k === 'logging - generic custom logger helper (shared setup)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Design a reusable `get_logger(__name__)` helper. What responsibilities should it have, and what should it avoid doing?',
          sampleAnswer: 'It should create/return a named logger, attach handlers/formatters once (idempotent), set appropriate levels, and decide on propagation to avoid duplicates. It should avoid reconfiguring global/root logging on every call and avoid adding handlers repeatedly.'
        },
        {
          prompt: 'A team reports duplicate log lines after adopting a logger helper. What are the most likely causes?',
          sampleAnswer: 'The helper adds handlers multiple times (called repeatedly across imports) or the logger propagates to root which also has handlers. Fix by guarding handler creation (`if not logger.handlers`) and/or setting `propagate=False`, and ensuring configuration is applied once.'
        },
        {
          prompt: 'Should a library package ship with a logger helper that configures handlers? Why or why not?',
          sampleAnswer: 'Usually no—libraries should emit logs via named loggers but not configure handlers globally, because that overrides the application\'s logging strategy. If a helper exists, it should be optional or only used by applications.'
        }
      ]
    };
  }

  if (k === 'logging - separate log file per caller (dynamic file name)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you implement “different modules write to different log files” without brittle stack inspection?',
          sampleAnswer: 'Use named loggers per module (from `__name__`) and attach FileHandlers based on the logger name. For example, `app.db` attaches `db.log`, `app.api` attaches `api.log`. Control duplication using propagation rules.'
        },
        {
          prompt: 'What risks do you consider when generating log filenames dynamically?',
          sampleAnswer: 'Path traversal and unsafe filenames if derived from untrusted input, unexpected working directories with relative paths, and file descriptor growth if you create handlers per request/user. Prefer a controlled mapping and sanitize names.'
        },
        {
          prompt: 'How would you keep “module-specific” logs while still preserving a single aggregated app log?',
          sampleAnswer: 'Attach a shared handler at the root (or a high-level parent logger) for aggregated logs and also attach module-specific handlers. Then decide whether to propagate so you intentionally get duplication (aggregate + specific) or not.'
        }
      ]
    };
  }

  if (k === 'logging - move configuration out of code (fileconfig + dictconfig)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `fileConfig` vs `dictConfig`. When would you choose each?',
          sampleAnswer: '`fileConfig` uses INI-style config and is simple for basic setups. `dictConfig` is more flexible (nested structures, programmatic generation, easy JSON/YAML). In modern apps, `dictConfig` is common because it\'s explicit and composable.'
        },
        {
          prompt: 'What is `disable_existing_loggers` and why can it break apps?',
          sampleAnswer: 'In dictConfig, it can disable loggers that already exist (including those from libraries), causing logs to disappear. If you set it incorrectly, you might unintentionally silence important logs.'
        },
        {
          prompt: 'How do you roll out environment-specific logging safely?',
          sampleAnswer: 'Keep configuration in files per environment, validate configs in CI, and make sure production defaults are sensible (INFO/WARNING). Avoid debug verbosity in production, and ensure sensitive data is not logged.'
        }
      ]
    };
  }

  if (k === 'logging - practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Checkpoint: describe a logging setup for a web app that is debuggable locally but safe in production.',
          sampleAnswer: 'Configure once in the entry point. Locally: DEBUG to file, INFO to console, rich format with timestamps and module names. In production: INFO/WARNING to stdout (or central logging), rotation/retention, and strict avoidance of secrets/PII. Modules only use named loggers.'
        },
        {
          prompt: 'Given “missing logs” in production, what\'s your debugging checklist?',
          sampleAnswer: 'Check effective levels (logger + handler), whether handlers are attached, whether propagation is correct, whether `dictConfig` disabled existing loggers, and whether the runtime captures stdout/stderr or writes to an expected path.'
        },
        {
          prompt: 'How would you teach a teammate to choose log levels consistently?',
          sampleAnswer: 'Agree on a policy: DEBUG for internals, INFO for expected milestones, WARNING for unusual recoverable states, ERROR for failed operations, CRITICAL for system-wide emergencies. Review examples and ensure levels match actionability and alerting.'
        }
      ]
    };
  }

  if (k === 'logging - generic custom logger helper (shared setup)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why do teams often build a shared “logger helper” module instead of configuring logging in every file?',
          sampleAnswer: 'To keep configuration consistent (handlers, formats, levels) and avoid duplication. A helper can be idempotent so calling it from many modules doesn\'t add handlers repeatedly, which prevents duplicate log lines and “who configured logging first?” issues.'
        },
        {
          prompt: 'What\'s a safe way to make a logger helper idempotent?',
          sampleAnswer: 'Check whether handlers already exist (`if logger.handlers:`), or set an internal flag like `logger._configured = True` after first setup. Also be careful with propagation to root to prevent double-handling.'
        },
        {
          prompt: 'How would you design the helper differently for a library vs an application?',
          sampleAnswer: 'Libraries should avoid adding handlers or calling `basicConfig` and should just emit through named loggers. Applications own configuration (handlers/format/levels). A library helper might only return `getLogger(__name__)`.'
        }
      ]
    };
  }

  if (k === 'logging - separate log file per caller (dynamic file name)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'How would you route each module\'s logs to a different file without stack inspection?',
          sampleAnswer: 'Use named loggers derived from `__name__` and attach a FileHandler per logger, mapping dots to underscores for filenames (e.g., `app_db.log`). This keeps routing explicit and stable.'
        },
        {
          prompt: 'What risks come with “one file per caller/module”?',
          sampleAnswer: 'You can create too many files, make searching harder, and run into permissions/path issues. In production you may prefer a shared file with structured fields or centralized log aggregation instead.'
        },
        {
          prompt: 'If logs are missing from a module-specific file, what would you check first?',
          sampleAnswer: 'Check logger/handler levels, whether the FileHandler was attached, whether propagation is misconfigured, and whether the process\'s working directory/path points to where you expect the file to be created.'
        }
      ]
    };
  }

  if (k === 'logging - move configuration out of code (fileconfig + dictconfig)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Compare `fileConfig` and `dictConfig`. When would you choose each?',
          sampleAnswer: '`fileConfig` uses an INI-style format and is simple for basic setups. `dictConfig` is more flexible and can be loaded from JSON/YAML; it\'s common in modern apps because it supports complex handler trees and can be generated programmatically.'
        },
        {
          prompt: 'What\'s the operational benefit of external logging configuration?',
          sampleAnswer: 'You can change log levels, formats, and handlers per environment without code changes—e.g., enable DEBUG temporarily for one module in staging, or switch to file/rotation in production.'
        },
        {
          prompt: 'What is `disable_existing_loggers` and why does it matter?',
          sampleAnswer: 'In dictConfig, it controls whether loggers created before configuration are disabled. It matters because third-party libraries may create loggers; disabling them unintentionally can hide important logs.'
        }
      ]
    };
  }

  if (k === 'logging - practice + checkpoint') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Design a logging setup for a small app: console INFO, file DEBUG, and full tracebacks on errors.',
          sampleAnswer: 'Set the app logger to DEBUG, attach a console StreamHandler at INFO and a FileHandler at DEBUG, both with a consistent formatter. Use `logger.exception(...)` inside `except` blocks to capture tracebacks. Set `propagate=False` to avoid duplicates if root is configured.'
        },
        {
          prompt: 'You suspect duplicate handler configuration. How do you confirm and fix it?',
          sampleAnswer: 'Inspect `logger.handlers` and `logging.getLogger().handlers`, verify whether configuration runs multiple times (imports), and make config idempotent. Fix by configuring once in the entry point and ensuring modules don\'t add handlers.'
        },
        {
          prompt: 'What would you log for a failing request to make the incident debuggable?',
          sampleAnswer: 'Timestamp, severity, module/logger name, a correlation ID (request/user), and the error with traceback. Avoid secrets/PII and keep the message actionable.'
        }
      ]
    };
  }

  if (k === 'decorator functions - using *args and **kwargs (general-purpose)') {
    return {
      title: `Interview Practice: ${title}`,
      topic: title,
      questions: [
        {
          prompt: 'Why do decorators that work on both functions and methods almost always need `*args`/`**kwargs`?',
          sampleAnswer: 'Because methods implicitly pass `self` (or `cls`), and different functions have different parameters. `*args/**kwargs` keeps the decorator compatible across call signatures.'
        },
        {
          prompt: 'What are the two most common bugs in `*args/**kwargs` wrappers?',
          sampleAnswer: 'Not forwarding arguments correctly and not returning the underlying result. Both break call semantics and can cause `TypeError` or unexpected `None` returns.'
        },
        {
          prompt: 'If you needed a decorator that itself takes configuration (e.g., `@retry(times=3)`), what’s the high-level shape?',
          sampleAnswer: 'You write a decorator factory: an outer function that takes config and returns the actual decorator that takes `func` and returns `wrapper`. It’s “function returning decorator returning wrapper”.'
        }
      ]
    };
  }

  return null;
}

function buildOptions({ correct, title, content, prompt }) {
  // Ensure we always end up with 4 non-empty unique options.
  const distractors = makeDistractors({ correct, title, content, prompt });
  let options = uniqOptions([correct, ...distractors]);
  if (options.length < 4) {
    // pad by re-calling makeDistractors with slightly perturbed context
    const extra = makeDistractors({ correct, title: `${title} basics`, content, prompt: `${prompt} (variant)` });
    options = uniqOptions([...options, ...extra]);
  }
  options = options.slice(0, 4);

  // Stable shuffle so correct isn't always first, but doesn't change every run.
  const seed = `${title}||${prompt}||${correct}`;
  const shuffled = shuffleWithSeed(options, seed);
  const correctIndex = shuffled.findIndex(o => String(o).trim().toLowerCase() === String(correct).trim().toLowerCase());

  // If something went wrong, fall back to putting correct first.
  if (correctIndex === -1) {
    return { options: options, answerIndex: 0 };
  }
  return { options: shuffled, answerIndex: correctIndex };
}

function enhanceQuiz(lesson) {
  const title = lesson.title;
  const content = summarize(lesson.content || lesson.description || '');

  // Module 1: always replace with high-quality direct Q/A.
  const module1Quiz = generateModule1Quiz(title, content);
  if (module1Quiz && module1Quiz.length) {
    lesson.quiz = { title: `Quiz: ${title}`, questions: module1Quiz };
    lesson.quiz = ensureThreeShortAnswerQuestions(quizToShortAnswer(lesson.quiz), title, content);
    return;
  }

  // For core collection chapters (LIST/TUPLE/SET), always prefer our professional generators.
  // Enhancing existing generic/template questions tends to create irrelevant distractors.
  const t = String(title || '').toLowerCase();
  if (/^(list|tuple|set)\b/.test(t)) {
    const generated = generateProfessionalQuiz(title, content);
    if (generated && generated.length) {
      lesson.quiz = { title: `Quiz: ${title}`, questions: generated };
      lesson.quiz = ensureThreeShortAnswerQuestions(quizToShortAnswer(lesson.quiz), title, content);
      return;
    }
  }

  const shouldReplaceWholeQuiz =
    !lesson.quiz ||
    !Array.isArray(lesson.quiz.questions) ||
    lesson.quiz.questions.length === 0 ||
    lesson.quiz.questions.some(q => isTemplateQuizQuestionPrompt(q?.prompt));

  if (shouldReplaceWholeQuiz) {
    const generated = generateProfessionalQuiz(title, content);
    if (generated && generated.length) {
      lesson.quiz = { title: `Quiz: ${title}`, questions: generated };
      lesson.quiz = ensureThreeShortAnswerQuestions(quizToShortAnswer(lesson.quiz), title, content);
      return;
    }
  }

  // Normalize whatever exists (legacy MCQ or mixed) into clean short-answer questions.
  lesson.quiz = ensureThreeShortAnswerQuestions(quizToShortAnswer(lesson.quiz), title, content);
}

function enhanceInterview(lesson) {
  const title = lesson.title;
  const content = summarize(lesson.content || lesson.description || '');

  // Module 1: always replace with complete interview-style Q/A.
  const module1Interview = generateModule1Interview(title);
  if (module1Interview) {
    lesson.interview = module1Interview;
    return;
  }

  const baseAnswer = (ans) => {
    const extra = content ? ` Example: ${content.slice(0, 120)}.` : '';
    return ans + extra + ' Steps: 1) try a small example; 2) read the output; 3) vary inputs.';
  };

  const shouldReplaceInterview =
    !lesson.interview ||
    !Array.isArray(lesson.interview.questions) ||
    lesson.interview.questions.length === 0 ||
    lesson.interview.questions.some(q => isTemplateInterviewPrompt(q?.prompt));

  // For core collection chapters (LIST/TUPLE/SET), always prefer our professional interview generator.
  const t = String(title || '').toLowerCase();
  if (/^(list|tuple|set)\b/.test(t)) {
    const generated = generateProfessionalInterview(title);
    if (generated) {
      lesson.interview = generated;
      return;
    }
  }

  if (shouldReplaceInterview) {
    const generated = generateProfessionalInterview(title);
    if (generated) {
      lesson.interview = generated;
      return;
    }
  }

  // Normalize existing interview questions into strong, direct answers.
  const newQs = (lesson.interview?.questions || []).map(q => {
    const prompt = (q?.prompt && q.prompt.length > 10) ? q.prompt : `Discuss ${title}`;
    const cleanPrompt = rewritePromptToDirect(prompt, '');
    const sampleAnswer = (q?.sampleAnswer && q.sampleAnswer.length > 80)
      ? q.sampleAnswer
      : baseAnswer(`Detailed answer about ${title}.`);
    return { prompt: cleanPrompt, sampleAnswer };
  });

  lesson.interview = { title: `Interview Practice: ${title}`, topic: title, questions: newQs };
}

(async () => {
  try {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const course = await Course.findOne({ title: 'Python Programming - Complete Course' });
    if (!course) throw new Error('Course not found');

    const args = parseArgs(process.argv);
    const start = Math.max(0, parseInt(args.start ?? '0', 10) || 0);
    const count = Math.max(1, parseInt(args.count ?? '50', 10) || 50);

    let globalIndex = 0;
    let processed = 0;

    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (globalIndex < start) {
          globalIndex++;
          continue;
        }
        if (processed >= count) break;

        enhanceQuiz(lesson);
        enhanceInterview(lesson);
        processed++;
        globalIndex++;
        if (processed % 25 === 0) console.log(`Processed batch: ${processed}/${count} (start=${start})`);
      }
      if (processed >= count) break;
    }

    await course.save();
    console.log(`Done. Batch regenerated lessons: ${processed}. Range: [${start}..${start + processed - 1}]`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exitCode = 1;
  }
})();
