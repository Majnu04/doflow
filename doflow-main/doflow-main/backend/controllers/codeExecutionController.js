import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Security: Maximum execution time (5 seconds)
const MAX_EXECUTION_TIME = 5000;

// Security: Maximum output size (1MB)
const MAX_OUTPUT_SIZE = 1024 * 1024;

// Piston API for online code execution (free, no API key needed)
const PISTON_API_URL = 'https://emkc.org/api/v2/piston/execute';

// @desc    Execute Python code
// @route   POST /api/code/execute
// @access  Private
export const executeCode = async (req, res) => {
  const { code, language = 'python', input = '' } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  // Support Python and Java
  const supportedLanguages = ['python', 'java'];
  if (!supportedLanguages.includes(language.toLowerCase())) {
    return res.status(400).json({ 
      success: false, 
      message: `Language '${language}' is not supported. Supported: ${supportedLanguages.join(', ')}` 
    });
  }

  // Generate unique filename
  const fileId = crypto.randomUUID();
  const tempDir = path.join(__dirname, '..', 'temp');
  
  try {
    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    let result;
    
    if (language.toLowerCase() === 'java') {
      // Use online Piston API for Java execution
      result = await executeWithPiston(code, 'java', input);
    } else {
      const filePath = path.join(tempDir, `${fileId}.py`);
      await fs.writeFile(filePath, code, 'utf8');
      result = await executePython(filePath, input);
      await fs.unlink(filePath).catch(() => {});
    }

    res.json({
      success: true,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Code execution failed',
      error: error.message
    });
  }
};

// @desc    Validate Python code syntax
// @route   POST /api/code/validate
// @access  Private
export const validateCode = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code is required' });
  }

  const fileId = crypto.randomUUID();
  const tempDir = path.join(__dirname, '..', 'temp');
  const filePath = path.join(tempDir, `${fileId}.py`);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(filePath, code, 'utf8');

    // Check syntax using python -m py_compile
    const isValid = await validatePythonSyntax(filePath);

    await fs.unlink(filePath).catch(() => {});

    res.json({
      success: true,
      valid: isValid.valid,
      error: isValid.error
    });

  } catch (error) {
    await fs.unlink(filePath).catch(() => {});

    res.status(500).json({
      success: false,
      message: 'Validation failed',
      error: error.message
    });
  }
};

// Helper function to execute Python code
function executePython(filePath, input = '') {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let output = '';
    let errorOutput = '';
    let outputSize = 0;

    // Spawn Python process
    const pythonProcess = spawn('python', [filePath], {
      timeout: MAX_EXECUTION_TIME,
      killSignal: 'SIGKILL'
    });

    // Handle stdin
    if (input) {
      pythonProcess.stdin.write(input);
      pythonProcess.stdin.end();
    }

    // Collect stdout
    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      outputSize += chunk.length;

      if (outputSize > MAX_OUTPUT_SIZE) {
        pythonProcess.kill('SIGKILL');
        errorOutput = 'Output size limit exceeded (1MB max)';
      } else {
        output += chunk;
      }
    });

    // Collect stderr
    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    // Handle process completion
    pythonProcess.on('close', (code) => {
      const executionTime = Date.now() - startTime;

      resolve({
        output: output.trim(),
        error: errorOutput.trim(),
        executionTime,
        exitCode: code
      });
    });

    // Handle timeout
    pythonProcess.on('error', (err) => {
      const executionTime = Date.now() - startTime;

      if (err.code === 'ETIMEDOUT') {
        resolve({
          output: '',
          error: 'Execution timeout: Code took too long to execute (5s max)',
          executionTime,
          exitCode: -1
        });
      } else {
        resolve({
          output: '',
          error: `Execution error: ${err.message}`,
          executionTime,
          exitCode: -1
        });
      }
    });
  });
}

// Helper function to validate Python syntax
function validatePythonSyntax(filePath) {
  return new Promise((resolve) => {
    const pythonProcess = spawn('python', ['-m', 'py_compile', filePath], {
      timeout: 2000
    });

    let errorOutput = '';

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ valid: true, error: null });
      } else {
        // Parse error message
        const errorLines = errorOutput.split('\n');
        const relevantError = errorLines.find(line => 
          line.includes('SyntaxError') || 
          line.includes('IndentationError') ||
          line.includes('Error')
        ) || errorOutput;

        resolve({ 
          valid: false, 
          error: relevantError.trim() 
        });
      }
    });

    pythonProcess.on('error', (err) => {
      resolve({ 
        valid: false, 
        error: `Validation error: ${err.message}` 
      });
    });
  });
}

