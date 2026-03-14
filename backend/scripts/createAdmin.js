import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');

    // Admin credentials
    const adminData = {
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@elitedigital.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', adminData.email);
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create(adminData);
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminData.email);
    console.log('Password: [HIDDEN - Check .env ADMIN_PASSWORD or use default]');
    console.log('Role:', admin.role);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();
