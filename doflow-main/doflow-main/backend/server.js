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
import discussionRoutes from './routes/discussionRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import roadmapProgressRoutes from './routes/roadmapProgressRoutes.js';
import dsaRoutes from './routes/dsaRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import codeExecutionRoutes from './routes/codeExecutionRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import marketingRoutes from './routes/marketingRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars with explicit path
dotenv.config({ path: join(__dirname, '.env') });

logger.info('=== ENVIRONMENT CHECK ===');
logger.info('RAZORPAY_KEY_ID: ' + (process.env.RAZORPAY_KEY_ID ? 'LOADED' : 'NOT FOUND'));
logger.info('RAZORPAY_KEY_SECRET: ' + (process.env.RAZORPAY_KEY_SECRET ? 'LOADED' : 'NOT FOUND'));
logger.info('JWT_SECRET: ' + (process.env.JWT_SECRET ? 'LOADED' : 'NOT FOUND'));
logger.info('========================');

// JWT_SECRET is required - the app cannot sign or verify tokens without it
if (!process.env.JWT_SECRET) {
  logger.error('JWT_SECRET is not set. Authentication will not work.');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Connect to database (will be awaited before server starts)
const dbPromise = connectDB();

const app = express();

// Trust proxy (required for Render, Heroku, etc. so rate-limiter sees real IPs)
app.set('trust proxy', 1);

// CORS (placed before other middleware so every response inherits the headers)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'https://doflow.tech',
  'https://www.doflow.tech',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.some((o) => o === origin)) return callback(null, true);
    try {
      const host = new URL(origin).hostname;
      if (host === 'doflow.tech' || host === 'www.doflow.tech' || host.endsWith('.vercel.app')) {
        return callback(null, true);
      }
    } catch {}
    console.error(`[CORS] Blocked origin: "${origin}" | Allowed: ${allowedOrigins.join(', ')}`);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Security middleware
app.use(helmet());

// Rate limiting - increased for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs (increased for dev)
});
app.use('/api', limiter);

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
app.use('/api/discussions', discussionRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/roadmap-progress', roadmapProgressRoutes);
app.use('/api/dsa', dsaRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/code', codeExecutionRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/gamification', gamificationRoutes);

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

// Wait for database connection before starting the server
dbPromise.then(() => {
  app.listen(PORT, () => {
    logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch((err) => {
  logger.error('Failed to connect to database:', err?.message || err);
  process.exit(1);
});

export default app;
