import axios from 'axios';
import { Buffer } from 'buffer';
import judge0Queue from '../utils/judge0Queue.js';
import retryWithBackoff from '../utils/judge0Retry.js';

const LANGUAGE_MAPPING = {
  javascript: 93, // Node.js
  python: 71,     // Python 3.8.1
  java: 62,       // Java 15.0.2
  cpp: 54,        // C++ 17
  c: 50,          // C (GCC 9.2.0)
};

const buildJudge0Client = () => {
  const judge0ApiKey = process.env.JUDGE0_API_KEY;
  const isRapidApi = Boolean(judge0ApiKey);

  let judge0ApiUrl = process.env.JUDGE0_API_URL || (isRapidApi ? 'https://judge0-ce.p.rapidapi.com' : 'https://ce.judge0.com');

  if (!isRapidApi && /rapidapi/i.test(judge0ApiUrl)) {
    console.warn('⚠️ RapidAPI host configured but no API key found. Falling back to https://ce.judge0.com');
    judge0ApiUrl = 'https://ce.judge0.com';
  }

  const judge0Headers = isRapidApi
    ? {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': judge0ApiKey,
      }
    : {
        'Content-Type': 'application/json',
      };

  if (!judge0ApiKey) {
    console.warn('⚠️ Judge0 API Key not found. Using public Judge0 instance (https://ce.judge0.com) which has strict rate limits.');
  }

  return { judge0ApiUrl, judge0Headers };
};

const toBase64 = (str) => Buffer.from(str ?? '', 'utf-8').toString('base64');
const fromBase64 = (value) => {
  if (!value) return value;
  try {
    return Buffer.from(value, 'base64').toString('utf-8');
  } catch (error) {
    return value;
  }
};

// @desc    Run a small playground snippet (no DB writes)
// @route   POST /api/playground/run
// @access  Public
export const runPlayground = async (req, res) => {
  try {
    const { language, sourceCode, stdin } = req.body || {};

    const resolvedLanguage = String(language || '').toLowerCase();
    const languageId = LANGUAGE_MAPPING[resolvedLanguage];
    if (!languageId) {
      return res.status(400).json({ message: `Language "${language}" is not supported.` });
    }

    const source = String(sourceCode || '');
    if (!source.trim()) {
      return res.status(400).json({ message: 'sourceCode is required.' });
    }

    const client = buildJudge0Client();

    const payload = {
      language_id: languageId,
      source_code: toBase64(source),
      stdin: stdin !== undefined && stdin !== null ? toBase64(String(stdin)) : undefined,
    };

    const response = await judge0Queue.enqueue(() =>
      retryWithBackoff(
        () =>
          axios.post(
            `${client.judge0ApiUrl}/submissions?base64_encoded=true&wait=true`,
            payload,
            { headers: client.judge0Headers, timeout: 30000 }
          ),
        3,
        1000
      )
    );

    const raw = response.data || {};
    const stdout = (fromBase64(raw.stdout) || '').toString();
    const stderr = (fromBase64(raw.stderr) || '').toString();
    const compileOutput = (fromBase64(raw.compile_output) || '').toString();
    const message = (fromBase64(raw.message) || '').toString();

    const timeSeconds = raw.time !== undefined && raw.time !== null ? Number(raw.time) : null;
    const executionTimeMs = Number.isFinite(timeSeconds) ? Number(timeSeconds * 1000) : null;
    const memoryKb = raw.memory !== undefined && raw.memory !== null ? Number(raw.memory) : null;

    res.json({
      status: raw.status || null,
      stdout,
      stderr,
      compileOutput,
      message,
      executionTimeMs,
      memoryKb,
    });
  } catch (error) {
    console.error('❌ Error in runPlayground:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: error.message || 'Failed to run playground code.' });
  }
};
