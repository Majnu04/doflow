import Certificate from '../models/Certificate.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

// Generate Certificate
export const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course is completed
    const progress = await Progress.findOne({ user: userId, course: courseId });
    if (!progress || progress.progress < 100) {
      return res.status(400).json({ message: 'Course not completed yet' });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({ userId, courseId });
    if (existingCertificate) {
      return res.status(200).json({
        message: 'Certificate already exists',
        certificate: existingCertificate,
      });
    }

    // Generate unique certificate ID
    const certificateId = `DOFLOW-${uuidv4().split('-')[0].toUpperCase()}`;

    // Create verification URL
    const verificationUrl = `${process.env.FRONTEND_URL}/#/certificate/verify/${certificateId}`;

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);

    // Create certificate
    const certificate = await Certificate.create({
      userId,
      courseId,
      certificateId,
      studentName: req.user.name,
      courseName: course.title,
      completionDate: progress.lastAccessedAt || new Date(),
      verificationUrl,
    });

    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate,
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Error generating certificate', error: error.message });
  }
};

// Get User's Certificates
export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user._id;

    const certificates = await Certificate.find({ userId })
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 });

    res.status(200).json({ certificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Error fetching certificates', error: error.message });
  }
};

// Get Certificate by ID
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id)
      .populate('userId', 'name email')
      .populate('courseId', 'title');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(certificate.verificationUrl);

    res.status(200).json({ certificate, qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ message: 'Error fetching certificate', error: error.message });
  }
};

// Verify Certificate
export const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = await Certificate.findOne({ certificateId })
      .populate('userId', 'name email')
      .populate('courseId', 'title instructor');

    if (!certificate) {
      return res.status(404).json({
        valid: false,
        message: 'Certificate not found or invalid',
      });
    }

    res.status(200).json({
      valid: true,
      message: 'Certificate is valid',
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.studentName,
        courseName: certificate.courseName,
        completionDate: certificate.completionDate,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Error verifying certificate', error: error.message });
  }
};

// Get Certificate by Course
export const getCertificateByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const certificate = await Certificate.findOne({ userId, courseId })
      .populate('courseId', 'title');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found for this course' });
    }

    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(certificate.verificationUrl);

    res.status(200).json({ certificate, qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('Get certificate by course error:', error);
    res.status(500).json({ message: 'Error fetching certificate', error: error.message });
  }
};
