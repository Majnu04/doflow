import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

async function fixOldCourse() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const old = await db.collection('courses').findOne({ _id: new mongoose.Types.ObjectId('699085156308042bf66db03f') });
  if (!old) { console.log('Old course not found'); await mongoose.disconnect(); return; }

  console.log(`Title: ${old.title}`);
  console.log(`Sections: ${old.sections?.length}`);

  if (old.sections?.length === 1 && old.sections[0].title === 'Python Programming - Complete Course') {
    // This is the flat unstructured course. Delete it since the structured one exists.
    await db.collection('courses').deleteOne({ _id: old._id });
    console.log('Deleted old unstructured Python course');
  }

  await mongoose.disconnect();
}

fixOldCourse().catch(console.error);
