
import { GoogleGenAI, Type } from "@google/genai";

const resolveApiKey = (): string | undefined => {
  // Prefer server-side environment variables
  if (typeof process !== 'undefined') {
    if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
    if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;
  }

  // Support Vite-style runtime config on the client
  if (typeof import.meta !== 'undefined' && (import.meta as any)?.env?.VITE_GEMINI_API_KEY) {
    return (import.meta as any).env.VITE_GEMINI_API_KEY;
  }

  // Optional window-injected config (for hosted deployments)
  if (typeof window !== 'undefined' && (window as any).__APP_CONFIG__?.geminiApiKey) {
    return (window as any).__APP_CONFIG__.geminiApiKey;
  }

  return undefined;
};

const API_KEY = resolveApiKey();

if (!API_KEY && typeof window === 'undefined') {
  console.info("[Gemini] API key not configured. Course Outline Generator is disabled until a key is provided.");
}

// Do NOT instantiate GoogleGenAI at module load. The constructor throws when run
// in a browser environment without a key. Lazily create the client only when an
// API key is present and generateCourseOutline is invoked.
let ai: GoogleGenAI | null = null;
const getClient = () => {
  if (!API_KEY) return null;
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
};

export const generateCourseOutline = async (topic: string): Promise<any> => {
  const client = getClient();
  if (!client) {
    // Fail fast with a clear error rather than causing an uncaught exception at import time.
    throw new Error("API key is not configured. Course Outline Generator is unavailable in this environment.");
  }

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a comprehensive course outline for a course on "${topic}". The outline should include modules, and within each module, a list of lesson titles. Return this as a JSON object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            courseTitle: { type: Type.STRING },
            courseDescription: { type: Type.STRING },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  moduleTitle: { type: Type.STRING },
                  lessons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                  },
                },
                required: ["moduleTitle", "lessons"],
              },
            },
          },
          required: ["courseTitle", "courseDescription", "modules"],
        },
      },
    });

    const jsonString = response.text;
    return JSON.parse(jsonString);

  } catch (error) {
    console.error("Error generating course outline:", error);
    throw new Error("Failed to generate course outline. Please check your API key and network connection.");
  }
};

interface ComplexityRequest {
  language: string;
  code: string;
  problemTitle?: string;
  metrics?: {
    averageMs?: number | null;
    fastestMs?: number | null;
    slowestMs?: number | null;
    peakMemoryKb?: number | null;
  };
}

export const explainSolutionComplexity = async ({ language, code, problemTitle, metrics }: ComplexityRequest): Promise<string> => {
  const client = getClient();
  if (!client) {
    throw new Error('API key is not configured. Complexity insights are unavailable in this environment.');
  }

  const trimmedCode = (code || '').slice(0, 8000);
  const metricsSummary = metrics
    ? `Runtime (ms) — avg: ${metrics.averageMs ?? 'n/a'}, fastest: ${metrics.fastestMs ?? 'n/a'}, slowest: ${metrics.slowestMs ?? 'n/a'}; Peak memory (KB): ${metrics.peakMemoryKb ?? 'n/a'}.`
    : 'Runtime and memory metrics not available.';

  const instructions = `You are an algorithms mentor. Given a ${language} solution and recent Judge0 performance metrics, summarize the likely time and space complexity in Big-O terms. Provide:
- A single sentence estimating time complexity.
- A single sentence estimating space complexity.
- One practical tip for optimizing if performance seems poor.
Stay under 90 words total.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${instructions}

Problem: ${problemTitle || 'Untitled'}
Metrics: ${metricsSummary}

Code snippet (truncate to stay within limits):
${trimmedCode}`,
            },
          ],
        },
      ],
    });

    return (response as any).text?.trim() || '';
  } catch (error) {
    console.error('Error generating complexity insights:', error);
    throw new Error('Failed to generate complexity insights.');
  }
};

// ── AI Mentor: Shared helper ─────────────────────────────────────────────────

const generateMentorResponse = async (instructions: string): Promise<string> => {
  const client = getClient();
  if (!client) {
    throw new Error('API key is not configured. AI Mentor is unavailable in this environment.');
  }

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: instructions,
    });

    const text = (response as any).text || (response as any).candidates?.[0]?.content?.parts?.[0]?.text;
    return text?.trim() || 'Unable to generate a response.';
  } catch (error) {
    console.error('AI Mentor error:', error);
    throw new Error('Unable to generate a response. Please try again.');
  }
};

// ── AI Tutor: Explain programming topics ─────────────────────────────────────
export const explainTopic = async (topic: string): Promise<string> => {
  const instructions = `You are an expert AI mentor inside the DoFlow Academy platform. You are warm, encouraging, and deeply knowledgeable.

Explain the topic given below in:
- Simple language that a beginner can understand
- 3-5 sentences maximum
- Include 1 real-life analogy/example
- Include 1 simple code example in Python

Format your response like this:
**Explanation:**
[Your explanation here]

**Real-Life Example:**
[Your analogy here]

**Code Example:**
\`\`\`python
[Your code here]
\`\`\`

Keep it concise and beginner-friendly.

Topic: ${topic}`;

  return generateMentorResponse(instructions);
};

