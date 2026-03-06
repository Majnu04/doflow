// Delete user by email from MongoDB
// Usage: node deleteUser.js email@example.com

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const deleteUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node deleteUser.js email@example.com');
      process.exit(1);
    }

    const user = await User.findOneAndDelete({ email });

    if (user) {
      console.log(`✅ User deleted successfully:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   ID: ${user._id}`);
    } else {
      console.log(`❌ No user found with email: ${email}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const email = process.argv[2];
deleteUser(email);
