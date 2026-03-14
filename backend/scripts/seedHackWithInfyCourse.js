import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import RoadmapSection from '../models/RoadmapSection.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { HACKWITHINFY_COURSE_SEED } from './hackWithInfyCourseData.js';
import { expandHackWithInfyTestCases } from './hwiTestcaseGenerator.js';

dotenv.config();

const toJsIdentifier = (title) => {
  const cleaned = String(title || '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!cleaned.length) return 'solve';
  const [first, ...rest] = cleaned;
  const camel = [
    first.charAt(0).toLowerCase() + first.slice(1),
    ...rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1)),
  ].join('');
  return /^[a-zA-Z_$]/.test(camel) ? camel : `solve${camel.charAt(0).toUpperCase()}${camel.slice(1)}`;
};

const toPyIdentifier = (title) => {
  const cleaned = String(title || '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  if (!cleaned.length) return 'solve';
  return /^[a-z_]/.test(cleaned) ? cleaned : `solve_${cleaned}`;
};

const buildJavascriptVisible = (functionName, params) => {
  const signature = params.length ? params.join(', ') : '...args';
  return `function ${functionName}(${signature}) {
  // Write your code here
  return null;
}`;
};

const buildJavascriptAdapter = (functionName) => {
  return `function __doflow_entry(...args) {
  // Hidden entrypoint called by the judge
  return ${functionName}(...args);
}`;
};

const buildPythonVisible = (functionName, params) => {
  const signature = params.length ? params.join(', ') : '*args';
  return `def ${functionName}(${signature}):
    # Write your code here
    return None
`;
};

const buildPythonAdapter = (functionName) => {
  return `def __doflow_entry(*args):
    # Hidden entrypoint called by the judge
    return ${functionName}(*args)
`;
};

const normalizeDifficulty = (difficulty) => {
  const value = String(difficulty || '').toLowerCase();
  if (value === 'easy') return 'Easy';
  if (value === 'medium') return 'Medium';
  if (value === 'hard') return 'Hard';
  return 'Easy';
};

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const resetEnabled = () => {
  const raw = process.env.HWI_RESET || process.env.RESET || '';
  return ['1', 'true', 'yes', 'y'].includes(String(raw).toLowerCase());
};

const getRepresentativeArgs = (problemSeed) => {
  const cases = Array.isArray(problemSeed?.testCases) ? problemSeed.testCases : [];
  const representative = cases.find((tc) => tc && tc.isHidden === false) || cases[0];
  if (!representative || representative.input === undefined || representative.input === null) {
    return [];
  }

  const raw = String(representative.input).trim();
  if (!raw.length) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (error) {
    return [];
  }
};

const inferArgKind = (value) => {
  if (value === null || value === undefined) return 'string';
  if (typeof value === 'number') return 'long';
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'string') return 'string';
  if (Array.isArray(value)) {
    const elements = value;
    if (elements.some((v) => v === null || v === undefined)) {
      return 'string[]';
    }
    if (elements.length === 0) {
      return 'long[]';
    }
    if (elements.every((v) => Array.isArray(v))) {
      const inner = elements;
      const flattened = inner.flat();
      if (flattened.some((v) => v === null || v === undefined)) {
        return 'string[][]';
      }
      if (flattened.every((v) => typeof v === 'number')) {
        return 'long[][]';
      }
      if (flattened.every((v) => typeof v === 'string')) {
        return 'string[][]';
      }
      return 'string[][]';
    }
    if (elements.every((v) => typeof v === 'number')) return 'long[]';
    if (elements.every((v) => typeof v === 'string')) return 'string[]';
    return 'string[]';
  }
  return 'string';
};

const inferReturnKind = (problemSeed) => {
  const cases = Array.isArray(problemSeed?.testCases) ? problemSeed.testCases : [];
  const representative = cases.find((tc) => tc && tc.isHidden === false) || cases[0];
  const raw = String(representative?.expectedOutput ?? '').trim();
  if (!raw.length) return 'string';
  if (raw === 'true' || raw === 'false') return 'bool';
  if (/^-?\d+$/.test(raw)) return 'long';
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      return inferArgKind(parsed);
    } catch (error) {
      return 'long[]';
    }
  }
  return 'string';
};

const findFirstPublicTestCase = (problemSeed) => {
  const cases = Array.isArray(problemSeed?.testCases) ? problemSeed.testCases : [];
  return cases.find((tc) => tc && tc.isHidden === false) || null;
};

const tryParseJsonArgs = (rawInput) => {
  if (rawInput === null || rawInput === undefined) return null;
  const raw = String(rawInput).trim();
  if (!raw.length) return null;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch (error) {
    return null;
  }
};

const formatValueForExample = (value) => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const buildParamAssignmentString = (params = [], args = []) => {
  if (!Array.isArray(params) || params.length === 0 || !Array.isArray(args) || args.length === 0) {
    return null;
  }
  const parts = [];
  const max = Math.min(params.length, args.length);
  for (let i = 0; i < max; i += 1) {
    parts.push(`${params[i]}=${formatValueForExample(args[i])}`);
  }
  return parts.join(', ');
};

const describeReturnKind = (kind) => {
  switch (kind) {
    case 'bool':
      return 'a boolean (true/false)';
    case 'long':
      return 'an integer';
    case 'string':
      return 'a string';
    case 'long[]':
      return 'an array of integers';
    case 'string[]':
      return 'an array of strings';
    case 'long[][]':
      return 'a 2D array of integers';
    case 'string[][]':
      return 'a 2D array of strings';
    default:
      return 'a value as described in the problem';
  }
};

const ensureDetailedStatement = (problemSeed, returnKind) => {
  const original = String(problemSeed?.description || '').trim();
  if (!original.length) return original;
  if (/\bInput Format\b/i.test(original) && /\bOutput Format\b/i.test(original)) {
    return original;
  }

  const params = Array.isArray(problemSeed?.params) ? problemSeed.params : [];
  const paramLine = params.length ? params.join(', ') : 'as shown in the starter code';

  const lines = [];
  lines.push(original);
  lines.push('');
  lines.push('Input Format:');
  lines.push(`- You are given the parameters: ${paramLine}.`);
  lines.push('- Return the answer from the function (do not print extra output).');
  lines.push('');
  lines.push('Output Format:');
  lines.push(`- Return ${describeReturnKind(returnKind)}.`);

  return lines.join('\n');
};

const ensurePublicExampleWithExplanation = (problemSeed) => {
  const examples = Array.isArray(problemSeed?.examples) ? [...problemSeed.examples] : [];
  const publicTc = findFirstPublicTestCase(problemSeed);
  if (!publicTc) return examples;

  const params = Array.isArray(problemSeed?.params) ? problemSeed.params : [];
  const parsedArgs = tryParseJsonArgs(publicTc.input);
  const assignment = buildParamAssignmentString(params, parsedArgs || []);

  const inputLabel = assignment ? assignment : `Input: ${String(publicTc.input || '').trim()}`;

  const example = {
    input: inputLabel,
    output: String(publicTc.expectedOutput ?? '').trim(),
    explanation: `For ${inputLabel}, the expected output is ${String(publicTc.expectedOutput ?? '').trim()}.`,
  };

  const alreadyHasExplainedExample = examples.some((ex) => ex && String(ex.explanation || '').trim().length > 0);
  if (!alreadyHasExplainedExample) {
    return [example, ...examples];
  }

  const hasMatchingPublic = examples.some((ex) => {
    const out = String(ex?.output ?? '').trim();
    const pubOut = String(publicTc.expectedOutput ?? '').trim();
    return out.length && pubOut.length && out === pubOut;
  });

  return hasMatchingPublic ? examples : [example, ...examples];
};

