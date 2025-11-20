import mongoose from 'mongoose';
import Course from '../models/Course.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedDSACourse = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Get an admin user to be the instructor
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    console.log('Using instructor:', adminUser.name, `(${adminUser.email})`);

    // Check if DSA course already exists
    const existingCourse = await Course.findOne({ 
      slug: 'data-structures-algorithms-mastery'
    });

    if (existingCourse) {
      console.log('DSA Course already exists:', existingCourse.title);
      console.log('Course ID:', existingCourse._id);
      console.log('\n⚠️  Update your DSACourseLandingPage.tsx with this course ID:');
      console.log(`courseId: '${existingCourse._id}'`);
      process.exit(0);
    }

    // Create DSA Course
    const dsaCourse = await Course.create({
      title: 'Data Structures & Algorithms Mastery',
      slug: 'data-structures-algorithms-mastery',
      description: 'Master Data Structures and Algorithms with our comprehensive roadmap. Learn from basics to advanced concepts with 150+ coding problems.',
      shortDescription: 'Master DSA with 150+ coding problems from basics to advanced level. Perfect for interview prep!',
      longDescription: `
        <h2>What You'll Learn</h2>
        <ul>
          <li>Master fundamental data structures (Arrays, Linked Lists, Stacks, Queues, Trees, Graphs)</li>
          <li>Learn essential algorithms (Sorting, Searching, Dynamic Programming, Greedy, Backtracking)</li>
          <li>Solve 150+ coding problems from easy to hard difficulty</li>
          <li>Prepare for technical interviews at top tech companies</li>
          <li>Build problem-solving and algorithmic thinking skills</li>
        </ul>
        
        <h2>Course Structure</h2>
        <p>This course is divided into three difficulty levels:</p>
        <ul>
          <li><strong>Basic (50 problems)</strong> - Build your foundation with fundamental concepts</li>
          <li><strong>Medium (60 problems)</strong> - Enhance your skills with intermediate challenges</li>
          <li><strong>Advanced (40 problems)</strong> - Master complex algorithms and data structures</li>
        </ul>
        
        <h2>Who Is This For?</h2>
        <ul>
          <li>Students preparing for coding interviews</li>
          <li>Developers looking to strengthen their DSA fundamentals</li>
          <li>Anyone preparing for competitive programming</li>
          <li>Computer Science students and graduates</li>
        </ul>
      `,
      instructor: adminUser._id,
      price: 0,
      discountPrice: 0,
      category: 'Web Development',
      level: 'Beginner',
      language: 'English',
      thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
      previewVideo: '',
      totalDuration: 18000, // 300 hours estimated
      totalLectures: 150,
      enrollmentCount: 0,
      rating: 4.8,
      reviewCount: 0,
      whatYouWillLearn: [
        'Master fundamental data structures',
        'Learn essential algorithms',
        'Solve 150+ coding problems',
        'Ace technical interviews',
        'Build algorithmic thinking skills',
        'Prepare for competitive programming'
      ],
      requirements: [
        'Basic programming knowledge in any language',
        'Understanding of basic mathematics',
        'Problem-solving mindset',
        'Computer with internet connection'
      ],
      sections: [
        {
          title: 'Basic DSA - Foundations',
          order: 1,
          lessons: [
            {
              title: 'Introduction to DSA',
              description: 'Get started with Data Structures and Algorithms basics',
              videoUrl: 'https://example.com/intro-dsa.mp4',
              duration: 30,
              order: 1,
              isPreview: true
            },
            {
              title: 'Arrays & String Problems',
              description: 'Learn array manipulation and string problems',
              videoUrl: 'https://example.com/arrays-strings.mp4',
              duration: 120,
              order: 2
            },
            {
              title: 'Linked List Problems',
              description: 'Master linked list operations',
              videoUrl: 'https://example.com/linked-lists.mp4',
              duration: 120,
              order: 3
            },
            {
              title: 'Stack & Queue Problems',
              description: 'Understand stack and queue data structures',
              videoUrl: 'https://example.com/stacks-queues.mp4',
              duration: 120,
              order: 4
            },
            {
              title: 'Basic Tree Problems',
              description: 'Introduction to tree data structures',
              videoUrl: 'https://example.com/basic-trees.mp4',
              duration: 120,
              order: 5
            }
          ]
        },
        {
          title: 'Medium DSA - Building Skills',
          order: 2,
          lessons: [
            {
              title: 'Advanced Array Problems',
              description: 'Tackle complex array problems',
              videoUrl: 'https://example.com/advanced-arrays.mp4',
              duration: 150,
              order: 1
            },
            {
              title: 'Binary Search & Variations',
              description: 'Master binary search techniques',
              videoUrl: 'https://example.com/binary-search.mp4',
              duration: 150,
              order: 2
            },
            {
              title: 'Two Pointers & Sliding Window',
              description: 'Learn efficient array traversal techniques',
              videoUrl: 'https://example.com/two-pointers.mp4',
              duration: 150,
              order: 3
            },
            {
              title: 'Recursion & Backtracking',
              description: 'Master recursive problem solving',
              videoUrl: 'https://example.com/recursion.mp4',
              duration: 150,
              order: 4
            },
            {
              title: 'Dynamic Programming Basics',
              description: 'Introduction to DP concepts',
              videoUrl: 'https://example.com/dp-basics.mp4',
              duration: 150,
              order: 5
            }
          ]
        },
        {
          title: 'Advanced DSA - Mastery',
          order: 3,
          lessons: [
            {
              title: 'Graph Algorithms',
              description: 'Master graph traversal and algorithms',
              videoUrl: 'https://example.com/graphs.mp4',
              duration: 180,
              order: 1
            },
            {
              title: 'Advanced Dynamic Programming',
              description: 'Complex DP patterns and optimization',
              videoUrl: 'https://example.com/advanced-dp.mp4',
              duration: 180,
              order: 2
            },
            {
              title: 'Advanced Trees & Tries',
              description: 'Binary trees, BST, and trie structures',
              videoUrl: 'https://example.com/advanced-trees.mp4',
              duration: 180,
              order: 3
            },
            {
              title: 'Greedy Algorithms',
              description: 'Learn greedy problem solving approaches',
              videoUrl: 'https://example.com/greedy.mp4',
              duration: 180,
              order: 4
            },
            {
              title: 'Advanced Problem Solving',
              description: 'Put everything together with complex problems',
              videoUrl: 'https://example.com/advanced-problems.mp4',
              duration: 180,
              order: 5
            }
          ]
        }
      ],
      tags: ['dsa', 'algorithms', 'data-structures', 'coding-interview', 'problem-solving', 'leetcode', 'competitive-programming'],
      isPublished: true,
      isFeatured: true
    });

    console.log('✅ DSA Course created successfully!');
    console.log('Course ID:', dsaCourse._id);
    console.log('Title:', dsaCourse.title);
    console.log('Price:', dsaCourse.price === 0 ? 'FREE' : `₹${dsaCourse.price}`);
    console.log('\nYou can now enroll in this course!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DSA course:', error);
    process.exit(1);
  }
};

seedDSACourse();
