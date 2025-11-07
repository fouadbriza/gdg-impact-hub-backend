// src/server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { v2 as cloudinary } from 'cloudinary';
import sgMail from '@sendgrid/mail';

// Config imports
import env from './config/env.js';
import prisma from './config/prisma.js';
import passport from './config/passport.js';

// Middleware imports
import { errorHandler, notFound } from './middlewares/error.js';
import { apiLimiter } from './middlewares/rateLimiter.js';

// Utility imports
import logger, { stream } from './utils/logger.js';

// Route imports
import routes from './routers/index.js';

const app = express();
const PORT = env.PORT || 3000;

// ============================================
// THIRD-PARTY CONFIGURATION
// ============================================

// Configure SendGrid
sgMail.setApiKey(env.SENDGRID_API_KEY);

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.NODE_ENV === 'production' ? process.env.CORS_ORIGIN : '*',
    credentials: true,
  })
);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging with Winston stream
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream }));

// Rate limiting
app.use('/api', apiLimiter);

// Passport initialization
app.use(passport.initialize());

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API routes - all under /api/v1
app.use('/api/v1', routes);

// ============================================
// ERROR HANDLING
// ============================================

// Handle 404
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', { error: error.message });
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();

export default app;
