import mongoose from 'mongoose';
import Course from '../models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

const THUMBNAILS = {
  c: '/Thumbanils/C Programming.png',
  python: '/Thumbanils/Python_Thumbnail.png',
};

async function updateThumbnails() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const courses = await Course.find({}).select('_id title slug thumbnail');
    console.log(`Found ${courses.length} courses:`);
    courses.forEach(c => console.log(`  - ${c.title} (${c._id})`));

    for (const course of courses) {
      const title = (course.title || '').toLowerCase();
      const slug = (course.slug || '').toLowerCase();
      let thumbnail = null;

      if (title.includes('python') || slug.includes('python')) {
        thumbnail = THUMBNAILS.python;
      } else if (title.includes('c ') || title.startsWith('c programming') || slug.includes('c-program') || slug.includes('c-learn')) {
        thumbnail = THUMBNAILS.c;
      }

      if (thumbnail) {
        await Course.findByIdAndUpdate(course._id, { thumbnail });
        console.log(`Updated "${course.title}" → ${thumbnail}`);
      }
    }

    console.log('Done!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateThumbnails();
