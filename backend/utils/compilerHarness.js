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

  const stripCStyleMain = (code = '') => {
    const src = String(code);
    const match = /\b(?:int|signed\s+int|signed)\s+main\s*\([^)]*\)\s*\{/m.exec(src);
    if (!match) return src;
    const braceStart = src.indexOf('{', match.index);
    if (braceStart === -1) return src;
    let depth = 0;
    for (let i = braceStart; i < src.length; i += 1) {
      const ch = src[i];
      if (ch === '{') depth += 1;
      if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          return `${src.slice(0, match.index)}\n\n${src.slice(i + 1)}`;
        }
      }
    }
    return src;
  };

  const stripPythonMainGuard = (code = '') => {
    const lines = String(code).replace(/\r\n/g, '\n').split('\n');
    const out = [];
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const match = /^\s*if\s+__name__\s*==\s*['\"]__main__['\"]\s*:\s*$/.exec(line);
      if (!match) {
        out.push(line);
        continue;
      }
      const baseIndent = line.match(/^\s*/)?.[0].length ?? 0;
      i += 1;
      while (i < lines.length) {
        const next = lines[i];
        if (!next.trim()) {
          i += 1;
          continue;
        }
        const nextIndent = next.match(/^\s*/)?.[0].length ?? 0;
        if (nextIndent <= baseIndent) {
          i -= 1;
          break;
        }
        i += 1;
      }
    }
    return out.join('\n');
  };

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
  // For C, the adapter often provides typedefs/helpers that user code may rely on.
  // Put the adapter body first so user code can reference those types safely.
  // For C++ we keep user code first to avoid requiring forward declarations.
  if (language === 'c') {
    if (adapterSections.body.length) {
      segments.push(adapterSections.body);
    }
    if (userSections.body.length) {
      segments.push(userSections.body);
    }
  } else {
    if (userSections.body.length) {
      segments.push(userSections.body);
    }
    if (adapterSections.body.length) {
      segments.push(adapterSections.body);
    }
  }

  let merged = segments.filter(Boolean).join('\n\n').trim();

  if (language === 'java') {
    // Java single-file compilation (Main.java) fails if any other top-level class is `public`.
    // Make the platform/editor more forgiving for the common cases.
    merged = merged
      .replace(/(^|\n)\s*public\s+final\s+class\s+DoFlowAdapter\b/gm, '$1final class DoFlowAdapter')
      .replace(/(^|\n)\s*public\s+class\s+DoFlowAdapter\b/gm, '$1class DoFlowAdapter')
      .replace(/(^|\n)\s*public\s+final\s+class\s+Solution\b/gm, '$1final class Solution')
      .replace(/(^|\n)\s*public\s+class\s+Solution\b/gm, '$1class Solution');

    // Avoid clashes with the harness `class Main`.
    merged = merged
      .replace(/(^|\n)\s*public\s+class\s+Main\b/gm, '$1class UserMain')
      .replace(/(^|\n)\s*class\s+Main\b/gm, '$1class UserMain');
  }

  if (language === 'python') {
    merged = stripPythonMainGuard(merged).trim();
  }

  if (language === 'cpp' || language === 'c') {
    // Users sometimes paste a full program with `main()`. Our harness supplies `main()`.
    merged = stripCStyleMain(merged).trim();
  }

  return merged;
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
    throw new Error('Code cannot be empty. Please implement the required function/method shown in the stub.');
  }

  return builder(sanitizedUserCode, parsedArgs, { entryInvocation, hasAdapter: Boolean(adapterCode) });
};

const buildBatchJavascriptHarness = (userCode, parsedCases, options = {}) => {
  const entryInvocation = options.entryInvocation || 'solve(...__doflowArgs)';
  const requiresSolveGuard = !options.hasAdapter;
  const casesLiteral = JSON.stringify(parsedCases);

  return `"use strict";
${userCode}

const __cases = ${casesLiteral};
${requiresSolveGuard ? "if (typeof solve !== 'function') {\n  throw new Error('solve function is not defined. Please declare function solve(...args).');\n}\n" : ''}
const __formatResult = (value) => {
  if (value === undefined || value === null) return '';
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch (error) { return String(value); }
  }
  return String(value);
};

for (let i = 0; i < __cases.length; i++) {
  const __doflowArgs = __cases[i].args;
  const __expected = __cases[i].expected;
  const __output = ${entryInvocation};
  const __actual = __formatResult(__output);
  if (__actual !== __expected) {
    process.stdout.write('FAIL');
    process.exit(0);
  }
}

process.stdout.write('OK');
`;
};

const buildBatchPythonHarness = (userCode, parsedCases, options = {}) => {
  const entryInvocation = options.entryInvocation || 'solve(*__doflow_args)';
  const requiresSolveGuard = !options.hasAdapter;
  const casesLiteral = JSON.stringify(parsedCases)
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"');

  return `${userCode}

import json
import sys

__cases = json.loads("${casesLiteral}")
${requiresSolveGuard ? "if 'solve' not in globals():\n    raise Exception('solve function is not defined. Please declare def solve(*args): ...')\n" : ''}

def __format_result(value):
    if isinstance(value, str):
        return value
    try:
        return json.dumps(value, separators=(',', ':'))
    except TypeError:
        return str(value)

for case in __cases:
    __doflow_args = case["args"]
    __expected = case["expected"]
    __result = ${entryInvocation}
    __actual = __format_result(__result)
    if __actual != __expected:
        sys.stdout.write('FAIL')
        sys.exit(0)

sys.stdout.write('OK')
`;
};

