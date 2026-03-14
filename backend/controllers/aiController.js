const getApiKey = () => {
  const apiKey = process.env.GROQ_API_KEY || process.env.GORK_API_KEY;
  if (!apiKey) {
    const error = new Error('GROQ_API_KEY (or GORK_API_KEY) is not configured. AI features are unavailable.');
    error.statusCode = 501;
    throw error;
  }
  return apiKey;
};

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const fetchGroqChatText = async ({ messages, temperature = 0.2, maxTokens = 512 }) => {
  const apiKey = getApiKey();
  const url = 'https://api.groq.com/openai/v1/chat/completions';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    const error = new Error(`Groq request failed (${response.status}). ${text}`.trim());
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  return String(content || '').trim();
};

const clampText = (value, maxLen) => {
  const text = String(value ?? '');
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen);
};

export const postComplexityInsights = async (req, res, next) => {
  try {
    const { language, code, problemTitle, metrics } = req.body || {};

    if (!language || !code || !String(code).trim()) {
      return res.status(400).json({ message: 'language and code are required.' });
    }

    const trimmedCode = clampText(code, 9000);
    const metricsSummary = metrics
      ? `Runtime (ms) — avg: ${metrics.averageMs ?? 'n/a'}, fastest: ${metrics.fastestMs ?? 'n/a'}, slowest: ${metrics.slowestMs ?? 'n/a'}; Peak memory (KB): ${metrics.peakMemoryKb ?? 'n/a'}.`
      : 'Runtime and memory metrics not available.';

    const instructions = `You are an algorithms mentor. Given a ${language} solution and recent runtime/memory metrics, summarize likely time and space complexity in Big-O terms. Provide:
- One sentence for time complexity.
- One sentence for space complexity.
- One practical optimization tip (if relevant).
Stay under 90 words total.`;

    const prompt = `${instructions}\n\nProblem: ${problemTitle || 'Untitled'}\nMetrics: ${metricsSummary}\n\nCode snippet:\n${trimmedCode}`;
    const insights = await fetchGroqChatText({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      maxTokens: 256,
    });
    return res.json({ insights });
  } catch (error) {
    return next(error);
  }
};

export const postDoubtChat = async (req, res, next) => {
  try {
    const { question, problemTitle, problemDescription, examples, language, code } = req.body || {};

    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: 'question is required.' });
    }

    const safeQuestion = clampText(question, 2000);
    const safeTitle = clampText(problemTitle, 200);
    const safeDescription = clampText(problemDescription, 8000);
    const safeCode = clampText(code, 8000);

    const examplesText = Array.isArray(examples)
      ? examples
          .slice(0, 3)
          .map((ex, idx) => {
            const input = clampText(ex?.input, 500);
            const output = clampText(ex?.output, 500);
            const explanation = clampText(ex?.explanation, 500);
            return `Example ${idx + 1}:\nInput: ${input}\nOutput: ${output}${explanation ? `\nExplanation: ${explanation}` : ''}`;
          })
          .join('\n\n')
      : '';

    const system = `You are a helpful DSA teaching assistant for a coding practice platform. Your job is to clarify the learner's doubt.
Rules:
- Do not mention hidden tests, internal harnesses, adapters, or judge implementation details.
- Do not request API keys or files.
- Be concise and actionable.
- If the user asks for full code, you may provide a high-level approach and a short snippet only if necessary.`;

    const prompt = `Problem: ${safeTitle || 'Untitled'}

  Statement:
  ${safeDescription || '(not provided)'}

  ${examplesText ? `Examples:
  ${examplesText}

  ` : ''}Language: ${language || 'unknown'}

  User's current code (may be incomplete):
  ${safeCode || '(no code provided)'}

  User question:
  ${safeQuestion}`;

    const answer = await fetchGroqChatText({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      maxTokens: 512,
    });
    return res.json({ answer });
  } catch (error) {
    return next(error);
  }
};

export const postAnswerFeedback = async (req, res, next) => {
  try {
    const { topic, question, expectedAnswer, userAnswer } = req.body || {};

    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: 'question is required.' });
    }
    if (!userAnswer || !String(userAnswer).trim()) {
      return res.status(400).json({ message: 'userAnswer is required.' });
    }

    const safeTopic = clampText(topic, 120);
    const safeQuestion = clampText(question, 800);
    const safeExpected = clampText(expectedAnswer, 2000);
    const safeUser = clampText(userAnswer, 2000);

    const system = `You are a strict-but-helpful interview evaluator for a C programming course.
Return ONLY valid JSON (no markdown).
Scoring rules:
- score: integer 0..5
- verdict: one of: "excellent" | "good" | "partial" | "wrong"
- feedback: 2-4 short bullet lines (plain text with '-' prefix)
- missingPoints: 1-3 bullet lines (plain text with '-' prefix)
Keep it concise.`;

    const prompt = `Topic: ${safeTopic || 'C'}

Interview question:
${safeQuestion}

Reference answer (may be empty):
${safeExpected || '(not provided)'}

Student answer:
${safeUser}

Now evaluate.`;

    const raw = await fetchGroqChatText({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.2,
      maxTokens: 420,
    });

    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      const err = new Error('AI returned invalid JSON.');
      err.statusCode = 502;
      throw err;
    }

    return res.json({
      score: Number.isFinite(Number(json?.score)) ? Number(json.score) : null,
      verdict: json?.verdict || null,
      feedback: String(json?.feedback || '').trim(),
      missingPoints: String(json?.missingPoints || '').trim(),
    });
  } catch (error) {
    return next(error);
  }
};

export const postLessonChat = async (req, res, next) => {
  try {
    const { lessonTitle, lessonContent, question } = req.body || {};

    if (!question || !String(question).trim()) {
      return res.status(400).json({ message: 'question is required.' });
    }

    const safeTitle = clampText(lessonTitle, 200);
    const safeLesson = clampText(lessonContent, 9000);
    const safeQuestion = clampText(question, 2000);

    const system = `You are DOFLOW Chatbot, a friendly C programming mentor.
Tone rules:
- Use simple Indian-English like the course notes: u, lang, ex, i.e.
- Explain deep but in short lines.
- Prefer step-by-step reasoning, small examples, and tiny ASCII diagrams when helpful.

Safety rules:
- Stay within the lesson topic/context.
- No external links.
- If the question needs code, give a minimal correct snippet and expected output.`;

    const prompt = `Lesson: ${safeTitle || 'Untitled Lesson'}

Lesson content (reference):
${safeLesson || '(not provided)'}

Student doubt:
${safeQuestion}

Answer now.`;

    const answer = await fetchGroqChatText({
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.25,
      maxTokens: 700,
    });

    return res.json({ answer });
  } catch (error) {
    return next(error);
  }
};