const JAVA_TYPE_MAP = {
  long: 'long',
  bool: 'boolean',
  string: 'String',
  'long[]': 'long[]',
  'string[]': 'String[]',
  'long[][]': 'long[][]',
  'string[][]': 'String[][]',
};

const CPP_TYPE_MAP = {
  long: 'long long',
  bool: 'bool',
  string: 'std::string',
  'long[]': 'std::vector<long long>',
  'string[]': 'std::vector<std::string>',
  'long[][]': 'std::vector<std::vector<long long>>',
  'string[][]': 'std::vector<std::vector<std::string>>',
};

const C_TYPE_MAP = {
  long: 'long long',
  bool: 'bool',
  string: 'const char*',
  'long[]': 'LongArray',
  'string[]': 'StringArray',
  'long[][]': 'LongMatrix',
  'string[][]': 'StringMatrix',
};

const defaultJavaReturn = (kind) => {
  switch (kind) {
    case 'bool':
      return 'false';
    case 'long':
      return '0L';
    case 'string':
      return '""';
    case 'long[]':
      return 'new long[0]';
    case 'string[]':
      return 'new String[0]';
    case 'long[][]':
      return 'new long[0][0]';
    case 'string[][]':
      return 'new String[0][0]';
    default:
      return 'null';
  }
};

const defaultCppReturn = (kind) => {
  switch (kind) {
    case 'bool':
      return 'false';
    case 'long':
      return '0LL';
    case 'string':
      return '""';
    case 'long[]':
      return '{}';
    case 'string[]':
      return '{}';
    case 'long[][]':
      return '{}';
    case 'string[][]':
      return '{}';
    default:
      return '{}';
  }
};

const defaultCReturn = (kind) => {
  switch (kind) {
    case 'bool':
      return 'false';
    case 'long':
      return '0LL';
    case 'string':
      return '""';
    case 'long[]':
      return 'makeLongArray(0)';
    case 'string[]':
      return 'makeStringArray(0)';
    case 'long[][]':
      return 'makeLongMatrix(0)';
    case 'string[][]':
      return 'makeStringMatrix(0)';
    default:
      return '""';
  }
};

const buildCVisible = (functionName, params, argKinds, returnKind) => {
  const allKinds = [...(argKinds || []), returnKind];
  const needsBool = allKinds.includes('bool');
  // For C visible signatures we expose 1D arrays as (ptr, len) rather than LongArray.
  // We still need LongArray/StringArray typedefs if they are returned or used by matrix typedefs.
  const needsLongArray = returnKind === 'long[]' || allKinds.includes('long[][]');
  const needsStringArray = returnKind === 'string[]' || allKinds.includes('string[][]');
  const needsLongMatrix = allKinds.includes('long[][]');
  const needsStringMatrix = allKinds.includes('string[][]');
  const needsString = allKinds.includes('string') || needsStringArray || needsStringMatrix;

  const includes = ['#include <stdlib.h>'];
  if (needsBool) includes.push('#include <stdbool.h>');
  if (needsString) includes.push('#include <string.h>');

  const typedefs = [];

  if (needsLongArray) {
    typedefs.push(`#ifndef DOFLOW_LONGARRAY_DEF\n#define DOFLOW_LONGARRAY_DEF\ntypedef struct {\n    long long* data;\n    int len;\n} LongArray;\n\nstatic inline LongArray makeLongArray(int len) {\n    LongArray a;\n    a.len = len;\n    a.data = len > 0 ? (long long*)malloc(sizeof(long long) * (size_t)len) : NULL;\n    return a;\n}\n#endif`);
  }

  if (needsStringArray) {
    typedefs.push(`#ifndef DOFLOW_STRINGARRAY_DEF\n#define DOFLOW_STRINGARRAY_DEF\ntypedef struct {\n    char** data;\n    int len;\n} StringArray;\n\nstatic inline StringArray makeStringArray(int len) {\n    StringArray a;\n    a.len = len;\n    a.data = len > 0 ? (char**)malloc(sizeof(char*) * (size_t)len) : NULL;\n    return a;\n}\n#endif`);
  }

  if (needsLongMatrix) {
    if (!needsLongArray) {
      typedefs.push(`#ifndef DOFLOW_LONGARRAY_DEF\n#define DOFLOW_LONGARRAY_DEF\ntypedef struct {\n    long long* data;\n    int len;\n} LongArray;\n\nstatic inline LongArray makeLongArray(int len) {\n    LongArray a;\n    a.len = len;\n    a.data = len > 0 ? (long long*)malloc(sizeof(long long) * (size_t)len) : NULL;\n    return a;\n}\n#endif`);
    }
    typedefs.push(`#ifndef DOFLOW_LONGMATRIX_DEF\n#define DOFLOW_LONGMATRIX_DEF\ntypedef struct {\n    LongArray* rows;\n    int rowsLen;\n} LongMatrix;\n\nstatic inline LongMatrix makeLongMatrix(int rowsLen) {\n    LongMatrix m;\n    m.rowsLen = rowsLen;\n    m.rows = rowsLen > 0 ? (LongArray*)malloc(sizeof(LongArray) * (size_t)rowsLen) : NULL;\n    return m;\n}\n#endif`);
  }

  if (needsStringMatrix) {
    if (!needsStringArray) {
      typedefs.push(`#ifndef DOFLOW_STRINGARRAY_DEF\n#define DOFLOW_STRINGARRAY_DEF\ntypedef struct {\n    char** data;\n    int len;\n} StringArray;\n\nstatic inline StringArray makeStringArray(int len) {\n    StringArray a;\n    a.len = len;\n    a.data = len > 0 ? (char**)malloc(sizeof(char*) * (size_t)len) : NULL;\n    return a;\n}\n#endif`);
    }
    typedefs.push(`#ifndef DOFLOW_STRINGMATRIX_DEF\n#define DOFLOW_STRINGMATRIX_DEF\ntypedef struct {\n    StringArray* rows;\n    int rowsLen;\n} StringMatrix;\n\nstatic inline StringMatrix makeStringMatrix(int rowsLen) {\n    StringMatrix m;\n    m.rowsLen = rowsLen;\n    m.rows = rowsLen > 0 ? (StringArray*)malloc(sizeof(StringArray) * (size_t)rowsLen) : NULL;\n    return m;\n}\n#endif`);
  }

  const typedParams = (params || [])
    .flatMap((name, index) => {
      const kind = argKinds?.[index] || 'string';
      if (kind === 'long[]') {
        return [`long long* ${name}`, `int ${name}Len`];
      }
      if (kind === 'string[]') {
        return [`char** ${name}`, `int ${name}Len`];
      }
      const type = C_TYPE_MAP[kind] || 'const char*';
      return [`${type} ${name}`];
    })
    .join(', ');

  const returnType = C_TYPE_MAP[returnKind] || 'const char*';
  const defaultReturn = defaultCReturn(returnKind);

  const firstArrayParamIndex = (argKinds || []).findIndex((kind) => kind === 'long[]' || kind === 'string[]');
  const shouldProvideN =
    firstArrayParamIndex !== -1 &&
    (argKinds || []).filter((kind) => kind === 'long[]' || kind === 'string[]').length === 1 &&
    Array.isArray(params) &&
    typeof params[firstArrayParamIndex] === 'string' &&
    params[firstArrayParamIndex].length > 0;
  const nLine = shouldProvideN ? `    int n = ${params[firstArrayParamIndex]}Len;\n` : '';

  const pieces = [];
  pieces.push(includes.join('\n'));
  if (typedefs.length) {
    pieces.push('');
    pieces.push(typedefs.join('\n\n'));
  }
  pieces.push('');
  pieces.push(`${returnType} ${functionName}(${typedParams}) {\n    // Write your logic here\n${nLine}    return ${defaultReturn};\n}`);
  pieces.push('');
  return pieces.join('\n');
};

