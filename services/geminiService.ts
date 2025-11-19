
import { GoogleGenAI, Type } from "@google/genai";

// Assume API_KEY is set in the environment.
// In a real app, this would be handled securely on a backend server.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Course Outline Generator will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateCourseOutline = async (topic: string): Promise<any> => {
  if (!API_KEY) {
    throw new Error("API key is not configured.");
  }

  try {
    const response = await ai.models.generateContent({
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
