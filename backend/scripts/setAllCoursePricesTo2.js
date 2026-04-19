import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const TARGET_PRICE = 2;

async function setAllCoursePricesTo2() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;

  if (!uri) {
    console.error('Missing MongoDB connection string. Set MONGODB_URI in backend/.env.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const result = await Course.updateMany(
      {},
      {
        $set: {
          price: TARGET_PRICE,
          discountPrice: TARGET_PRICE,
        },
      }
    );

    console.log(`Updated ${result.modifiedCount} course(s) to price INR ${TARGET_PRICE}.`);
  } catch (error) {
    console.error('Failed to update course prices:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

setAllCoursePricesTo2();