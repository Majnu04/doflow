import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import Course from '../models/Course.js';
import User from '../models/User.js';

dotenv.config();

const PDF_FILENAME = 'C language written notes by jenny.pdf';
const COURSE_TITLE = 'C Programming';

function publicPdfUrlForPage(pageNumber) {
  // Vite serves files in doflow-main/public at /<filename>
  const encoded = encodeURI(PDF_FILENAME);
  return `/${encoded}#page=${pageNumber}`;
}

async function createCourseFromPdf() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('❌ Missing MONGODB_URI in environment.');
      console.log('   Add it to backend/.env then re-run.');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find an admin user to be the instructor
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found. Please run scripts/createAdmin.js first.');
      process.exit(1);
    }

    // Check if course already exists
    const existing = await Course.findOne({ title: new RegExp(`^${COURSE_TITLE}$`, 'i') });
    if (existing) {
      console.log(`⚠️  Course already exists: ${existing._id}`);
      console.log(`   Title: ${existing.title}`);
      console.log(`   URL: http://localhost:5174/#/course/${existing._id}`);
      process.exit(0);
    }

    // Resolve PDF on disk (stored in doflow-main/public)
    const pdfPath = path.resolve(process.cwd(), '..', 'public', PDF_FILENAME);
    if (!fs.existsSync(pdfPath)) {
      console.log('❌ PDF not found at:', pdfPath);
      console.log('   Make sure the file exists in doflow-main/public');
      process.exit(1);
    }

    const pdfUrl = `/${encodeURI(PDF_FILENAME)}`;
    console.log(`✅ Found PDF: ${PDF_FILENAME}`);

    // NOTE: This course is PDF-based. We intentionally do not parse page count
    // to keep the script dependency-free (handwritten PDFs are often image-only).
    // You can later expand this into one-lesson-per-page manually in Admin.

    const sections = [
      {
        title: 'Start Here',
        order: 1,
        lessons: [
          {
            title: 'How to use these notes',
            description:
              'This course uses PDF lessons (handwritten notes). Open the PDF in the player, read slowly, and rewrite key points in your own words. After every topic, write and run a small C program.',
            videoUrl: publicPdfUrlForPage(1),
            duration: 8,
            order: 1,
            isPreview: true,
            resources: [{ title: 'Full Notes PDF', url: pdfUrl, type: 'pdf' }]
          },
          {
            title: 'C Notes (PDF)',
            description:
              'Open the full PDF and navigate page by page. If you want, later we can convert each topic page into clean text content in your tone.',
            videoUrl: pdfUrl,
            duration: 20,
            order: 2,
            isPreview: true,
            resources: [{ title: 'Full Notes PDF', url: pdfUrl, type: 'pdf' }]
          }
        ]
      }
    ];

    const course = await Course.create({
      title: COURSE_TITLE,
      description:
        'Learn C Programming from handwritten notes (PDF-based lessons). This course is designed for absolute beginners: start from fundamentals, build clarity topic-by-topic, and practice regularly.',
      shortDescription: 'C Programming basics from handwritten notes (PDF lessons).',
      instructor: adminUser._id,
      category: 'Other',
      level: 'Beginner',
      price: 0,
      thumbnail: '/images/course-placeholder.svg',
      promoVideo: '',
      sections,
      requirements: [
        'No prior programming experience required',
        'Basic computer usage',
        'Consistency (daily practice)'
      ],
      whatYouWillLearn: [
        'Understand C fundamentals and core concepts',
        'Write basic C programs confidently',
        'Build strong programming logic for future DSA'
      ],
      tags: ['C', 'C Programming', 'Programming', 'Beginner'],
      language: 'English',
      isPublished: true,
      isFeatured: false
    });

    console.log('\n✅ C Programming course created successfully!');
    console.log(`   Course ID: ${course._id}`);
    console.log(`   Title: ${course.title}`);
    console.log(`   URL: http://localhost:5174/#/course/${course._id}`);
  } catch (error) {
    console.error('❌ Error creating C course:', error?.message || error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  }
}

createCourseFromPdf();
