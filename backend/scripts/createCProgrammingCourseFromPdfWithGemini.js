import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Course from '../models/Course.js';
import User from '../models/User.js';

dotenv.config();

const PDF_FILENAME = 'C language written notes by jenny.pdf';
const DEFAULT_COURSE_TITLE = 'C Programming';

const resolveGeminiKey = () => process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

function safeJsonParse(text) {
  const trimmed = String(text || '').trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try to salvage JSON from a fenced block.
    const match = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
    if (match?.[1]) return JSON.parse(match[1]);
    throw new Error('Failed to parse JSON from Gemini response.');
  }
}

function pdfPublicUrl() {
  return `/${encodeURI(PDF_FILENAME)}`;
}

function pageAnchor(page) {
  // Many PDF viewers support #page=.
  return `${pdfPublicUrl()}#page=${page}`;
}

async function generateCoursePlanFromPdf({ pdfBytes, apiKey }) {
  // Import lazily so this script still runs without the dependency until key is configured.
  const { GoogleGenAI, Type } = await import('@google/genai');
  const client = new GoogleGenAI({ apiKey });

  const toneRules = `Write in my handwritten-notes tone:
- Use: u, lang, mach, i.e., ex:
- Use headings + bullet points + short lines
- Keep it beginner-friendly but deeper and clear
- No external links
- Add small C code examples with expected output
- If you need "pictures", use simple ASCII diagrams (boxes/arrows) inside text
`;

  const instructions = `You are creating a brand new course from a provided PDF.
Your job:
1) Read the PDF.
2) Create a clean course structure (sections and lessons).
3) For each lesson, produce enhanced notes (my tone) with clarity + depth.

Output STRICT JSON with this schema:
{
  "courseTitle": string,
  "courseDescription": string,
  "shortDescription": string,
  "level": "Beginner"|"Intermediate"|"Advanced",
  "requirements": string[],
  "whatYouWillLearn": string[],
  "tags": string[],
  "sections": [
    {
      "title": string,
      "lessons": [
        {
          "title": string,
          "content": string,
          "page": number | null
        }
      ]
    }
  ]
}

Constraints:
- Make 6 to 12 sections.
- Each lesson content should be 250 to 700 words max.
- Use only PDF content; do not invent unrelated topics.
- No links.

${toneRules}`;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: instructions },
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: Buffer.from(pdfBytes).toString('base64'),
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          courseTitle: { type: Type.STRING },
          courseDescription: { type: Type.STRING },
          shortDescription: { type: Type.STRING },
          level: { type: Type.STRING },
          requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
          whatYouWillLearn: { type: Type.ARRAY, items: { type: Type.STRING } },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                lessons: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      content: { type: Type.STRING },
                      page: { type: Type.NUMBER },
                    },
                    required: ['title', 'content'],
                  },
                },
              },
              required: ['title', 'lessons'],
            },
          },
        },
        required: ['courseTitle', 'courseDescription', 'shortDescription', 'level', 'requirements', 'whatYouWillLearn', 'tags', 'sections'],
      },
    },
  });

  return safeJsonParse(response.text);
}

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('❌ Missing MONGODB_URI in environment.');
      console.log('   Add it to doflow-main/backend/.env then re-run.');
      process.exit(1);
    }

    const apiKey = resolveGeminiKey();
    if (!apiKey) {
      console.log('❌ Missing GEMINI_API_KEY (or VITE_GEMINI_API_KEY).');
      console.log('   This script needs Gemini to convert the PDF into text lessons.');
      console.log('   Add GEMINI_API_KEY to doflow-main/backend/.env then re-run.');
      process.exit(1);
    }

    const pdfPath = path.resolve(process.cwd(), '..', 'public', PDF_FILENAME);
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ PDF not found at:', pdfPath);
      process.exit(1);
    }

    const pdfBytes = fs.readFileSync(pdfPath);

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Run scripts/createAdmin.js first.');
      process.exit(1);
    }

    const existing = await Course.findOne({ title: new RegExp(`^${DEFAULT_COURSE_TITLE}$`, 'i') });
    if (existing) {
      console.log(`⚠️  Course already exists: ${existing._id}`);
      console.log(`   URL: http://localhost:5174/#/course/${existing._id}`);
      process.exit(0);
    }

    console.log('🧠 Generating course content from PDF using Gemini...');
    const plan = await generateCoursePlanFromPdf({ pdfBytes, apiKey });

    const sections = (plan.sections || []).map((section, sectionIndex) => ({
      title: section.title,
      order: sectionIndex + 1,
      lessons: (section.lessons || []).map((lesson, lessonIndex) => {
        const page = typeof lesson.page === 'number' && Number.isFinite(lesson.page) ? Math.max(1, Math.floor(lesson.page)) : null;
        return {
          title: lesson.title,
          description: lesson.content,
          videoUrl: page ? pageAnchor(page) : '',
          duration: 12,
          order: lessonIndex + 1,
          isPreview: sectionIndex === 0 && lessonIndex < 2,
          resources: [{ title: 'Original Notes (PDF)', url: pdfPublicUrl(), type: 'pdf' }],
        };
      }),
    }));

    const course = await Course.create({
      title: plan.courseTitle || DEFAULT_COURSE_TITLE,
      description: plan.courseDescription,
      shortDescription: plan.shortDescription,
      instructor: adminUser._id,
      category: 'Other',
      level: plan.level,
      price: 0,
      discountPrice: 0,
      thumbnail: '/images/course-placeholder.svg',
      promoVideo: '',
      sections,
      requirements: plan.requirements,
      whatYouWillLearn: plan.whatYouWillLearn,
      tags: plan.tags,
      language: 'English',
      isPublished: true,
      isFeatured: false,
    });

    console.log('\n✅ C Programming course created successfully!');
    console.log(`   Course ID: ${course._id}`);
    console.log(`   Title: ${course.title}`);
    console.log(`   URL: http://localhost:5174/#/course/${course._id}`);
  } catch (error) {
    console.error('❌ Failed:', error?.message || error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }
}

main();
