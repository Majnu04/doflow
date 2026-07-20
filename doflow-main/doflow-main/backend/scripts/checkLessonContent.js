import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elite-academy';

async function checkContent() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const course = await db.collection('courses').findOne({ title: /Python.*ULTRA/i });
    
    if (!course) {
      console.log('❌ ULTRA EDITION course not found!');
      return;
    }
    
    console.log('\n✅ Course found:', course.title);
    console.log('Sections:', course.sections?.length);
    
    // Check first coding task
    for (const section of course.sections || []) {
      for (const lesson of section.lessons || []) {
        if (lesson.title?.toLowerCase().includes('coding task')) {
          console.log('\n📝 Coding Task Found:', lesson.title);
          console.log('Description:', lesson.description?.substring(0, 100) + '...');
          console.log('Resources:', JSON.stringify(lesson.resources, null, 2)?.substring(0, 500));
          
          if (lesson.resources?.[0]?.url) {
            try {
              const content = JSON.parse(lesson.resources[0].url);
              console.log('\n✅ Content parsed successfully!');
              console.log('Type:', content.type);
              console.log('Content keys:', Object.keys(content.content || {}));
            } catch (e) {
              console.log('❌ Failed to parse content:', e.message);
            }
          } else {
            console.log('❌ No resources found!');
          }
          break;
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

checkContent();
