import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import Enrollment from '../models/Enrollment.js';
import Certificate from '../models/Certificate.js';
import Course from '../models/Course.js';
import User from '../models/User.js';

dotenv.config();

const generateMissingCertificates = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all enrollments with 100% progress but no certificate
    const completedEnrollments = await Enrollment.find({
      progress: 100,
      'paymentInfo.status': 'completed',
      certificateIssued: { $ne: true }
    }).populate('course').populate('user');

    console.log(`Found ${completedEnrollments.length} completed enrollments without certificates`);

    for (const enrollment of completedEnrollments) {
      try {
        // Check if certificate already exists
        const existingCert = await Certificate.findOne({
          userId: enrollment.user._id,
          courseId: enrollment.course._id
        });

        if (existingCert) {
          console.log(`Certificate already exists for user ${enrollment.user.name} - ${enrollment.course.title}`);
          enrollment.certificateIssued = true;
          await enrollment.save();
          continue;
        }

        // Generate certificate
        const certificateId = `DOFLOW-${uuidv4().split('-')[0].toUpperCase()}`;
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/certificate/verify/${certificateId}`;

        await Certificate.create({
          userId: enrollment.user._id,
          courseId: enrollment.course._id,
          certificateId,
          studentName: enrollment.user.name,
          courseName: enrollment.course.title,
          completionDate: enrollment.completedAt || new Date(),
          verificationUrl,
        });

        // Update enrollment
        enrollment.certificateIssued = true;
        enrollment.certificateIssuedAt = new Date();
        await enrollment.save();

        console.log(`✅ Generated certificate for ${enrollment.user.name} - ${enrollment.course.title} (${certificateId})`);
      } catch (err) {
        console.error(`❌ Error generating certificate for enrollment ${enrollment._id}:`, err.message);
      }
    }

    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  }
};

generateMissingCertificates();