// ── AI Mentor: Code Review ───────────────────────────────────────────────────
export const reviewCode = async (codeInput: string): Promise<string> => {
  const trimmed = codeInput.slice(0, 8000);

  const instructions = `You are a senior software engineer conducting a code review inside DoFlow Academy. Be thorough but encouraging.

Review the following code and provide feedback in these sections:

**Overall Assessment:**
[One sentence: is this code good, acceptable, or needs work?]

**Strengths:**
[List 2-3 things done well]

**Issues Found:**
[List issues with severity: 🔴 Critical / 🟡 Warning / 🔵 Suggestion]

**Optimized Version:**
[Show an improved version of the code if applicable, with brief inline comments explaining changes]

**Key Takeaway:**
[One actionable lesson the developer should remember]

Code to review:
\`\`\`
${trimmed}
\`\`\`

Keep the review focused, actionable, and constructive. Use code blocks for examples.`;

  return generateMentorResponse(instructions);
};

// ── AI Mentor: Study Plan ────────────────────────────────────────────────────
export const generateStudyPlan = async (goal: string): Promise<string> => {
  const instructions = `You are an expert learning coach inside DoFlow Academy. Create a structured, actionable study plan.

Based on the goal below, generate a week-by-week study plan. Be specific about topics, resources, and practice.

Format your response exactly like this:

**Goal:** [Restate the learning goal clearly]

**Duration:** [Suggested total duration]

**Week-by-Week Plan:**

**Week 1: [Theme]**
- Topics: [specific topics]
- Practice: [specific exercises or problems]
- Milestone: [what should be achieved by end of week]

**Week 2: [Theme]**
- Topics: [specific topics]
- Practice: [specific exercises or problems]
- Milestone: [what should be achieved by end of week]

[Continue for 4-6 weeks]

**Daily Routine:**
[Recommended daily study schedule]

**Tips for Success:**
[3-4 practical tips]

Goal: ${goal}`;

  return generateMentorResponse(instructions);
};

// ── AI Mentor: Career Guidance ───────────────────────────────────────────────
export const getCareerGuidance = async (question: string): Promise<string> => {
  const instructions = `You are a career coach and tech industry mentor inside DoFlow Academy. You have deep knowledge of the Indian and global tech job market.

Answer the following career question with practical, actionable advice.

Format your response like this:

**Direct Answer:**
[Clear, concise answer to the question]

**Action Steps:**
[3-5 numbered, specific things the person should do]

**Industry Insight:**
[Relevant market data, salary ranges, or trend information]

**Common Mistakes:**
[1-2 pitfalls to avoid]

**Resources:**
[Suggest 2-3 specific resources, platforms, or communities]

Be encouraging but honest. Tailor advice for someone in the Indian tech ecosystem where relevant.

Question: ${question}`;

  return generateMentorResponse(instructions);
};

// ── AI Mentor: Route by mode ─────────────────────────────────────────────────
type MentorMode = 'explain' | 'code-review' | 'study-plan' | 'career' | 'summarize' | 'flashcards' | 'quiz';

export const askMentor = async (mode: MentorMode, message: string): Promise<string> => {
  switch (mode) {
    case 'explain':
      return explainTopic(message);
    case 'code-review':
      return reviewCode(message);
    case 'study-plan':
      return generateStudyPlan(message);
    case 'career':
      return getCareerGuidance(message);
    case 'summarize':
      return summarizeLesson(message);
    case 'flashcards':
      return generateFlashcards(message);
    case 'quiz':
      return generateQuiz(message);
    default:
      return explainTopic(message);
  }
};

// ── AI Mentor: Summarize Lesson ─────────────────────────────────────────────
export const summarizeLesson = async (lessonText: string): Promise<string> => {
  const trimmed = lessonText.slice(0, 10000);

  const instructions = `You are a concise learning assistant inside DoFlow Academy. Summarize the following lesson content into a clear, structured summary.

Format your response like this:

**Key Concepts:**
[3-5 bullet points of core concepts covered]

**Important Terms:**
[Define any key terminology in bold]

**Quick Reference:**
[Provide a condensed cheat-sheet style reference]

**What to Remember:**
[1-2 sentences capturing the most critical takeaway]

Lesson content:
${trimmed}

Keep it under 300 words. Use markdown formatting.`;

  return generateMentorResponse(instructions);
};

// ── AI Mentor: Flashcards ───────────────────────────────────────────────────
export const generateFlashcards = async (topic: string): Promise<string> => {
  const instructions = `You are a study tool creator inside DoFlow Academy. Generate exactly 6 flashcards for the given topic. Each flashcard should have a clear front (question/term) and back (answer/definition).

Format your response EXACTLY like this (use --- as separator):

**Card 1**
Front: [question or term]
Back: [answer or definition]

---

**Card 2**
Front: [question or term]
Back: [answer or definition]

---

[Continue for all 6 cards...]

Topic: ${topic}

Make the questions progressively harder. Include a mix of definition, conceptual, and applied questions.`;

  return generateMentorResponse(instructions);
};

// ── AI Mentor: Quiz Generator ───────────────────────────────────────────────
export const generateQuiz = async (topic: string): Promise<string> => {
  const instructions = `You are a quiz generator inside DoFlow Academy. Generate a 5-question multiple-choice quiz for the given topic. Make questions test real understanding, not just memorization.

Format your response EXACTLY like this:

**Question 1**
[Question text]
A) [Option]
B) [Option]
C) [Option]
D) [Option]
**Correct:** [A/B/C/D]
**Explanation:** [One sentence explaining why]

---

[Repeat for all 5 questions...]

Topic: ${topic}

Make questions challenging but fair. Include brief explanations for learning value.`;

  return generateMentorResponse(instructions);
};