const buildBatchJavaHarness = (userCode, parsedCases, options = {}) => {
  const entryInvocation = options.entryInvocation || 'Solution.solve(rawArgs)';

  const casesLiteral = parsedCases
    .map((item) => {
      const argsLiteral = (item.args || []).map((arg) => `\"${escapeForDoubleQuotes(arg)}\"`).join(', ');
      return `new String[]{${argsLiteral}}`;
    })
    .join(', ');

  const expectedLiteral = parsedCases
    .map((item) => `\"${escapeForDoubleQuotes(item.expected || '')}\"`)
    .join(', ');

  return `${userCode}

class Main {
    private static String stringify(Object value) {
        return value == null ? "" : value.toString();
    }

    public static void main(String[] args) throws Exception {
        String[][] cases = new String[][]{${casesLiteral}};
        String[] expected = new String[]{${expectedLiteral}};

        for (int i = 0; i < cases.length; i++) {
            String[] rawArgs = cases[i];
            Object result = ${entryInvocation};
            String actual = stringify(result);
            if (!actual.equals(expected[i])) {
                System.out.print("FAIL");
                return;
            }
        }

        System.out.print("OK");
    }
}
`;
};

const buildBatchCppHarness = (userCode, parsedCases, options = {}) => {
  const entryInvocation = options.entryInvocation || 'solve(rawArgs)';
  const casesLiteral = parsedCases
    .map((item) => {
      const argsLiteral = (item.args || []).map((arg) => `\"${escapeForDoubleQuotes(arg)}\"`).join(', ');
      return `{${argsLiteral}}`;
    })
    .join(',\n        ');
  const expectedLiteral = parsedCases
    .map((item) => `\"${escapeForDoubleQuotes(item.expected || '')}\"`)
    .join(',\n        ');

  return `#include <bits/stdc++.h>
using namespace std;
${userCode}

int main() {
    vector<vector<string>> cases = {
        ${casesLiteral}
    };
    vector<string> expected = {
        ${expectedLiteral}
    };

    for (size_t i = 0; i < cases.size(); i++) {
        const vector<string>& rawArgs = cases[i];
        string actual;
        try {
            actual = ${entryInvocation};
        } catch (...) {
            cout << "FAIL";
            return 0;
        }
        if (actual != expected[i]) {
            cout << "FAIL";
            return 0;
        }
    }

    cout << "OK";
    return 0;
}
`;
};

const buildBatchCHarness = (userCode, parsedCases, options = {}) => {
  const entryInvocation = options.entryInvocation || 'solve(argc, argv)';
  const maxArgs = Math.max(1, ...parsedCases.map((item) => (item.args || []).length));
  const casesLiteral = parsedCases
    .map((item) => {
      const args = item.args || [];
      const filled = Array.from({ length: maxArgs }, (_, i) => args[i] ?? '');
      const argvLiteral = filled.map((arg) => `\"${escapeForDoubleQuotes(arg)}\"`).join(', ');
      const expected = `\"${escapeForDoubleQuotes(item.expected || '')}\"`;
      return `{ ${args.length}, { ${argvLiteral} }, ${expected} }`;
    })
    .join(',\n    ');

  return `#include <stdio.h>
#include <string.h>
${userCode}

typedef struct {
    int argc;
    const char* argv[${maxArgs}];
    const char* expected;
} DoFlowCase;

int main() {
    DoFlowCase cases[] = {
    ${casesLiteral}
    };
    int total = (int)(sizeof(cases) / sizeof(cases[0]));

    for (int i = 0; i < total; i++) {
    int argc = cases[i].argc;
    const char** argv = cases[i].argv;
        const char* result = ${entryInvocation};
        const char* actual = result ? result : "";
        if (strcmp(actual, cases[i].expected) != 0) {
            fputs("FAIL", stdout);
            return 0;
        }
    }

    fputs("OK", stdout);
    return 0;
}
`;
};

const BATCH_HARNESS_BUILDERS = {
  javascript: buildBatchJavascriptHarness,
  python: buildBatchPythonHarness,
  java: buildBatchJavaHarness,
  cpp: buildBatchCppHarness,
  c: buildBatchCHarness,
};

export const buildBatchHarnessedSource = (language, userCode = '', testCases = [], adapterCode = '', entryInvocation = null) => {
  const builder = BATCH_HARNESS_BUILDERS[language];
  if (!builder) {
    throw new Error(`Language "${language}" is not supported for batch harness execution.`);
  }
  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new Error('Batch test cases are required for execution.');
  }

  const sanitizedUserCode = mergeSourceWithAdapter(language, userCode || '', adapterCode || '');
  if (!sanitizedUserCode.length) {
    throw new Error('Code cannot be empty. Please implement the required function/method shown in the stub.');
  }

  const parsedCases = testCases.map((testCase) => {
    const parsedArgs = parseTestCaseArgs(testCase?.input || '');
    return {
      args: language === 'javascript' || language === 'python' ? parsedArgs.jsonArgs : parsedArgs.stringArgs,
      expected: String(testCase?.expectedOutput ?? '').trim(),
    };
  });

  return builder(sanitizedUserCode, parsedCases, { entryInvocation, hasAdapter: Boolean(adapterCode) });
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
