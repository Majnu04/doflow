import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

async function updateThumbnail() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await mongoose.connection.db.collection('courses').updateOne(
      { title: /Python/i },
      { $set: { thumbnail: 'https://elitedigital.sfo3.cdn.digitaloceanspaces.com/DOflow/Gemini_Generated_Image_jchnxmjchnxmjchn.png' } }
    );

    console.log('✅ Python course thumbnail updated!');
    console.log('Modified:', result.modifiedCount);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

updateThumbnail();
