import mongoose from 'mongoose';
import Roadmap from '../models/Roadmap.js';
import Course from '../models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

const listRoadmaps = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected\n');

    const roadmaps = await Roadmap.find({}).populate('course');
    console.log(`Total roadmaps: ${roadmaps.length}\n`);
    
    roadmaps.forEach((roadmap, index) => {
      console.log(`${index + 1}. ${roadmap.title}`);
      console.log(`   ID: ${roadmap._id}`);
      console.log(`   Course: ${roadmap.course?.title || 'None'}`);
      console.log(`   Sections: ${roadmap.sections?.length || 0}`);
      console.log(`   Published: ${roadmap.isPublished}`);
      console.log('');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

listRoadmaps();
