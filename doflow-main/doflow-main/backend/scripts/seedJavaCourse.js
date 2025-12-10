import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Course from '../models/Course.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGODB_URI not found in .env file');
  process.exit(1);
}

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Convert sections to proper course format with order numbers
const formatSections = (sections) => {
  return sections.map((section, index) => ({
    title: section.title,
    order: index + 1,
    lessons: section.lessons.map((lesson, lessonIndex) => {
      // Create the content object that will be stored in resources[0].url
      const lessonContentObj = {
        type: lesson.type,
        content: lesson.content
      };
      
      return {
        title: lesson.title,
        description: lesson.type === 'concept' ? lesson.content.explanation : 
                     lesson.type === 'mcq' ? lesson.content.question :
                     lesson.type === 'coding' ? lesson.content.description :
                     lesson.type === 'test' ? `Test your knowledge from ${section.title}` : '',
        videoUrl: 'https://www.youtube.com/watch?v=eIrMbAQSU34', // Placeholder
        duration: parseInt(lesson.duration) || 15,
        order: lessonIndex + 1,
        resources: [{
          title: 'Lesson Content',
          url: JSON.stringify(lessonContentObj),
          type: 'other'
        }],
        isPreview: lessonIndex === 0
      };
    })
  }));
};

// Merge JSON files
const mergeJavaCourseFiles = () => {
  try {
    const coursesDir = path.join(__dirname, '../../courses');
    
    // Read all three Java course files
    const part1Path = path.join(coursesDir, 'java-foundations-complete.json');
    const part2Path = path.join(coursesDir, 'java-foundations-part2.json');
    const part3Path = path.join(coursesDir, 'java-foundations-part3.json');
    
    console.log('📂 Reading Java course files...');
    
    const part1 = JSON.parse(fs.readFileSync(part1Path, 'utf8'));
    const part2 = JSON.parse(fs.readFileSync(part2Path, 'utf8'));
    const part3 = JSON.parse(fs.readFileSync(part3Path, 'utf8'));
    
    console.log(`   Part 1: ${part1.sections?.length || 0} modules`);
    console.log(`   Part 2: ${part2.sections?.length || 0} modules`);
    console.log(`   Part 3: ${part3.sections?.length || 0} modules`);
    
    // Merge all sections
    const allSections = [];
    if (part1.sections) allSections.push(...part1.sections);
    if (part2.sections) allSections.push(...part2.sections);
    if (part3.sections) allSections.push(...part3.sections);
    
    console.log(`\n✅ Merged ${allSections.length} modules total`);
    
    // Calculate total lessons
    let totalLessons = 0;
    let conceptLessons = 0;
    let mcqLessons = 0;
    let codingTasks = 0;
    let moduleTests = 0;
    
    allSections.forEach(section => {
      section.lessons.forEach(lesson => {
        totalLessons++;
        if (lesson.type === 'concept') conceptLessons++;
        else if (lesson.type === 'mcq') mcqLessons++;
        else if (lesson.type === 'coding') codingTasks++;
        else if (lesson.type === 'test') moduleTests++;
      });
    });
    
    console.log('\n📊 Course Statistics:');
    console.log(`   Total Modules: ${allSections.length}`);
    console.log(`   Total Lessons: ${totalLessons}`);
    console.log(`   - Concept Lessons: ${conceptLessons}`);
    console.log(`   - MCQ Lessons: ${mcqLessons}`);
    console.log(`   - Coding Tasks: ${codingTasks}`);
    console.log(`   - Module Tests: ${moduleTests}`);
    
    // Create complete course object matching the Course model
    return {
      title: "Java Foundations & Problem Solving – DoFlow Edition",
      slug: "java-foundations-complete",
      description: `Master Java programming from absolute basics to algorithmic problem-solving! This comprehensive course is designed following proven curriculum practices.

🎯 Each module includes:
• Concept Explanations (Clear, 80-120 word explanations)
• Real-World Analogies (Relatable examples)
• Syntax Examples (Clean, commented Java code)
• Interactive MCQs (Test your understanding)
• Coding Tasks (Hands-on practice with test cases)
• Module Tests (Assess your learning)

Perfect for absolute beginners with zero Java experience. By the end, you'll confidently write Java programs, understand OOP, and solve algorithmic problems!`,
      shortDescription: "Master Java from scratch with OOP concepts, data structures, and algorithmic problem-solving through 100+ interactive exercises.",
      category: "Web Development",  // Using valid enum value
      level: "Beginner",
      price: 0,
      discountPrice: 0,
      thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60",
      language: "English",
      requirements: [
        "No prior programming experience needed",
        "A computer with Java JDK installed",
        "Basic computer literacy",
        "Enthusiasm to learn coding!"
      ],
      whatYouWillLearn: [
        "Write and run Java programs from scratch",
        "Master Java syntax, variables, and data types",
        "Build decision-making logic with conditionals",
        "Debug Java code effectively",
        "Create loops and work with arrays",
        "Write reusable code with methods",
        "Understand Object-Oriented Programming",
        "Handle exceptions gracefully",
        "Use collections like ArrayList",
        "Solve algorithmic problems systematically"
      ],
      tags: ["Java", "Programming", "OOP", "Collections", "Algorithms", "Problem Solving", "Beginner"],
      isPublished: true,
      isFeatured: true,
      sections: formatSections(allSections)
    };
    
  } catch (error) {
    console.error('❌ Error merging course files:', error);
    throw error;
  }
};

// Seed course to database
const seedJavaCourse = async () => {
  try {
    console.log('\n🚀 Starting Java course seeding process...\n');
    
    // Connect to database
    await connectDB();
    
    // Find an admin user to be the instructor
    let instructor = await User.findOne({ role: 'admin' });
    
    if (!instructor) {
      instructor = await User.findOne({ role: 'instructor' });
    }
    
    if (!instructor) {
      instructor = await User.findOne();
    }

    if (!instructor) {
      console.error('❌ No users found. Please create a user first.');
      process.exit(1);
    }

    console.log(`📝 Using instructor: ${instructor.name || instructor.email}`);
    
    // Merge course files
    const javaCourse = mergeJavaCourseFiles();
    
    // Check if course already exists
    const existingCourse = await Course.findOne({ title: javaCourse.title });
    
    if (existingCourse) {
      console.log('\n⚠️  Java course already exists in database');
      console.log('   Deleting existing course...');
      await Course.deleteOne({ _id: existingCourse._id });
      console.log('   ✅ Existing course deleted');
    }
    
    // Insert new course
    console.log('\n📥 Inserting Java course into database...');
    const newCourse = new Course({
      ...javaCourse,
      instructor: instructor._id
    });
    await newCourse.save();
    
    console.log('\n✅ Java course seeded successfully!');
    console.log(`   Course ID: ${newCourse._id}`);
    console.log(`   Title: ${newCourse.title}`);
    console.log(`   Modules: ${newCourse.sections.length}`);
    
    // Verify the data
    const verifyModules = await Course.findById(newCourse._id);
    console.log('\n✅ Verification successful:');
    console.log(`   Stored modules: ${verifyModules.sections.length}`);
    
    // Display module names
    console.log('\n📚 Course Modules:');
    verifyModules.sections.forEach((section, index) => {
      console.log(`   ${index + 1}. ${section.title} (${section.lessons.length} lessons)`);
    });
    
  } catch (error) {
    console.error('\n❌ Error seeding Java course:', error);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run the seeding process
seedJavaCourse();
