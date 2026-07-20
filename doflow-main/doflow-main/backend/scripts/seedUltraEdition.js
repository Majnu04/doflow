// Script to seed the Python Zero to Hero ULTRA EDITION course into MongoDB
// This script imports the course from the JSON file
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import Course from '../models/Course.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

// Read the JSON course file
const courseJsonPath = join(__dirname, '..', '..', 'courses', 'python-zero-to-hero.json');
const courseData = JSON.parse(readFileSync(courseJsonPath, 'utf-8'));

// Transform JSON structure to MongoDB model structure
const transformCourseData = (jsonData) => {
  return {
    title: jsonData.title,
    slug: jsonData.slug,
    description: jsonData.description,
    shortDescription: "Master Python from scratch with ULTRA EDITION content! Premium lessons, MCQ pages, coding tasks, and module tests.",
    category: "Web Development", // Valid enum value
    level: jsonData.level,
    price: jsonData.price,
    discountPrice: jsonData.price,
    thumbnail: jsonData.thumbnail,
    language: jsonData.language,
    requirements: jsonData.requirements,
    whatYouWillLearn: jsonData.whatYouWillLearn,
    tags: jsonData.tags,
    isPublished: true,
    isFeatured: true,
    sections: jsonData.modules.map((module, moduleIndex) => ({
      title: module.title,
      order: moduleIndex + 1,
      lessons: module.lessons.map((lesson, lessonIndex) => ({
        title: lesson.title,
        description: getLessonDescription(lesson),
        videoUrl: "https://example.com/lesson-content", // Placeholder - content is in lesson data
        duration: estimateDuration(lesson.type),
        order: lessonIndex + 1,
        isPreview: lessonIndex === 0 && moduleIndex === 0,
        // Store custom content as JSON string in resources
        resources: [{
          title: "Lesson Content",
          url: JSON.stringify({
            type: lesson.type,
            content: lesson.content,
            hideSidebar: lesson.hideSidebar || false
          }),
          type: "other"
        }]
      }))
    }))
  };
};

// Get lesson description based on type
const getLessonDescription = (lesson) => {
  switch (lesson.type) {
    case 'concept':
      return lesson.content.explanation?.substring(0, 200) || "Learn key programming concepts";
    case 'mcq':
      return lesson.content.problemTitle || "Test your knowledge with this quiz";
    case 'codingTask':
      return lesson.content.problemStatement?.substring(0, 200) || "Practice coding with this challenge";
    case 'moduleTest':
      return lesson.content.testTitle || "Complete the module test";
    case 'challenge':
      return lesson.content.problemStatement?.substring(0, 200) || "Solve this coding challenge";
    case 'completion':
      return lesson.content.message || "Congratulations!";
    default:
      return "Learn programming concepts";
  }
};

// Estimate duration based on lesson type
const estimateDuration = (type) => {
  const durations = {
    'concept': 10,
    'mcq': 5,
    'codingTask': 15,
    'moduleTest': 10,
    'challenge': 15,
    'completion': 2
  };
  return durations[type] || 10;
};

const seedCourse = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user to set as instructor
    let instructor = await User.findOne({ role: 'admin' });
    if (!instructor) {
      instructor = await User.findOne({ role: 'instructor' });
    }
    if (!instructor) {
      instructor = await User.findOne({});
    }

    if (!instructor) {
      console.error('❌ No user found to set as instructor');
      process.exit(1);
    }

    console.log(`👨‍🏫 Using instructor: ${instructor.name} (${instructor.email})`);

    // Transform course data
    const transformedCourse = transformCourseData(courseData);
    transformedCourse.instructor = instructor._id;

    // Calculate total duration
    let totalDuration = 0;
    let totalLessons = 0;
    transformedCourse.sections.forEach(section => {
      section.lessons.forEach(lesson => {
        totalDuration += lesson.duration;
        totalLessons++;
      });
    });
    transformedCourse.duration = `${Math.ceil(totalDuration / 60)} hours`;

    console.log(`\n📊 Course Statistics:`);
    console.log(`   - Sections: ${transformedCourse.sections.length}`);
    console.log(`   - Total Lessons: ${totalLessons}`);
    console.log(`   - Estimated Duration: ${transformedCourse.duration}`);
    console.log(`   - Sections breakdown:`);
    transformedCourse.sections.forEach((s, i) => {
      console.log(`     ${i + 1}. ${s.title} - ${s.lessons.length} lessons`);
    });

    // Check if course exists
    const existingCourse = await Course.findOne({ slug: 'python-zero-to-hero' });

    if (existingCourse) {
      console.log('\n🔄 Updating existing course...');
      await Course.findByIdAndUpdate(existingCourse._id, transformedCourse, { new: true });
      console.log('✅ Course updated successfully!');
    } else {
      console.log('\n➕ Creating new course...');
      await Course.create(transformedCourse);
      console.log('✅ Course created successfully!');
    }

    console.log('\n🎉 Python Zero to Hero ULTRA EDITION is now live!');

  } catch (error) {
    console.error('❌ Error seeding course:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedCourse();