const buildCAdapter = (functionName, params, argKinds, returnKind) => {
  const allKinds = [...(argKinds || []), returnKind];
  const needsBool = allKinds.includes('bool');
  const needsLongArray = allKinds.includes('long[]') || allKinds.includes('long[][]');
  const needsStringArray = allKinds.includes('string[]') || allKinds.includes('string[][]');
  const needsLongMatrix = allKinds.includes('long[][]');
  const needsStringMatrix = allKinds.includes('string[][]');
  const needsString = allKinds.includes('string') || needsStringArray || needsStringMatrix;

  const declarations = [];
  const callArgs = [];
  const frees = [];

  (params || []).forEach((name, index) => {
    const kind = argKinds?.[index] || 'string';
    const varName = `arg${index}`;
    switch (kind) {
      case 'long':
        declarations.push(`    long long ${varName} = parseLong(getArg(argc, argv, ${index}));`);
        callArgs.push(varName);
        break;
      case 'bool':
        declarations.push(`    bool ${varName} = parseBool(getArg(argc, argv, ${index}));`);
        callArgs.push(varName);
        break;
      case 'string':
        declarations.push(`    char* ${varName} = stripQuotesDup(getArg(argc, argv, ${index}));`);
        callArgs.push(varName);
        frees.push(`    free(${varName});`);
        break;
      case 'long[]':
        declarations.push(`    LongArray ${varName} = parseLongArray(getArg(argc, argv, ${index}));`);
        callArgs.push(`${varName}.data`, `${varName}.len`);
        frees.push(`    freeLongArray(${varName});`);
        break;
      case 'string[]':
        declarations.push(`    StringArray ${varName} = parseStringArray(getArg(argc, argv, ${index}));`);
        callArgs.push(`${varName}.data`, `${varName}.len`);
        frees.push(`    freeStringArray(${varName});`);
        break;
      case 'long[][]':
        declarations.push(`    LongMatrix ${varName} = parseLongMatrix(getArg(argc, argv, ${index}));`);
        callArgs.push(varName);
        frees.push(`    freeLongMatrix(${varName});`);
        break;
      case 'string[][]':
        declarations.push(`    StringMatrix ${varName} = parseStringMatrix(getArg(argc, argv, ${index}));`);
        callArgs.push(varName);
        frees.push(`    freeStringMatrix(${varName});`);
        break;
      default:
        declarations.push(`    char* ${varName} = stripQuotesDup(getArg(argc, argv, ${index}));`);
        callArgs.push(varName);
        frees.push(`    free(${varName});`);
        break;
    }
  });

  const callExpr = `${functionName}(${callArgs.join(', ')})`;

  const formatResultExpr = (() => {
    switch (returnKind) {
      case 'bool':
        return 'dupstr(result ? "true" : "false")';
      case 'long':
        return 'longToString(result)';
      case 'string':
        return 'dupstr(result ? result : "")';
      case 'long[]':
        return 'toJsonLongArray(result)';
      case 'string[]':
        return 'toJsonStringArray(result)';
      case 'long[][]':
        return 'toJsonLongMatrix(result)';
      case 'string[][]':
        return 'toJsonStringMatrix(result)';
      default:
        return 'dupstr("")';
    }
  })();

  const adapterIncludes = [
    '#include <stdlib.h>',
    '#include <stdio.h>',
    '#include <string.h>',
    '#include <ctype.h>',
    '#include <stdbool.h>',
  ];

  const adapterTypedefs = [];
  if (needsLongArray || needsLongMatrix) {
    adapterTypedefs.push(`#ifndef DOFLOW_LONGARRAY_DEF\n#define DOFLOW_LONGARRAY_DEF\ntypedef struct {\n    long long* data;\n    int len;\n} LongArray;\n\nstatic inline LongArray makeLongArray(int len) {\n    LongArray a;\n    a.len = len;\n    a.data = len > 0 ? (long long*)malloc(sizeof(long long) * (size_t)len) : NULL;\n    return a;\n}\n#endif`);
  }
  if (needsStringArray || needsStringMatrix) {
    adapterTypedefs.push(`#ifndef DOFLOW_STRINGARRAY_DEF\n#define DOFLOW_STRINGARRAY_DEF\ntypedef struct {\n    char** data;\n    int len;\n} StringArray;\n\nstatic inline StringArray makeStringArray(int len) {\n    StringArray a;\n    a.len = len;\n    a.data = len > 0 ? (char**)malloc(sizeof(char*) * (size_t)len) : NULL;\n    return a;\n}\n#endif`);
  }
  if (needsLongMatrix) {
    adapterTypedefs.push(`#ifndef DOFLOW_LONGMATRIX_DEF\n#define DOFLOW_LONGMATRIX_DEF\ntypedef struct {\n    LongArray* rows;\n    int rowsLen;\n} LongMatrix;\n\nstatic inline LongMatrix makeLongMatrix(int rowsLen) {\n    LongMatrix m;\n    m.rowsLen = rowsLen;\n    m.rows = rowsLen > 0 ? (LongArray*)malloc(sizeof(LongArray) * (size_t)rowsLen) : NULL;\n    return m;\n}\n#endif`);
  }
  if (needsStringMatrix) {
    adapterTypedefs.push(`#ifndef DOFLOW_STRINGMATRIX_DEF\n#define DOFLOW_STRINGMATRIX_DEF\ntypedef struct {\n    StringArray* rows;\n    int rowsLen;\n} StringMatrix;\n\nstatic inline StringMatrix makeStringMatrix(int rowsLen) {\n    StringMatrix m;\n    m.rowsLen = rowsLen;\n    m.rows = rowsLen > 0 ? (StringArray*)malloc(sizeof(StringArray) * (size_t)rowsLen) : NULL;\n    return m;\n}\n#endif`);
  }

  const cTypedParams = (params || [])
    .flatMap((name, index) => {
      const kind = argKinds?.[index] || 'string';
      if (kind === 'long[]') return [`long long* ${name}`, `int ${name}Len`];
      if (kind === 'string[]') return [`char** ${name}`, `int ${name}Len`];
      const type = C_TYPE_MAP[kind] || 'const char*';
      return [`${type} ${name}`];
    })
    .join(', ');

  const cReturnType = C_TYPE_MAP[returnKind] || 'const char*';
  const userPrototype = `${cReturnType} ${functionName}(${cTypedParams});`;

  const helpers = [];

  helpers.push(`static const char* getArg(int argc, const char* argv[], int idx) {\n    return (idx >= 0 && idx < argc) ? argv[idx] : "";\n}\n\nstatic char* dupstr(const char* s) {\n    if (s == NULL) {\n        char* out = (char*)malloc(1);\n        if (out) out[0] = '\\0';\n        return out;\n    }\n    size_t n = strlen(s);\n    char* out = (char*)malloc(n + 1);\n    if (!out) return NULL;\n    memcpy(out, s, n + 1);\n    return out;\n}\n\nstatic char* stripQuotesDup(const char* s) {\n    if (!s) return dupstr("");\n    size_t n = strlen(s);\n    if (n >= 2 && s[0] == '"' && s[n - 1] == '"') {\n        char* out = (char*)malloc(n - 1);\n        if (!out) return NULL;\n        memcpy(out, s + 1, n - 2);\n        out[n - 2] = '\\0';\n        return out;\n    }\n    return dupstr(s);\n}\n\nstatic long long parseLong(const char* s) {\n    if (!s) return 0LL;\n    while (*s && isspace((unsigned char)*s)) s++;\n    if (*s == '\\0' || (s[0] == 'n' && s[1] == 'u' && s[2] == 'l' && s[3] == 'l')) return 0LL;\n    return strtoll(s, NULL, 10);\n}\n\nstatic bool parseBool(const char* s) {\n    if (!s) return false;\n    while (*s && isspace((unsigned char)*s)) s++;\n    return (strcmp(s, "true") == 0 || strcmp(s, "1") == 0);\n}`);

  if (needsLongArray || needsLongMatrix) {
    helpers.push(`\nstatic void freeLongArray(LongArray a) {\n    if (a.data) free(a.data);\n}\n\nstatic LongArray parseLongArray(const char* raw) {\n    LongArray out;\n    out.data = NULL;\n    out.len = 0;\n    if (!raw) return out;\n    const char* p = raw;\n    int count = 0;\n    while (*p) {\n        if (*p == '-' || isdigit((unsigned char)*p)) {\n            strtoll(p, (char**)&p, 10);\n            count++;\n            continue;\n        }\n        p++;\n    }\n    if (count <= 0) return out;\n    out.data = (long long*)malloc(sizeof(long long) * (size_t)count);\n    out.len = count;\n    p = raw;\n    int idx = 0;\n    while (*p && idx < count) {\n        if (*p == '-' || isdigit((unsigned char)*p)) {\n            out.data[idx++] = strtoll(p, (char**)&p, 10);\n            continue;\n        }\n        p++;\n    }\n    return out;\n}`);
  }

  if (needsStringArray || needsStringMatrix) {
    helpers.push(`\nstatic void freeStringArray(StringArray a) {\n    if (a.data) {\n        for (int i = 0; i < a.len; i++) {\n            if (a.data[i]) free(a.data[i]);\n        }\n        free(a.data);\n    }\n}\n\nstatic StringArray parseStringArray(const char* raw) {\n    StringArray out;\n    out.data = NULL;\n    out.len = 0;\n    if (!raw) return out;\n    const char* s = raw;\n    while (*s && isspace((unsigned char)*s)) s++;\n    if (*s != '[') {\n        out.data = (char**)malloc(sizeof(char*));\n        out.len = out.data ? 1 : 0;\n        if (out.data) out.data[0] = stripQuotesDup(s);\n        return out;\n    }\n\n    int cap = 8;\n    out.data = (char**)malloc(sizeof(char*) * (size_t)cap);\n    if (!out.data) return out;\n    out.len = 0;\n\n    s++;\n    while (*s) {\n        while (*s && (isspace((unsigned char)*s) || *s == ',')) s++;\n        if (*s == ']') break;\n        if (*s == '"') {\n            s++;\n            const char* start = s;\n            int escaped = 0;\n            size_t tmpCap = 32;\n            size_t tmpLen = 0;\n            char* tmp = (char*)malloc(tmpCap);\n            if (!tmp) break;\n            while (*s) {\n                char ch = *s;\n                if (!escaped && ch == '\\') {\n                    escaped = 1;\n                    s++;\n                    continue;\n                }\n                if (!escaped && ch == '"') {\n                    break;\n                }\n                if (tmpLen + 2 >= tmpCap) {\n                    tmpCap *= 2;\n                    char* grown = (char*)realloc(tmp, tmpCap);\n                    if (!grown) { free(tmp); tmp = NULL; break; }\n                    tmp = grown;\n                }\n                tmp[tmpLen++] = ch;\n                escaped = 0;\n                s++;\n            }\n            if (!tmp) break;\n            tmp[tmpLen] = '\\0';\n            if (*s == '"') s++;\n            if (out.len >= cap) {\n                cap *= 2;\n                char** grown = (char**)realloc(out.data, sizeof(char*) * (size_t)cap);\n                if (!grown) { free(tmp); break; }\n                out.data = grown;\n            }\n            out.data[out.len++] = tmp;\n            (void)start;\n        } else {\n            const char* tokenStart = s;\n            while (*s && *s != ',' && *s != ']') s++;\n            size_t n = (size_t)(s - tokenStart);\n            char* token = (char*)malloc(n + 1);\n            if (!token) break;\n            memcpy(token, tokenStart, n);\n            token[n] = '\\0';\n            if (out.len >= cap) {\n                cap *= 2;\n                char** grown = (char**)realloc(out.data, sizeof(char*) * (size_t)cap);\n                if (!grown) { free(token); break; }\n                out.data = grown;\n            }\n            out.data[out.len++] = token;\n        }\n    }\n\n    return out;\n}`);
  }

  if (needsLongMatrix) {
    helpers.push(`\nstatic void freeLongMatrix(LongMatrix m) {\n    if (m.rows) {\n        for (int i = 0; i < m.rowsLen; i++) {\n            freeLongArray(m.rows[i]);\n        }\n        free(m.rows);\n    }\n}\n\nstatic LongMatrix parseLongMatrix(const char* raw) {\n    LongMatrix out;\n    out.rows = NULL;\n    out.rowsLen = 0;\n    if (!raw) return out;\n    const char* s = raw;\n    while (*s && isspace((unsigned char)*s)) s++;\n    if (*s != '[') {\n        out.rows = (LongArray*)malloc(sizeof(LongArray));\n        out.rowsLen = out.rows ? 1 : 0;\n        if (out.rows) out.rows[0] = parseLongArray(s);\n        return out;\n    }\n\n    int cap = 8;\n    out.rows = (LongArray*)malloc(sizeof(LongArray) * (size_t)cap);\n    if (!out.rows) return out;\n    out.rowsLen = 0;\n\n    int depth = 0;\n    for (; *s; s++) {\n        if (*s == '[') {\n            depth++;\n            if (depth == 2) {\n                const char* start = s;\n                int innerDepth = 1;\n                s++;\n                while (*s && innerDepth > 0) {\n                    if (*s == '[') innerDepth++;\n                    else if (*s == ']') innerDepth--;\n                    s++;\n                }\n                const char* end = s;\n                size_t n = (size_t)(end - start);\n                char* slice = (char*)malloc(n + 1);\n                if (!slice) break;\n                memcpy(slice, start, n);\n                slice[n] = '\\0';\n                if (out.rowsLen >= cap) {\n                    cap *= 2;\n                    LongArray* grown = (LongArray*)realloc(out.rows, sizeof(LongArray) * (size_t)cap);\n                    if (!grown) { free(slice); break; }\n                    out.rows = grown;\n                }\n                out.rows[out.rowsLen++] = parseLongArray(slice);\n                free(slice);\n                s--;\n                depth--;\n            }\n        } else if (*s == ']') {\n            if (depth > 0) depth--;\n        }\n    }\n\n    return out;\n}`);
  }

  if (needsStringMatrix) {
    helpers.push(`\nstatic void freeStringMatrix(StringMatrix m) {\n    if (m.rows) {\n        for (int i = 0; i < m.rowsLen; i++) {\n            freeStringArray(m.rows[i]);\n        }\n        free(m.rows);\n    }\n}\n\nstatic StringMatrix parseStringMatrix(const char* raw) {\n    StringMatrix out;\n    out.rows = NULL;\n    out.rowsLen = 0;\n    if (!raw) return out;\n    const char* s = raw;\n    while (*s && isspace((unsigned char)*s)) s++;\n    if (*s != '[') {\n        out.rows = (StringArray*)malloc(sizeof(StringArray));\n        out.rowsLen = out.rows ? 1 : 0;\n        if (out.rows) out.rows[0] = parseStringArray(s);\n        return out;\n    }\n\n    int cap = 8;\n    out.rows = (StringArray*)malloc(sizeof(StringArray) * (size_t)cap);\n    if (!out.rows) return out;\n    out.rowsLen = 0;\n\n    int depth = 0;\n    for (; *s; s++) {\n        if (*s == '[') {\n            depth++;\n            if (depth == 2) {\n                const char* start = s;\n                int innerDepth = 1;\n                s++;\n                while (*s && innerDepth > 0) {\n                    if (*s == '[') innerDepth++;\n                    else if (*s == ']') innerDepth--;\n                    s++;\n                }\n                const char* end = s;\n                size_t n = (size_t)(end - start);\n                char* slice = (char*)malloc(n + 1);\n                if (!slice) break;\n                memcpy(slice, start, n);\n                slice[n] = '\\0';\n                if (out.rowsLen >= cap) {\n                    cap *= 2;\n                    StringArray* grown = (StringArray*)realloc(out.rows, sizeof(StringArray) * (size_t)cap);\n                    if (!grown) { free(slice); break; }\n                    out.rows = grown;\n                }\n                out.rows[out.rowsLen++] = parseStringArray(slice);\n                free(slice);\n                s--;\n                depth--;\n            }\n        } else if (*s == ']') {\n            if (depth > 0) depth--;\n        }\n    }\n\n    return out;\n}`);
  }

  helpers.push(`\ntypedef struct {\n    char* buf;\n    size_t len;\n    size_t cap;\n} SB;\n\nstatic void sbInit(SB* sb) {\n    sb->cap = 128;\n    sb->len = 0;\n    sb->buf = (char*)malloc(sb->cap);\n    if (sb->buf) sb->buf[0] = '\\0';\n}\n\nstatic void sbEnsure(SB* sb, size_t more) {\n    if (!sb->buf) return;\n    size_t need = sb->len + more + 1;\n    if (need <= sb->cap) return;\n    while (sb->cap < need) sb->cap *= 2;\n    char* grown = (char*)realloc(sb->buf, sb->cap);\n    if (!grown) {\n        free(sb->buf);\n        sb->buf = NULL;\n        sb->cap = sb->len = 0;\n        return;\n    }\n    sb->buf = grown;\n}\n\nstatic void sbAppendChar(SB* sb, char ch) {\n    sbEnsure(sb, 1);\n    if (!sb->buf) return;\n    sb->buf[sb->len++] = ch;\n    sb->buf[sb->len] = '\\0';\n}\n\nstatic void sbAppendStr(SB* sb, const char* s) {\n    if (!s) s = "";\n    size_t n = strlen(s);\n    sbEnsure(sb, n);\n    if (!sb->buf) return;\n    memcpy(sb->buf + sb->len, s, n);\n    sb->len += n;\n    sb->buf[sb->len] = '\\0';\n}\n\nstatic void sbAppendLong(SB* sb, long long v) {\n    char tmp[64];\n    snprintf(tmp, sizeof(tmp), "%lld", v);\n    sbAppendStr(sb, tmp);\n}\n\nstatic char* sbFinalize(SB* sb) {\n    if (!sb->buf) return dupstr("");\n    char* out = sb->buf;\n    sb->buf = NULL;\n    sb->cap = sb->len = 0;\n    return out;\n}\n\nstatic void sbAppendJsonEscaped(SB* sb, const char* s) {\n    if (!s) s = "";\n    for (; *s; s++) {\n        char ch = *s;\n        if (ch == '\\\\' || ch == '"') {\n            sbAppendChar(sb, '\\\\');\n        }\n        sbAppendChar(sb, ch);\n    }\n}\n\nstatic char* longToString(long long v) {\n    char tmp[64];\n    snprintf(tmp, sizeof(tmp), "%lld", v);\n    return dupstr(tmp);\n}`);

  if (returnKind === 'long[]' || needsLongArray) {
    helpers.push(`\nstatic char* toJsonLongArray(LongArray a) {\n    SB sb;\n    sbInit(&sb);\n    sbAppendChar(&sb, '[');\n    for (int i = 0; i < a.len; i++) {\n        if (i) sbAppendChar(&sb, ',');\n        sbAppendLong(&sb, a.data ? a.data[i] : 0LL);\n    }\n    sbAppendChar(&sb, ']');\n    return sbFinalize(&sb);\n}`);
  }

  if (returnKind === 'string[]' || needsStringArray) {
    helpers.push(`\nstatic char* toJsonStringArray(StringArray a) {\n    SB sb;\n    sbInit(&sb);\n    sbAppendChar(&sb, '[');\n    for (int i = 0; i < a.len; i++) {\n        if (i) sbAppendChar(&sb, ',');\n        sbAppendChar(&sb, '"');\n        if (a.data && a.data[i]) sbAppendJsonEscaped(&sb, a.data[i]);\n        sbAppendChar(&sb, '"');\n    }\n    sbAppendChar(&sb, ']');\n    return sbFinalize(&sb);\n}`);
  }

  if (returnKind === 'long[][]' || needsLongMatrix) {
    helpers.push(`\nstatic char* toJsonLongMatrix(LongMatrix m) {\n    SB sb;\n    sbInit(&sb);\n    sbAppendChar(&sb, '[');\n    for (int r = 0; r < m.rowsLen; r++) {\n        if (r) sbAppendChar(&sb, ',');\n        LongArray row = m.rows ? m.rows[r] : (LongArray){ NULL, 0 };\n        char* rowJson = toJsonLongArray(row);\n        sbAppendStr(&sb, rowJson);\n        free(rowJson);\n    }\n    sbAppendChar(&sb, ']');\n    return sbFinalize(&sb);\n}`);
  }

  if (returnKind === 'string[][]' || needsStringMatrix) {
    helpers.push(`\nstatic char* toJsonStringMatrix(StringMatrix m) {\n    SB sb;\n    sbInit(&sb);\n    sbAppendChar(&sb, '[');\n    for (int r = 0; r < m.rowsLen; r++) {\n        if (r) sbAppendChar(&sb, ',');\n        StringArray row = m.rows ? m.rows[r] : (StringArray){ NULL, 0 };\n        char* rowJson = toJsonStringArray(row);\n        sbAppendStr(&sb, rowJson);\n        free(rowJson);\n    }\n    sbAppendChar(&sb, ']');\n    return sbFinalize(&sb);\n}`);
  }

  const returnType = C_TYPE_MAP[returnKind] || 'const char*';

  const resultDeclaration = (() => {
    if (returnKind === 'string') return `    ${returnType} result = ${callExpr};`;
    return `    ${returnType} result = ${callExpr};`;
  })();

  let out = `${adapterIncludes.join('\n')}\n\n${adapterTypedefs.length ? `${adapterTypedefs.join('\n\n')}\n\n` : ''}${userPrototype}\n\n${helpers.join('\n\n')}\n\nconst char* __doflow_entry(int argc, const char* argv[]) {\n${declarations.join('\n')}\n${resultDeclaration}\n${frees.length ? `\n${frees.join('\n')}\n` : ''}    return ${formatResultExpr};\n}\n`;
  // Fix common JS->C escaping bug: '\\' in JS becomes '\' in C, which breaks char literals like '\'.
  out = out.replace("ch == '\\')", "ch == '\\\\')");
  return out;
};

