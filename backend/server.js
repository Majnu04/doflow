import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/error.js';
import logger from './utils/logger.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import roadmapRoutes from './routes/roadmapRoutes.js';
import submissionRoutes from './routes/submissionRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import roadmapProgressRoutes from './routes/roadmapProgressRoutes.js';
import dsaRoutes from './routes/dsaRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import playgroundRoutes from './routes/playgroundRoutes.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars with explicit path
dotenv.config({ path: join(__dirname, '.env') });

logger.info('=== ENVIRONMENT CHECK ===');
logger.info('RAZORPAY_KEY_ID: ' + (process.env.RAZORPAY_KEY_ID ? 'LOADED' : 'NOT FOUND'));
logger.info('RAZORPAY_KEY_SECRET: ' + (process.env.RAZORPAY_KEY_SECRET ? 'LOADED' : 'NOT FOUND'));
logger.info('========================');

// Connect to database
connectDB();

const app = express();

// CORS (placed before other middleware so every response inherits the headers)
const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

const isDev = (process.env.NODE_ENV || 'development') === 'development';
const devLocalhostRe = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i;

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without origin (Postman, cURL, server-to-server).
    if (!origin) {
      return callback(null, true);
    }

    if (isDev && devLocalhostRe.test(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});

if (!isDev) {
  app.use('/api', limiter);
} else {
  logger.info('Rate limiting disabled in development mode');
}

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cookie parser
app.use(cookieParser());

// Compression
app.use(compression());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/roadmap-progress', roadmapProgressRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/playground', playgroundRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Elite Digital Academy API is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Elite Digital Academy API',
    version: '1.0.0',
    documentation: '/api/docs'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

server.on('error', (err) => {
  if (err?.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use. Stop the other process using it, then restart.`);
    logger.error(`Tip (Windows): netstat -ano | findstr ":${PORT}"  then  taskkill /PID <pid> /F`);
    process.exit(1);
  }

  if (err?.code === 'EACCES') {
    logger.error(`No permission to bind to port ${PORT}. Try a different PORT or run with elevated permissions.`);
    process.exit(1);
  }

  logger.error(err);
  process.exit(1);
});

export default app;
