import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import { logger } from '@/lib/logger';
import { requestLogger } from '@/middleware/requestLogger';
import userRoutes from '@/routes/userRoutes';
import followRequestRoutes from '@/routes/followRequestRoutes';
import followRoutes from '@/routes/followRoutes';
import playlistRoutes from '@/routes/playlistRoutes';
import commentRoutes from '@/routes/commentRoutes';
import authRoutes from './routes/authRoutes';
import spotifyRoutes from '@/routes/spotifyRoutes';
import aiRoutes from '@/routes/aiRoutes';
import { globalErrorHandler } from '@/middleware/globalErrorHandling';
import { authenticate } from '@/middleware/authMiddleware';
import { endpoints } from 'endpoints';
import {
  authLimiter,
  generalLimiter,
  heavyLimiter,
} from './middleware/rateLimiters';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(
  cors({
    origin: process.env.CORS_ALLOWED_ORIGINS?.split(','),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Middlewares
app.use(requestLogger);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public Routes
app.use('/auth', authLimiter, authRoutes);

// Protected Routes (require JWT token)
app.use('/api/users', authenticate, generalLimiter, userRoutes);
app.use(
  '/api/follow-requests',
  authenticate,
  generalLimiter,
  followRequestRoutes
);
app.use('/api/follows', authenticate, generalLimiter, followRoutes);
app.use('/api/playlists', authenticate, generalLimiter, playlistRoutes);
app.use('/api/comments', authenticate, generalLimiter, commentRoutes);
app.use('/api/spotify', authenticate, heavyLimiter, spotifyRoutes);
app.use('/api/ai', authenticate, heavyLimiter, aiRoutes);

app.set('trust proxy', 1);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/api', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Playlist AI API',
    endpoints,
  });
});

app.use((_, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info('Available endpoints:');
  logger.info('  GET /api/health - Health check');
  logger.info('  GET /api - API info');
  logger.info('  Users: /api/users');
  logger.info('  Auth: /auth');
  logger.info('  Follow Requests: /api/follow-requests');
  logger.info('  Follows: /api/follows');
  logger.info('  Playlists: /api/playlists');
  logger.info('  Spotify: /api/spotify');
  logger.info('  Comments: /api/comments');
  logger.info('Use postman-collection.json to test all endpoints!');
});