const buildJavaVisible = (methodName, params, argKinds, returnKind) => {
  const typedParams = params
    .map((name, index) => {
      const kind = argKinds[index] || 'string';
      const type = JAVA_TYPE_MAP[kind] || 'String';
      return `${type} ${name}`;
    })
    .join(', ');
  const returnType = JAVA_TYPE_MAP[returnKind] || 'String';
  return `class Solution {
    public static ${returnType} ${methodName}(${typedParams}) {
        // Write your logic here
        return ${defaultJavaReturn(returnKind)};
    }
}
`;
};

const buildJavaAdapter = (methodName, params, argKinds, returnKind) => {
  const javaArgs = params
    .map((name, index) => {
      const kind = argKinds[index] || 'string';
      switch (kind) {
        case 'long':
          return `parseLong(rawArgs[${index}])`;
        case 'bool':
          return `parseBool(rawArgs[${index}])`;
        case 'string':
          return `rawArgs[${index}]`;
        case 'long[]':
          return `parseLongArray(rawArgs[${index}])`;
        case 'string[]':
          return `parseStringArray(rawArgs[${index}])`;
        case 'long[][]':
          return `parseLongMatrix(rawArgs[${index}])`;
        case 'string[][]':
          return `parseStringMatrix(rawArgs[${index}])`;
        default:
          return `rawArgs[${index}]`;
      }
    })
    .join(', ');

  const callExpr = `Solution.${methodName}(${javaArgs})`;

  const formatResult = (() => {
    switch (returnKind) {
      case 'bool':
      case 'long':
        return `String.valueOf(result)`;
      case 'string':
        return `result == null ? "" : result`;
      case 'long[]':
        return `toJson(result)`;
      case 'string[]':
        return `toJson(result)`;
      case 'long[][]':
        return `toJson(result)`;
      case 'string[][]':
        return `toJson(result)`;
      default:
        return `result == null ? "" : String.valueOf(result)`;
    }
  })();

  return `import java.util.*;

final class DoFlowAdapter {
    private DoFlowAdapter() {}

    public static Object __doflow_entry(String[] rawArgs) {
        ${JAVA_TYPE_MAP[returnKind] || 'Object'} result = ${callExpr};
        return ${formatResult};
    }

    private static long parseLong(String value) {
        if (value == null) return 0L;
      String trimmed = stripQuotes(value.trim());
        if (trimmed.isEmpty() || trimmed.equals("null")) return 0L;
        return Long.parseLong(trimmed);
    }

    private static boolean parseBool(String value) {
        if (value == null) return false;
      String trimmed = stripQuotes(value.trim()).toLowerCase();
      if (trimmed.equals("1")) return true;
      if (trimmed.equals("0")) return false;
      return Boolean.parseBoolean(trimmed);
    }

    private static long[] parseLongArray(String json) {
      if (json == null) return new long[0];
      String s = json.trim();
      if (s.isEmpty() || s.equals("null") || s.equals("[]")) return new long[0];

      ArrayList<Long> out = new ArrayList<>();
      long sign = 1L;
      long num = 0L;
      boolean inNumber = false;
        
      for (int i = 0; i < s.length(); i++) {
        char ch = s.charAt(i);
        if (ch == '-') {
          sign = -1L;
        } else if (ch >= '0' && ch <= '9') {
          num = num * 10L + (ch - '0');
          inNumber = true;
        } else {
          if (inNumber) {
            out.add(sign * num);
            sign = 1L;
            num = 0L;
            inNumber = false;
          }
        }
      }
      if (inNumber) {
        out.add(sign * num);
      }

      if (out.isEmpty()) {
        // Fallback for scalar input
        return new long[] { parseLong(s) };
      }

      long[] arr = new long[out.size()];
      for (int idx = 0; idx < out.size(); idx++) arr[idx] = out.get(idx);
      return arr;
    }

    private static String[] parseStringArray(String json) {
      if (json == null) return new String[0];
      String s = json.trim();
      if (s.equals("[]")) return new String[0];
      if (!s.startsWith("[")) return new String[]{ stripQuotes(s) };
      ArrayList<String> out = new ArrayList<>();
      int i = 1;
      while (i < s.length()) {
        while (i < s.length() && (s.charAt(i) == ' ' || s.charAt(i) == ',')) i++;
        if (i >= s.length() || s.charAt(i) == ']') break;
        if (s.charAt(i) == '"') {
          i++;
          StringBuilder sb = new StringBuilder();
          while (i < s.length()) {
            char ch = s.charAt(i);
            if (ch == '\\\\' && i + 1 < s.length()) {
              sb.append(s.charAt(i + 1));
              i += 2;
              continue;
            }
            if (ch == '"') {
              i++;
              break;
            }
            sb.append(ch);
            i++;
          }
          out.add(sb.toString());
        } else {
          int start = i;
          while (i < s.length() && s.charAt(i) != ',' && s.charAt(i) != ']') i++;
          String token = s.substring(start, i).trim();
          out.add(token.equals("null") ? "null" : token);
        }
      }
      return out.toArray(new String[0]);
    }

    private static String stripQuotes(String value) {
      if (value == null) return "";
      String trimmed = value.trim();
      // Avoid Java string literals like "\"" here because this adapter is generated
      // from a JS template string and it's easy to accidentally emit """ (text block).
      if (trimmed.length() >= 2 && trimmed.charAt(0) == '"' && trimmed.charAt(trimmed.length() - 1) == '"') {
        return trimmed.substring(1, trimmed.length() - 1);
      }
      return trimmed;
    }

    private static long[][] parseLongMatrix(String json) {
        if (json == null) return new long[0][0];
        String s = json.trim();
        if (s.equals("[]")) return new long[0][0];
      if (!s.startsWith("[")) return new long[][]{ parseLongArray(s) };
        ArrayList<long[]> rows = new ArrayList<>();
        int i = 0;
        while (i < s.length() && s.charAt(i) != '[') i++;
        i++;
        while (i < s.length()) {
            while (i < s.length() && (s.charAt(i) == ' ' || s.charAt(i) == ',')) i++;
            if (i >= s.length() || s.charAt(i) == ']') break;
            int start = i;
            int depth = 0;
            while (i < s.length()) {
                char ch = s.charAt(i);
                if (ch == '[') depth++;
                else if (ch == ']') {
                    depth--;
                    if (depth == 0) {
                        i++;
                        break;
                    }
                }
                i++;
            }
            String slice = s.substring(start, i);
            rows.add(parseLongArray(slice));
        }
        long[][] out = new long[rows.size()][];
        for (int r = 0; r < rows.size(); r++) out[r] = rows.get(r);
        return out;
    }

    private static String[][] parseStringMatrix(String json) {
        if (json == null) return new String[0][0];
        String s = json.trim();
        if (s.equals("[]")) return new String[0][0];
      if (!s.startsWith("[")) return new String[][]{ parseStringArray(s) };
        ArrayList<String[]> rows = new ArrayList<>();
        int i = 0;
        while (i < s.length() && s.charAt(i) != '[') i++;
        i++;
        while (i < s.length()) {
            while (i < s.length() && (s.charAt(i) == ' ' || s.charAt(i) == ',')) i++;
            if (i >= s.length() || s.charAt(i) == ']') break;
            int start = i;
            int depth = 0;
            while (i < s.length()) {
                char ch = s.charAt(i);
                if (ch == '[') depth++;
                else if (ch == ']') {
                    depth--;
                    if (depth == 0) {
                        i++;
                        break;
                    }
                }
                i++;
            }
            String slice = s.substring(start, i);
            rows.add(parseStringArray(slice));
        }
        String[][] out = new String[rows.size()][];
        for (int r = 0; r < rows.size(); r++) out[r] = rows.get(r);
        return out;
    }

    private static String escape(String value) {
        if (value == null) return "";
      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < value.length(); i++) {
        char ch = value.charAt(i);
        if (ch == '\\\\' || ch == '"') {
          sb.append('\\\\');
        }
        sb.append(ch);
      }
      return sb.toString();
    }

    private static String toJson(long[] arr) {
        if (arr == null) return "[]";
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(arr[i]);
        }
        sb.append(']');
        return sb.toString();
    }

    private static String toJson(long[][] matrix) {
        if (matrix == null) return "[]";
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < matrix.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(toJson(matrix[i]));
        }
        sb.append(']');
        return sb.toString();
    }

    private static String toJson(String[] arr) {
        if (arr == null) return "[]";
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < arr.length; i++) {
            if (i > 0) sb.append(',');
            sb.append('"').append(escape(arr[i])).append('"');
        }
        sb.append(']');
        return sb.toString();
    }

    private static String toJson(String[][] matrix) {
        if (matrix == null) return "[]";
        StringBuilder sb = new StringBuilder();
        sb.append('[');
        for (int i = 0; i < matrix.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(toJson(matrix[i]));
        }
        sb.append(']');
        return sb.toString();
    }
}
`;
};

