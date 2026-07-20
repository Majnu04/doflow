import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';
import dotenv from 'dotenv';

dotenv.config();

async function createDSACourse() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find the DSA roadmap
    const roadmap = await Roadmap.findOne({ title: /DSA/i }).sort({ createdAt: -1 });
    
    if (!roadmap) {
      console.log('❌ No DSA roadmap found. Please run seedDSARoadmap.js first.');
      process.exit(1);
    }

    console.log(`✅ Found DSA Roadmap: ${roadmap._id}`);

    // Find an admin user to be the instructor
    const adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin first.');
      process.exit(1);
    }

    console.log(`✅ Found Admin User: ${adminUser.name} (${adminUser._id})`);

    // Check if DSA course already exists
    const existingCourse = await Course.findOne({ 
      $or: [
        { title: /Data Structures.*Algorithms/i },
        { category: 'Other' },
        { tags: 'DSA' }
      ]
    });

    if (existingCourse) {
      console.log(`⚠️  DSA Course already exists: ${existingCourse._id}`);
      console.log(`   Title: ${existingCourse.title}`);
      console.log(`\n📋 Use this Course ID in your frontend:`);
      console.log(`   const courseId = '${existingCourse._id}';`);
      process.exit(0);
    }

    // Create a new DSA Course
    const dsaCourse = await Course.create({
      title: 'Data Structures & Algorithms Mastery',
      description: 'Master Data Structures and Algorithms with 180+ carefully curated problems organized by difficulty. Progress from basic array operations to advanced graph algorithms and dynamic programming. Each problem includes test cases, constraints, and a code editor with multiple language support.',
      shortDescription: 'Master DSA with 180+ problems from basic to advanced. Perfect for interview preparation and competitive programming.',
      instructor: adminUser._id,
      category: 'Other',
      level: 'Beginner',
      price: 0, // Free
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
      language: 'English',
      whatYouWillLearn: [
        'Master fundamental data structures: Arrays, Strings, Linked Lists',
        'Understand advanced structures: Trees, Graphs, Heaps',
        'Learn essential algorithms: Sorting, Searching, Dynamic Programming',
        'Solve 180+ problems from easy to advanced difficulty',
        'Prepare for technical interviews at top companies',
        'Write efficient and optimized code'
      ],
      requirements: [
        'Basic programming knowledge in any language',
        'Understanding of variables, loops, and functions',
        'Willingness to practice regularly'
      ],
      sections: [
        {
          title: 'Basic Problems',
          order: 1,
          lessons: [
            { 
              title: '45+ Easy Problems', 
              description: 'Foundational problems covering arrays, strings, and basic algorithms',
              videoUrl: 'https://example.com/intro',
              duration: 900, // 15 hours in minutes
              order: 1,
              isPreview: true
            }
          ]
        },
        {
          title: 'Intermediate Problems',
          order: 2,
          lessons: [
            { 
              title: '60+ Medium Problems', 
              description: 'Intermediate challenges with linked lists, trees, and recursion',
              videoUrl: 'https://example.com/intermediate',
              duration: 1500, // 25 hours in minutes
              order: 1,
              isPreview: false
            }
          ]
        },
        {
          title: 'Advanced Problems',
          order: 3,
          lessons: [
            { 
              title: '50+ Hard Problems', 
              description: 'Advanced problems with graphs, dynamic programming, and optimization',
              videoUrl: 'https://example.com/advanced',
              duration: 1200, // 20 hours in minutes
              order: 1,
              isPreview: false
            }
          ]
        },
        {
          title: 'Miscellaneous',
          order: 4,
          lessons: [
            { 
              title: '25+ Mixed Problems', 
              description: 'Various problem types for comprehensive practice',
              videoUrl: 'https://example.com/misc',
              duration: 600, // 10 hours in minutes
              order: 1,
              isPreview: false
            }
          ]
        }
      ],
      tags: ['DSA', 'Algorithms', 'Data Structures', 'Interview Prep', 'Coding'],
      isPublished: true,
      isFeatured: true,
      enrollmentCount: 0,
      ratings: {
        average: 4.8,
        count: 0
      }
    });

    console.log(`\n✅ DSA Course created successfully!`);
    console.log(`   Course ID: ${dsaCourse._id}`);
    console.log(`   Title: ${dsaCourse.title}`);
    console.log(`   Category: ${dsaCourse.category}`);
    console.log(`\n📋 Update your frontend DSA pages with this Course ID:`);
    console.log(`   const courseId = '${dsaCourse._id}';`);
    console.log(`\n📋 Roadmap ID (for reference): ${roadmap._id}`);
    console.log(`\n🎯 Access URLs:`);
    console.log(`   - Course Details: http://localhost:5174/#/course/${dsaCourse._id}`);
    console.log(`   - DSA Problems: http://localhost:5174/#/dsa/problems/${dsaCourse._id}`);

  } catch (error) {
    console.error('❌ Error creating DSA course:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

createDSACourse();
