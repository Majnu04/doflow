import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

// Determine log level based on environment
const level = process.env.NODE_ENV === 'production' ? 'error' : 'debug';

// Create logger instance
const logger = winston.createLogger({
  level,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // Console transport for all environments
    new winston.transports.Console({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    // File transport for errors (production)
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5
          })
        ]
      : [])
  ],
  // Don't exit on uncaught exceptions in development
  exitOnError: process.env.NODE_ENV === 'production'
});

// Create a stream for Morgan HTTP logger
logger.stream = {
  write: (message) => logger.info(message.trim())
};

export default logger;