const buildCppVisible = (functionName, params, argKinds, returnKind) => {
  const typedParams = params
    .map((name, index) => {
      const kind = argKinds[index] || 'string';
      const type = CPP_TYPE_MAP[kind] || 'std::string';
      return `${type} ${name}`;
    })
    .join(', ');
  const returnType = CPP_TYPE_MAP[returnKind] || 'std::string';
  return `${returnType} ${functionName}(${typedParams}) {
    // Write your logic here
    return ${defaultCppReturn(returnKind)};
}
`;
};

const buildCppAdapter = (functionName, params, argKinds, returnKind) => {
  const typedParams = params
    .map((name, index) => {
      const kind = argKinds[index] || 'string';
      const type = CPP_TYPE_MAP[kind] || 'std::string';
      return `${type} ${name}`;
    })
    .join(', ');
  const returnType = CPP_TYPE_MAP[returnKind] || 'std::string';
  const userPrototype = `${returnType} ${functionName}(${typedParams});\n\n`;

  const cppArgs = params
    .map((name, index) => {
      const kind = argKinds[index] || 'string';
      switch (kind) {
        case 'long':
          return `parseLong(rawArgs[${index}])`;
        case 'bool':
          return `parseBool(rawArgs[${index}])`;
        case 'string':
          return `rawArgs[${index}]`;
        case 'long[]':
          return `parseLongArray(rawArgs[${index}])`;
        case 'string[]':
          return `parseStringArray(rawArgs[${index}])`;
        case 'long[][]':
          return `parseLongMatrix(rawArgs[${index}])`;
        case 'string[][]':
          return `parseStringMatrix(rawArgs[${index}])`;
        default:
          return `rawArgs[${index}]`;
      }
    })
    .join(', ');

  const callExpr = `${functionName}(${cppArgs})`;

  const formatResult = (() => {
    switch (returnKind) {
      case 'bool':
        return `result ? std::string("true") : std::string("false")`;
      case 'long':
        return `std::to_string(result)`;
      case 'string':
        return `result`;
      case 'long[]':
      case 'string[]':
      case 'long[][]':
      case 'string[][]':
        return `toJson(result)`;
      default:
        return `toJson(result)`;
    }
  })();

  return `${userPrototype}static long long parseLong(const std::string& value) {
    if (value.empty() || value == "null") return 0LL;
    return std::stoll(value);
}

static bool parseBool(const std::string& value) {
    return value == "true" || value == "1";
}

static std::vector<long long> parseLongArray(const std::string& json) {
  std::string s = json;
  if (s.empty() || s == "null" || s == "[]") return {};

  std::vector<long long> out;
  long long sign = 1;
  long long num = 0;
  bool inNumber = false;

  for (size_t i = 0; i < s.size(); i++) {
    char ch = s[i];
    if (ch == '-') {
      sign = -1;
    } else if (ch >= '0' && ch <= '9') {
      num = num * 10 + (ch - '0');
      inNumber = true;
    } else {
      if (inNumber) {
        out.push_back(sign * num);
        sign = 1;
        num = 0;
        inNumber = false;
      }
    }
  }
  if (inNumber) {
    out.push_back(sign * num);
  }

  if (out.empty()) {
    // Scalar fallback
    try {
      out.push_back(parseLong(s));
    } catch (...) {
      return {};
    }
  }

  return out;
}

static std::string stripQuotes(const std::string& value) {
  if (value.size() >= 2 && value.front() == '"' && value.back() == '"') {
    return value.substr(1, value.size() - 2);
  }
  return value;
}

static std::string unescapeJsonString(const std::string& s) {
    std::string out;
    out.reserve(s.size());
    for (size_t i = 0; i < s.size(); i++) {
        char ch = s[i];
    if (ch == '\\\\' && i + 1 < s.size()) {
            out.push_back(s[i + 1]);
            i++;
            continue;
        }
        out.push_back(ch);
    }
    return out;
}

static std::vector<std::string> parseStringArray(const std::string& json) {
    std::string s = json;
    if (s == "[]" || s.empty()) return {};
  if (s.front() != '[') return { stripQuotes(s) };
    std::vector<std::string> out;
    size_t i = 1;
    while (i < s.size()) {
        while (i < s.size() && (s[i] == ' ' || s[i] == ',')) i++;
        if (i >= s.size() || s[i] == ']') break;
        if (s[i] == '"') {
            i++;
            std::string token;
            while (i < s.size()) {
                char ch = s[i];
              if (ch == '\\\\' && i + 1 < s.size()) {
                    token.push_back(s[i + 1]);
                    i += 2;
                    continue;
                }
                if (ch == '"') {
                    i++;
                    break;
                }
                token.push_back(ch);
                i++;
            }
            out.push_back(token);
        } else {
            size_t start = i;
            while (i < s.size() && s[i] != ',' && s[i] != ']') i++;
            std::string token = s.substr(start, i - start);
            while (!token.empty() && token.front() == ' ') token.erase(token.begin());
            while (!token.empty() && token.back() == ' ') token.pop_back();
            out.push_back(token == "null" ? std::string("null") : token);
        }
    }
    return out;
}

static std::vector<std::vector<long long>> parseLongMatrix(const std::string& json) {
    std::string s = json;
    if (s == "[]" || s.empty()) return {};
  if (s.front() != '[') return { parseLongArray(s) };
    std::vector<std::vector<long long>> out;
    size_t i = 0;
    while (i < s.size() && s[i] != '[') i++;
    i++;
    while (i < s.size()) {
        while (i < s.size() && (s[i] == ' ' || s[i] == ',')) i++;
        if (i >= s.size() || s[i] == ']') break;
        size_t start = i;
        int depth = 0;
        while (i < s.size()) {
            if (s[i] == '[') depth++;
            else if (s[i] == ']') {
                depth--;
                if (depth == 0) {
                    i++;
                    break;
                }
            }
            i++;
        }
        out.push_back(parseLongArray(s.substr(start, i - start)));
    }
    return out;
}

static std::vector<std::vector<std::string>> parseStringMatrix(const std::string& json) {
    std::string s = json;
    if (s == "[]" || s.empty()) return {};
  if (s.front() != '[') return { parseStringArray(s) };
    std::vector<std::vector<std::string>> out;
    size_t i = 0;
    while (i < s.size() && s[i] != '[') i++;
    i++;
    while (i < s.size()) {
        while (i < s.size() && (s[i] == ' ' || s[i] == ',')) i++;
        if (i >= s.size() || s[i] == ']') break;
        size_t start = i;
        int depth = 0;
        while (i < s.size()) {
            if (s[i] == '[') depth++;
            else if (s[i] == ']') {
                depth--;
                if (depth == 0) {
                    i++;
                    break;
                }
            }
            i++;
        }
        auto row = parseStringArray(s.substr(start, i - start));
        out.push_back(std::move(row));
    }
    return out;
}

static std::string escape(const std::string& value) {
    std::string out;
    out.reserve(value.size());
    for (char ch : value) {
    if (ch == '\\\\' || ch == '"') out.push_back('\\\\');
        out.push_back(ch);
    }
    return out;
}

static std::string toJson(const std::vector<long long>& arr) {
    std::string out = "[";
    for (size_t i = 0; i < arr.size(); i++) {
        if (i) out += ',';
        out += std::to_string(arr[i]);
    }
    out += "]";
    return out;
}

static std::string toJson(const std::vector<std::string>& arr) {
    std::string out = "[";
    for (size_t i = 0; i < arr.size(); i++) {
        if (i) out += ',';
        out += '"' + escape(arr[i]) + '"';
    }
    out += "]";
    return out;
}

static std::string toJson(const std::vector<std::vector<long long>>& matrix) {
    std::string out = "[";
    for (size_t i = 0; i < matrix.size(); i++) {
        if (i) out += ',';
        out += toJson(matrix[i]);
    }
    out += "]";
    return out;
}

static std::string toJson(const std::vector<std::vector<std::string>>& matrix) {
    std::string out = "[";
    for (size_t i = 0; i < matrix.size(); i++) {
        if (i) out += ',';
        out += toJson(matrix[i]);
    }
    out += "]";
    return out;
}

std::string __doflow_entry(const std::vector<std::string>& rawArgs) {
    auto result = ${callExpr};
    return ${formatResult};
}
`;
};

