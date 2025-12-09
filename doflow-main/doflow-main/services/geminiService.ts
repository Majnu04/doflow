
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
