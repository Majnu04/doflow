import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'gourishanker0408@gmail.com' });

    if (existingUser) {
      console.log('User already exists! Updating password...');
      
      // Update password
      existingUser.password = '123456789'; // Will be hashed by pre-save hook
      await existingUser.save();
      
      console.log('Password updated successfully!');
      console.log('Email:', existingUser.email);
      console.log('Name:', existingUser.name);
      console.log('Password: 123456789 (use this to login)');
      console.log('Role:', existingUser.role);
      process.exit(0);
    }

    // Create test user
    const user = await User.create({
      name: 'Gouri Shankar',
      email: 'gourishanker0408@gmail.com',
      password: '123456789', // This will be hashed by the User model
      role: 'student'
    });

    console.log('Test user created successfully!');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Password: 123456789 (use this to login)');
    console.log('Role:', user.role);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createTestUser();
