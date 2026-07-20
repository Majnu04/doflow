import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

// Configure AWS S3 or DigitalOcean Spaces only if credentials exist
let s3 = null;
let bucketName = null;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3 = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    region: process.env.AWS_REGION || 'us-east-1',
    forcePathStyle: false
  });
  bucketName = process.env.DO_SPACES_BUCKET || process.env.S3_BUCKET_NAME;
}

// File filter for uploads
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
  }
};

// Multer S3 upload configuration
export const upload = s3 && bucketName ? multer({
  storage: multerS3({
    s3: s3,
    bucket: bucketName,
    acl: 'private',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      const folder = file.mimetype.startsWith('video') ? 'videos' : 
                     file.mimetype.startsWith('image') ? 'images' : 'documents';
      cb(null, `${folder}/${fileName}`);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
}) : multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024
  }
});

// @desc    Upload file
// @route   POST /api/upload
// @access  Private/Admin/Instructor
export const uploadFile = async (req, res) => {
  try {
    if (!s3 || !bucketName) {
      return res.status(503).json({ message: 'File upload service not configured. Please contact administrator.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      fileUrl: req.file.location || req.file.key || req.file.path,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileType: req.file.mimetype
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get signed URL for secure video streaming
// @route   GET /api/upload/signed-url
// @access  Private
export const getSignedUrl = async (req, res) => {
  try {
    if (!s3 || !bucketName) {
      return res.status(503).json({ message: 'File service not configured. Please contact administrator.' });
    }

    const { key } = req.query;

    if (!key) {
      return res.status(400).json({ message: 'File key is required' });
    }

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    const signedUrl = await getS3SignedUrl(s3, command, { expiresIn: 3600 }); // URL expires in 1 hour

    res.json({ url: signedUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete file
// @route   DELETE /api/upload
// @access  Private/Admin
export const deleteFile = async (req, res) => {
  try {
    if (!s3 || !bucketName) {
      return res.status(503).json({ message: 'File service not configured. Please contact administrator.' });
    }

    const { key } = req.body;

    if (!key) {
      return res.status(400).json({ message: 'File key is required' });
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });

    await s3.send(command);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
