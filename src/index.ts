import express from 'express';
import userRoutes from '@/routes/userRoutes';
import playlistRoutes from '@/routes/playlistRoutes';
import { globalErrorHandler } from '@/middleware/global-error-handling';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Playlist AI API',
    endpoints: {
      health: '/health',
      users: '/api/users',
      playlists: '/api/playlists',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global error handler
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🎵 Playlists API: http://localhost:${PORT}/api/playlists`);
  console.log(`\n📡 Available endpoints for Postman testing:`);
  console.log(
    `   GET    http://localhost:${PORT}/api/users        - Get all users`
  );
  console.log(
    `   GET    http://localhost:${PORT}/api/users/:id    - Get user by ID`
  );
  console.log(
    `   POST   http://localhost:${PORT}/api/users        - Create user`
  );
  console.log(
    `   PUT    http://localhost:${PORT}/api/users/:id    - Update user`
  );
  console.log(
    `   DELETE http://localhost:${PORT}/api/users/:id    - Delete user`
  );
  console.log(`\n🎵 Playlist endpoints:`);
  console.log(
    `   GET    http://localhost:${PORT}/api/playlists/:id              - Get playlist by ID`
  );
  console.log(
    `   GET    http://localhost:${PORT}/api/playlists/user/:userId     - Get playlists by user`
  );
  console.log(
    `   GET    http://localhost:${PORT}/api/playlists/public/all       - Get all public playlists`
  );
  console.log(
    `   POST   http://localhost:${PORT}/api/playlists                  - Create playlist`
  );
  console.log(
    `   PUT    http://localhost:${PORT}/api/playlists/:id              - Update playlist`
  );
  console.log(
    `   DELETE http://localhost:${PORT}/api/playlists/:id              - Delete playlist`
  );
  console.log(
    `   POST   http://localhost:${PORT}/api/playlists/:id/musics       - Add music to playlist`
  );
  console.log(
    `   DELETE http://localhost:${PORT}/api/playlists/:id/musics       - Remove music from playlist`
  );
  console.log(
    `   GET    http://localhost:${PORT}/api/playlists/:id/musics       - Get playlist musics`
  );
});
