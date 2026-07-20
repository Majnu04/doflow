const escapeForDoubleQuotes = (value = '') => {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r/g, '\\r')
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"');
};

const stringifyArgValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
};

const splitTopLevel = (input) => {
  const parts = [];
  let current = '';
  let depth = 0;
  const openings = '([{';
  const closings = ')]}';

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === ',' && depth === 0) {
      if (current.trim().length) {
        parts.push(current.trim());
      }
      current = '';
      continue;
    }

    current += char;

    const openIndex = openings.indexOf(char);
    if (openIndex !== -1) {
      depth += 1;
      continue;
    }

    const closeIndex = closings.indexOf(char);
    if (closeIndex !== -1 && depth > 0) {
      depth -= 1;
    }
  }

  if (current.trim().length) {
    parts.push(current.trim());
  }

  return parts;
};

const tryParseLiteral = (value) => {
  const trimmed = value.trim();
  if (!trimmed.length) return '';
  try {
    return JSON.parse(trimmed);
  } catch (error) {
    return trimmed;
  }
};

const parseTestCaseArgs = (rawInput) => {
  if (rawInput === null || rawInput === undefined) {
    return { jsonArgs: [], stringArgs: [] };
  }

  const normalized = String(rawInput).trim();
  if (!normalized.length) {
    return { jsonArgs: [], stringArgs: [] };
  }

  try {
    const parsed = JSON.parse(normalized);
    if (Array.isArray(parsed)) {
      return {
        jsonArgs: parsed,
        stringArgs: parsed.map(stringifyArgValue),
      };
    }

    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.args)) {
      return {
        jsonArgs: parsed.args,
        stringArgs: parsed.args.map(stringifyArgValue),
      };
    }

    return {
      jsonArgs: [parsed],
      stringArgs: [stringifyArgValue(parsed)],
    };
  } catch (error) {
    const parts = splitTopLevel(normalized);
    const extractedValues = parts
      .map(segment => {
        const equalsIndex = segment.indexOf('=');
        if (equalsIndex === -1) return null;
        const rhs = segment.slice(equalsIndex + 1).trim();
        return rhs.length ? rhs : null;
      })
      .filter(Boolean);

    if (extractedValues.length > 0) {
      const jsonArgs = extractedValues.map(value => tryParseLiteral(value));
      const stringArgs = extractedValues.map(value => stringifyArgValue(value));
      return { jsonArgs, stringArgs };
    }

    return {
      jsonArgs: [normalized],
      stringArgs: [normalized],
    };
  }
};

const LANGUAGE_IMPORT_PATTERNS = {
  javascript: [/^import\s+/i],
  python: [/^(?:from\s+\S+\s+import|import\s+)/i],
  java: [/^import\s+.+;/i],
  cpp: [/^#include\s+.+/i, /^using\s+namespace\s+/i],
  c: [/^#include\s+.+/i],
};

const splitSourceSections = (language, source = '') => {
  const lines = String(source || '')
    .replace(/\r\n/g, '\n')
    .split('\n');
  const imports = [];
  const packages = [];
  const body = [];
  const patterns = LANGUAGE_IMPORT_PATTERNS[language] || [];
  let stillInHeader = true;

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed.length && stillInHeader) {
      // Preserve spacing until real body begins
      body.push(line);
      return;
    }

    if (language === 'java' && trimmed.startsWith('package ')) {
      packages.push(line);
      return;
    }

    if (stillInHeader && patterns.some((pattern) => pattern.test(trimmed))) {
      imports.push(line);
      return;
    }

    stillInHeader = false;
    body.push(line);
  });

  return {
    imports: imports.filter((line) => line.trim().length),
    packageLines: packages,
    body: body.join('\n').trim(),
  };
};

const mergeSourceWithAdapter = (language, userCode = '', adapterCode = '') => {
  const sanitizedUser = (userCode || '').trim();
  const sanitizedAdapter = (adapterCode || '').trim();
  if (!sanitizedAdapter) {
    return sanitizedUser;
  }

  const userSections = splitSourceSections(language, sanitizedUser);
  const adapterSections = splitSourceSections(language, sanitizedAdapter);

  const dedupedAdapterImports = adapterSections.imports.filter((line) => {
    const normalized = line.trim();
    return !userSections.imports.some((existing) => existing.trim() === normalized);
  });

  const segments = [];
  if (userSections.packageLines.length) {
    segments.push(userSections.packageLines.join('\n'));
  }
  if (userSections.imports.length) {
    segments.push(userSections.imports.join('\n'));
  }
  if (dedupedAdapterImports.length) {
    segments.push(dedupedAdapterImports.join('\n'));
  }
  if (userSections.body.length) {
    segments.push(userSections.body);
  }
  if (adapterSections.body.length) {
    segments.push(adapterSections.body);
  }

  return segments.filter(Boolean).join('\n\n').trim();
};

