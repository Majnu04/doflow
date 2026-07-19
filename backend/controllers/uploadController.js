import { S3, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

let s3 = null;
let bucketName = null;

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3 = new S3({
    endpoint: process.env.DO_SPACES_ENDPOINT || 's3.amazonaws.com',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_REGION || 'us-east-1',
    forcePathStyle: !!process.env.DO_SPACES_ENDPOINT,
  });
  bucketName = process.env.DO_SPACES_BUCKET || process.env.S3_BUCKET_NAME;
}

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
    fileSize: 500 * 1024 * 1024
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

export const getSignedUrlHandler = async (req, res) => {
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
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    res.json({ url: signedUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      Key: key,
    });

    await s3.send(command);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