async function seedHackWithInfyCourse() {
  const courseTitle = HACKWITHINFY_COURSE_SEED.course.title;
  const courseSlug = slugify(courseTitle);

  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set. Add it to backend/.env before seeding.');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminUser = await User.findOne({ role: 'admin' }).sort({ createdAt: 1 });
    if (!adminUser) {
      throw new Error('No admin user found. Create one first (backend/scripts/createAdmin.js).');
    }

    let course = await Course.findOne({ slug: courseSlug });

    if (!course) {
      course = await Course.create({
        ...HACKWITHINFY_COURSE_SEED.course,
        instructor: adminUser._id,
      });
      console.log(`✅ Created course: ${course.title} (${course._id})`);
    } else {
      course.title = HACKWITHINFY_COURSE_SEED.course.title;
      course.shortDescription = HACKWITHINFY_COURSE_SEED.course.shortDescription;
      course.description = HACKWITHINFY_COURSE_SEED.course.description;
      course.tags = HACKWITHINFY_COURSE_SEED.course.tags;
      course.category = HACKWITHINFY_COURSE_SEED.course.category;
      course.level = HACKWITHINFY_COURSE_SEED.course.level;
      course.price = HACKWITHINFY_COURSE_SEED.course.price;
      course.thumbnail = HACKWITHINFY_COURSE_SEED.course.thumbnail;
      course.language = HACKWITHINFY_COURSE_SEED.course.language;
      course.isPublished = HACKWITHINFY_COURSE_SEED.course.isPublished;
      course.isFeatured = HACKWITHINFY_COURSE_SEED.course.isFeatured;
      course.isDSA = true;
      course.whatYouWillLearn = HACKWITHINFY_COURSE_SEED.course.whatYouWillLearn;
      course.requirements = HACKWITHINFY_COURSE_SEED.course.requirements;
      course.instructor = course.instructor || adminUser._id;

      await course.save();
      console.log(`✅ Updated course: ${course.title} (${course._id})`);
    }

    if (resetEnabled()) {
      const existingSections = await RoadmapSection.find({ course: course._id }).select('_id');
      const sectionIds = existingSections.map((s) => s._id);
      if (sectionIds.length) {
        await Problem.deleteMany({ section: { $in: sectionIds } });
      }
      await RoadmapSection.deleteMany({ course: course._id });
      console.log('🧹 Reset enabled: removed existing sections & problems for this course');
    }

    const existingSections = await RoadmapSection.find({ course: course._id });
    const sectionByTitle = new Map(existingSections.map((s) => [s.title, s]));

    for (const sectionSeed of HACKWITHINFY_COURSE_SEED.sections) {
      let section = sectionByTitle.get(sectionSeed.title);

      if (!section) {
        section = await RoadmapSection.create({
          title: sectionSeed.title,
          description: sectionSeed.description,
          order: sectionSeed.order,
          course: course._id,
        });
        sectionByTitle.set(section.title, section);
        console.log(`📦 Created section: ${section.title}`);
      } else {
        section.title = sectionSeed.title;
        section.description = sectionSeed.description;
        section.order = sectionSeed.order;
        await section.save();
        console.log(`🧩 Updated section: ${section.title}`);
      }
    }

    let inserted = 0;
    let skipped = 0;

    for (const problemSeed of HACKWITHINFY_COURSE_SEED.problems) {
      const section = sectionByTitle.get(problemSeed.section);
      if (!section) {
        throw new Error(`Unknown section for problem "${problemSeed.title}": ${problemSeed.section}`);
      }

      const existing = await Problem.findOne({
        course: course._id,
        section: section._id,
        title: problemSeed.title,
      }).select('_id');

      const representativeArgs = getRepresentativeArgs(problemSeed);
      const argKinds = representativeArgs.map((value) => inferArgKind(value));
      const returnKind = inferReturnKind(problemSeed);

      const jsName = toJsIdentifier(problemSeed.title);
      const pyName = toPyIdentifier(problemSeed.title);
      const javaName = toJsIdentifier(problemSeed.title);
      const cppName = toJsIdentifier(problemSeed.title);
      const cName = toJsIdentifier(problemSeed.title);

      const jsVisible = buildJavascriptVisible(jsName, problemSeed.params || []);
      const pyVisible = buildPythonVisible(pyName, problemSeed.params || []);
      const javaVisible = buildJavaVisible(javaName, problemSeed.params || [], argKinds, returnKind);
      const cppVisible = buildCppVisible(cppName, problemSeed.params || [], argKinds, returnKind);
      const cVisible = buildCVisible(cName, problemSeed.params || [], argKinds, returnKind);

      const starterCode = [
        {
          language: 'javascript',
          visibleCode: jsVisible,
          adapterCode: buildJavascriptAdapter(jsName),
          code: jsVisible,
        },
        {
          language: 'python',
          visibleCode: pyVisible,
          adapterCode: buildPythonAdapter(pyName),
          code: pyVisible,
        },
        {
          language: 'java',
          visibleCode: javaVisible,
          adapterCode: buildJavaAdapter(javaName, problemSeed.params || [], argKinds, returnKind),
          code: javaVisible,
        },
        {
          language: 'cpp',
          visibleCode: cppVisible,
          adapterCode: buildCppAdapter(cppName, problemSeed.params || [], argKinds, returnKind),
          code: cppVisible,
        },
        {
          language: 'c',
          visibleCode: cVisible,
          adapterCode: buildCAdapter(cName, problemSeed.params || [], argKinds, returnKind),
          code: cVisible,
        },
      ];

      const payload = {
        title: problemSeed.title,
        difficulty: normalizeDifficulty(problemSeed.difficulty),
        description: ensureDetailedStatement(problemSeed, returnKind),
        examples: ensurePublicExampleWithExplanation(problemSeed),
        constraints: problemSeed.constraints || [],
        hints: problemSeed.hints || [],
        testCases: expandHackWithInfyTestCases(problemSeed, { targetHidden: 50 }),
        starterCode,
        section: section._id,
        course: course._id,
        order: Number(problemSeed.order) || 0,
        isFree: section.order === 1,
      };

      if (existing) {
        await Problem.updateOne({ _id: existing._id }, payload, { runValidators: true });
        skipped += 1;
      } else {
        await Problem.create(payload);
        inserted += 1;
      }
    }

    const totalProblems = await Problem.countDocuments({ course: course._id });

    console.log('\n🎉 HackWithInfy DSA course seeded successfully!');
    console.log(`Course ID: ${course._id}`);
    console.log(`Inserted: ${inserted}, Updated: ${skipped}, Total: ${totalProblems}`);
    console.log(`Admin UI: http://localhost:5174/#/admin/dsa-course`);
    console.log(`Problems: http://localhost:5174/#/dsa/problems/${course._id}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedHackWithInfyCourse();
