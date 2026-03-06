/**
 * Import Deduplication Utility
 * Parses and deduplicates import statements across adapter, starter, and user code
 * to prevent duplicate import errors in Judge0 submissions
 */

/**
 * Parse imports from JavaScript/Node.js code
 */
const parseJavaScriptImports = (code) => {
  const imports = new Map();
  const importRegex = /(?:^|\n)\s*(import\s+.*?from\s+['"]([^'"]+)['"]|const\s+.*?=\s*require\(['"]([^'"]+)['"]\))/gm;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const fullStatement = match[1];
    const module = match[2] || match[3];
    
    if (module && !imports.has(module)) {
      imports.set(module, fullStatement);
    }
  }
  
  return imports;
};

/**
 * Parse imports from Python code
 */
const parsePythonImports = (code) => {
  const imports = new Map();
  const importRegex = /(?:^|\n)\s*((?:from\s+[\w.]+\s+)?import\s+[^#\n]+)/gm;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const fullStatement = match[1].trim();
    
    // Extract module name as key
    const moduleMatch = fullStatement.match(/(?:from\s+([\w.]+)|import\s+([\w.]+))/);
    const module = moduleMatch ? (moduleMatch[1] || moduleMatch[2]) : fullStatement;
    
    if (module && !imports.has(module)) {
      imports.set(module, fullStatement);
    }
  }
  
  return imports;
};

/**
 * Parse imports from Java code
 */
const parseJavaImports = (code) => {
  const imports = new Map();
  const importRegex = /(?:^|\n)\s*(import\s+(?:static\s+)?[\w.]+(?:\.\*)?;)/gm;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const fullStatement = match[1].trim();
    
    // Extract package name as key
    const packageMatch = fullStatement.match(/import\s+(?:static\s+)?([\w.]+)/);
    const packageName = packageMatch ? packageMatch[1] : fullStatement;
    
    if (packageName && !imports.has(packageName)) {
      imports.set(packageName, fullStatement);
    }
  }
  
  return imports;
};

/**
 * Parse imports from C++ code
 */
const parseCppImports = (code) => {
  const imports = new Map();
  const includeRegex = /(?:^|\n)\s*(#include\s*[<"]([^>"]+)[>"])/gm;
  
  let match;
  while ((match = includeRegex.exec(code)) !== null) {
    const fullStatement = match[1].trim();
    const header = match[2];
    
    if (header && !imports.has(header)) {
      imports.set(header, fullStatement);
    }
  }
  
  return imports;
};

/**
 * Parse imports from C code
 */
const parseCImports = (code) => {
  return parseCppImports(code); // Same logic
};

/**
 * Remove import statements from code
 */
const removeImports = (code, language) => {
  switch (language) {
    case 'javascript':
      return code.replace(/(?:^|\n)\s*(?:import\s+.*?from\s+['"][^'"]+['"]|const\s+.*?=\s*require\(['"][^'"]+['"]\)).*?(?:\n|$)/gm, '');
    
    case 'python':
      return code.replace(/(?:^|\n)\s*(?:from\s+[\w.]+\s+)?import\s+[^#\n]+.*?(?:\n|$)/gm, '');
    
    case 'java':
      return code.replace(/(?:^|\n)\s*import\s+(?:static\s+)?[\w.]+(?:\.\*)?;.*?(?:\n|$)/gm, '');
    
    case 'cpp':
    case 'c':
      return code.replace(/(?:^|\n)\s*#include\s*[<"][^>"]+[>"].*?(?:\n|$)/gm, '');
    
    default:
      return code;
  }
};

/**
 * Main deduplication function
 * Combines adapter, starter, and user code with deduplicated imports
 * 
 * @param {string} adapterCode - Adapter wrapper code
 * @param {string} starterCode - Starter template code
 * @param {string} userCode - User's solution code
 * @param {string} language - Programming language
 * @returns {string} - Combined code with deduplicated imports
 */
export const deduplicateImports = (adapterCode = '', starterCode = '', userCode = '', language) => {
  const parsers = {
    javascript: parseJavaScriptImports,
    python: parsePythonImports,
    java: parseJavaImports,
    cpp: parseCppImports,
    c: parseCImports,
  };

  const parser = parsers[language];
  if (!parser) {
    // Unsupported language - return code as-is
    return `${adapterCode}\n${starterCode}\n${userCode}`;
  }

  // Parse imports from each section
  const adapterImports = parser(adapterCode);
  const starterImports = parser(starterCode);
  const userImports = parser(userCode);

  // Merge imports with priority: user > starter > adapter
  const mergedImports = new Map();
  
  // Add adapter imports first
  for (const [key, statement] of adapterImports) {
    mergedImports.set(key, statement);
  }
  
  // Override with starter imports
  for (const [key, statement] of starterImports) {
    mergedImports.set(key, statement);
  }
  
  // Override with user imports (highest priority)
  for (const [key, statement] of userImports) {
    mergedImports.set(key, statement);
  }

  // Remove imports from individual code sections
  const cleanAdapter = removeImports(adapterCode, language).trim();
  const cleanStarter = removeImports(starterCode, language).trim();
  const cleanUser = removeImports(userCode, language).trim();

  // Rebuild code with deduplicated imports at top
  const importsSection = Array.from(mergedImports.values()).join('\n');
  const codeSection = [cleanAdapter, cleanStarter, cleanUser]
    .filter(code => code.length > 0)
    .join('\n\n');

  return `${importsSection}\n\n${codeSection}`;
};

/**
 * Extract only user-written code (removes imports)
 * Useful for displaying clean code in UI
 */
export const extractUserCode = (code, language) => {
  return removeImports(code, language).trim();
};

export default {
  deduplicateImports,
  extractUserCode,
};
