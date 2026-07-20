import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elite-academy';

async function updateModuleTitles() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB\n');
    
    const db = mongoose.connection.db;
    
    // Find the Python course
    const course = await db.collection('courses').findOne({ 
      title: /Python Fundamentals/i 
    });
    
    if (!course) {
      console.log('❌ Course not found');
      return;
    }
    
    console.log(`✅ Found course: ${course.title}\n`);
    
    // Update each module title
    let updated = 0;
    for (let i = 0; i < course.sections.length; i++) {
      const section = course.sections[i];
      if (section.title.includes('(ULTRA EDITION)')) {
        const newTitle = section.title.replace(/\s*\(ULTRA EDITION\)/g, '');
        console.log(`Updating module ${i + 1}:`);
        console.log(`  Old: ${section.title}`);
        console.log(`  New: ${newTitle}`);
        
        await db.collection('courses').updateOne(
          { _id: course._id },
          { $set: { [`sections.${i}.title`]: newTitle } }
        );
        updated++;
      }
    }
    
    // Update completion message in last lesson
    const lastSection = course.sections[course.sections.length - 1];
    if (lastSection && lastSection.lessons) {
      const lastLesson = lastSection.lessons[lastSection.lessons.length - 1];
      if (lastLesson && lastLesson.resources && lastLesson.resources[0]) {
        try {
          const content = JSON.parse(lastLesson.resources[0].url);
          if (content.content && content.content.message && content.content.message.includes('ULTRA EDITION')) {
            content.content.message = "You've completed the Python Fundamentals: Complete Beginner Program!";
            
            const sectionIndex = course.sections.length - 1;
            const lessonIndex = lastSection.lessons.length - 1;
            
            await db.collection('courses').updateOne(
              { _id: course._id },
              { 
                $set: { 
                  [`sections.${sectionIndex}.lessons.${lessonIndex}.resources.0.url`]: JSON.stringify(content)
                } 
              }
            );
            console.log('\n✅ Updated completion message');
          }
        } catch (e) {
          // Skip if parsing fails
        }
      }
    }
    
    console.log(`\n✅ Updated ${updated} module titles in database`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

updateModuleTitles();
