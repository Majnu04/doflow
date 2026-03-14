import mongoose from 'mongoose';
import dotenv from 'dotenv';
import RoadmapSection from '../models/RoadmapSection.js';
import Course from '../models/Course.js';

dotenv.config();

const checkDSACourse = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is undefined');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const courseId = '69221b7d34a1c735a4c255ba';
    
    // Check course exists
    const course = await Course.findById(courseId).select('title isDSA');
    if (!course) {
      console.log('❌ Course not found!');
      process.exit(1);
    }

    console.log(`\n📚 Course: ${course.title}`);
    console.log(`   isDSA: ${course.isDSA}\n`);

    // Check sections
    const sections = await RoadmapSection.find({ course: courseId }).sort('order');
    console.log(`📋 Sections: ${sections.length}`);
    sections.forEach(s => {
      console.log(`   - ${s.title} (ID: ${s._id})`);
    });

    if (sections.length === 0) {
      console.log('\n⚠️  No sections found! Creating default sections...\n');
      
      const defaultSections = [
        { title: 'Array', order: 1, description: 'Array manipulation and classic problems' },
        { title: 'String', order: 2, description: 'String operations and pattern matching' },
        { title: 'LinkedList', order: 3, description: 'Linked list data structures' },
        { title: 'Tree', order: 4, description: 'Binary trees and tree traversal' },
        { title: 'Graph', order: 5, description: 'Graph algorithms and traversal' },
      ];

      for (const sectionData of defaultSections) {
        const section = await RoadmapSection.create({
          ...sectionData,
          course: courseId
        });
        console.log(`✨ Created: ${section.title}`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
  }
};

checkDSACourse();