// Helper function to execute Java code
async function executeJava(code, tempDir, fileId, input = '') {
  return new Promise(async (resolve) => {
    const startTime = Date.now();
    
    // Extract class name from code (must be public class Main or similar)
    const classNameMatch = code.match(/public\s+class\s+(\w+)/);
    const className = classNameMatch ? classNameMatch[1] : 'Main';
    
    // Create a unique subdirectory for this execution
    const execDir = path.join(tempDir, fileId);
    const javaFile = path.join(execDir, `${className}.java`);
    
    try {
      // Create execution directory
      await fs.mkdir(execDir, { recursive: true });
      
      // Write Java file
      await fs.writeFile(javaFile, code, 'utf8');
      
      // Compile Java code
      const compileResult = await compileJava(javaFile, execDir);
      
      if (!compileResult.success) {
        // Clean up
        await fs.rm(execDir, { recursive: true, force: true }).catch(() => {});
        
        resolve({
          output: '',
          error: compileResult.error,
          executionTime: Date.now() - startTime,
          exitCode: 1
        });
        return;
      }
      
      // Run compiled Java class
      const runResult = await runJava(className, execDir, input);
      
      // Clean up
      await fs.rm(execDir, { recursive: true, force: true }).catch(() => {});
      
      resolve({
        output: runResult.output,
        error: runResult.error,
        executionTime: Date.now() - startTime,
        exitCode: runResult.exitCode
      });
      
    } catch (error) {
      // Clean up on error
      await fs.rm(execDir, { recursive: true, force: true }).catch(() => {});
      
      resolve({
        output: '',
        error: `Java execution error: ${error.message}`,
        executionTime: Date.now() - startTime,
        exitCode: -1
      });
    }
  });
}

// Helper function to compile Java code
function compileJava(javaFile, execDir) {
  return new Promise((resolve) => {
    const javacProcess = spawn('javac', [javaFile], {
      cwd: execDir,
      timeout: MAX_EXECUTION_TIME
    });
    
    let errorOutput = '';
    
    javacProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    javacProcess.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true, error: null });
      } else {
        // Clean up error message
        const cleanError = errorOutput
          .replace(/^.*\.java:\d+: /gm, 'Line ')
          .trim();
        resolve({ 
          success: false, 
          error: `Compilation Error:\n${cleanError || 'Unknown compilation error'}` 
        });
      }
    });
    
    javacProcess.on('error', (err) => {
      if (err.code === 'ENOENT') {
        resolve({ 
          success: false, 
          error: 'Java compiler (javac) not found. Please ensure JDK is installed.' 
        });
      } else {
        resolve({ 
          success: false, 
          error: `Compilation error: ${err.message}` 
        });
      }
    });
  });
}

// Helper function to run compiled Java class
function runJava(className, execDir, input = '') {
  return new Promise((resolve) => {
    let output = '';
    let errorOutput = '';
    let outputSize = 0;
    
    const javaProcess = spawn('java', [className], {
      cwd: execDir,
      timeout: MAX_EXECUTION_TIME,
      killSignal: 'SIGKILL'
    });
    
    // Handle stdin
    if (input) {
      javaProcess.stdin.write(input);
      javaProcess.stdin.end();
    }
    
    // Collect stdout
    javaProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      outputSize += chunk.length;
      
      if (outputSize > MAX_OUTPUT_SIZE) {
        javaProcess.kill('SIGKILL');
        errorOutput = 'Output size limit exceeded (1MB max)';
      } else {
        output += chunk;
      }
    });
    
    // Collect stderr
    javaProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });
    
    // Handle process completion
    javaProcess.on('close', (code) => {
      resolve({
        output: output.trim(),
        error: errorOutput.trim(),
        exitCode: code
      });
    });
    
    // Handle errors
    javaProcess.on('error', (err) => {
      if (err.code === 'ENOENT') {
        resolve({
          output: '',
          error: 'Java runtime not found. Please ensure JDK is installed.',
          exitCode: -1
        });
      } else if (err.code === 'ETIMEDOUT') {
        resolve({
          output: '',
          error: 'Execution timeout: Code took too long to execute (5s max)',
          exitCode: -1
        });
      } else {
        resolve({
          output: '',
          error: `Runtime error: ${err.message}`,
          exitCode: -1
        });
      }
    });
  });
}

// Execute code using Piston API (free online compiler)
async function executeWithPiston(code, language, input = '') {
  const startTime = Date.now();
  
  // Language mapping for Piston API
  const languageMap = {
    'java': { language: 'java', version: '15.0.2' },
    'python': { language: 'python', version: '3.10.0' },
    'javascript': { language: 'javascript', version: '18.15.0' },
    'c++': { language: 'c++', version: '10.2.0' }
  };
  
  const langConfig = languageMap[language.toLowerCase()] || languageMap['java'];
  
  try {
    const response = await fetch(PISTON_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        language: langConfig.language,
        version: langConfig.version,
        files: [{
          name: language.toLowerCase() === 'java' ? 'Main.java' : `main.${language}`,
          content: code
        }],
        stdin: input,
        run_timeout: MAX_EXECUTION_TIME
      })
    });
    
    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status}`);
    }
    
    const result = await response.json();
    const executionTime = Date.now() - startTime;
    
    // Handle compilation errors
    if (result.compile && result.compile.code !== 0) {
      return {
        output: '',
        error: `Compilation Error:\n${result.compile.stderr || result.compile.output || 'Unknown compilation error'}`,
        executionTime,
        exitCode: result.compile.code
      };
    }
    
    // Handle runtime output
    const runResult = result.run || {};
    return {
      output: (runResult.stdout || '').trim(),
      error: (runResult.stderr || '').trim(),
      executionTime,
      exitCode: runResult.code || 0
    };
    
  } catch (error) {
    return {
      output: '',
      error: `Code execution failed: ${error.message}`,
      executionTime: Date.now() - startTime,
      exitCode: -1
    };
  }
}