const buildJavascriptHarness = (userCode, parsedArgs, options = {}) => {
  const entryInvocation = options.entryInvocation || 'solve(...__doflowArgs)';
  const requiresSolveGuard = !options.hasAdapter;
  const argsLiteral = JSON.stringify(parsedArgs.jsonArgs);
  return `"use strict";
${userCode}

const __doflowArgs = ${argsLiteral};
${requiresSolveGuard ? "if (typeof solve !== 'function') {\n  throw new Error('solve function is not defined. Please declare function solve(...args).');\n}\n" : ''}
const __formatResult = (value) => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch (error) { return String(value); }
  }
  return String(value);
};
const __output = ${entryInvocation};
process.stdout.write(__formatResult(__output));
`;
};

const buildPythonHarness = (userCode, parsedArgs, options = {}) => {
  const argsLiteral = JSON.stringify(parsedArgs.jsonArgs)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');
  const entryInvocation = options.entryInvocation || 'solve(*__doflow_args)';
  const requiresSolveGuard = !options.hasAdapter;

  return `${userCode}

import json
import sys

__doflow_args = json.loads("${argsLiteral}")
${requiresSolveGuard ? "if 'solve' not in globals():\n    raise Exception('solve function is not defined. Please declare def solve(*args): ...')\n" : ''}

def __format_result(value):
    if isinstance(value, str):
        return value
    try:
        return json.dumps(value, separators=(',', ':'))
    except TypeError:
        return str(value)

__result = ${entryInvocation}
sys.stdout.write(__format_result(__result))
`;
};

const buildJavaHarness = (userCode, parsedArgs, options = {}) => {
  const argsLiteral = parsedArgs.stringArgs.length
    ? parsedArgs.stringArgs.map((arg) => `"${escapeForDoubleQuotes(arg)}"`).join(', ')
    : '';
  const entryInvocation = options.entryInvocation || 'Solution.solve(rawArgs)';

  return `${userCode}

class Main {
    private static String stringify(Object value) {
        return value == null ? "" : value.toString();
    }

    public static void main(String[] args) throws Exception {
        String[] rawArgs = new String[]{${argsLiteral}};
        Object result = ${entryInvocation};
        System.out.print(stringify(result));
    }
}
`;
};

const buildCppHarness = (userCode, parsedArgs, options = {}) => {
  const argsLiteral = parsedArgs.stringArgs.length
    ? `{${parsedArgs.stringArgs.map((arg) => `"${escapeForDoubleQuotes(arg)}"`).join(', ')}}`
    : '{}';
  const entryInvocation = options.entryInvocation || 'solve(rawArgs)';

  return `#include <bits/stdc++.h>
using namespace std;
${userCode}

int main() {
    vector<string> rawArgs = ${argsLiteral};
    try {
        auto result = ${entryInvocation};
        cout << result;
    } catch (const exception& ex) {
        cout << "__HARNESS_ERROR__" << ex.what();
    } catch (...) {
        cout << "__HARNESS_ERROR__";
    }
    return 0;
}
`;
};

const buildCHarness = (userCode, parsedArgs, options = {}) => {
  const argsCount = parsedArgs.stringArgs.length;
  const arraySize = Math.max(argsCount, 1);
  const argsLiteral = argsCount
    ? parsedArgs.stringArgs.map((arg) => `    "${escapeForDoubleQuotes(arg)}"`).join(',\n')
    : '    ""';
  const entryInvocation = options.entryInvocation || 'solve(argc, argv)';

  return `#include <stdio.h>
#include <string.h>
${userCode}

int main() {
    const int argc = ${argsCount};
    const char* argv[${arraySize}] = {
${argsLiteral}
    };
    const char* result = ${entryInvocation};
    if (result != NULL) {
        fputs(result, stdout);
    }
    return 0;
}
`;
};

const HARNESS_BUILDERS = {
  javascript: buildJavascriptHarness,
  python: buildPythonHarness,
  java: buildJavaHarness,
  cpp: buildCppHarness,
  c: buildCHarness,
};

export const buildHarnessedSource = (language, userCode = '', testCase = {}, adapterCode = '', entryInvocation = null) => {
  const builder = HARNESS_BUILDERS[language];
  if (!builder) {
    throw new Error(`Language "${language}" is not supported for harness execution.`);
  }

  const parsedArgs = parseTestCaseArgs(testCase.input || '');
  const sanitizedUserCode = mergeSourceWithAdapter(language, userCode || '', adapterCode || '');
  if (!sanitizedUserCode.length) {
    throw new Error('Code cannot be empty. Please implement the required solve function.');
  }

  return builder(sanitizedUserCode, parsedArgs, { entryInvocation, hasAdapter: Boolean(adapterCode) });
};

export const describeLanguageContract = (language) => {
  switch (language) {
    case 'javascript':
      return 'function solve(...args) → string | number | object';
    case 'python':
      return 'def solve(*args) -> str | int | list';
    case 'java':
      return 'class Solution { static Object solve(String[] args) }';
    case 'cpp':
      return 'std::string solve(const std::vector<std::string>& args)';
    case 'c':
      return 'const char* solve(int argc, const char* argv[])';
    default:
      return 'solve signature varies by language';
  }
};
