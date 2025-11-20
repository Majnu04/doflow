import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanOldEnrollments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Delete enrollments for the old course ID
    const result = await mongoose.connection.db.collection('enrollments').deleteMany({
      course: new mongoose.Types.ObjectId('691ecaf353d32cf6caf55cb7')
    });

    console.log(`✅ Deleted ${result.deletedCount} old enrollment(s)`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

cleanOldEnrollments();
