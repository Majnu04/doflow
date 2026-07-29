import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/elite-academy';

async function removeModulePrefix() {
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
    
    // Update each module title to remove "Module X: " prefix
    let updated = 0;
    for (let i = 0; i < course.sections.length; i++) {
      const section = course.sections[i];
      const modulePattern = new RegExp(`^Module\\s+${i + 1}:\\s*`, 'i');
      
      if (modulePattern.test(section.title)) {
        const newTitle = section.title.replace(modulePattern, '');
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
    
    console.log(`\n✅ Updated ${updated} module titles in database`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

removeModulePrefix();
