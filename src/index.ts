import express from 'express';
import userRoutes from '@/routes/userRoutes';
import followRequestRoutes from '@/routes/followRequestRoutes';
import { globalErrorHandler } from '@/middleware/global-error-handling';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/follow-requests', followRequestRoutes);

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
// ...existing code...
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(
    `🔗 Follow Requests API: http://localhost:${PORT}/api/follow-requests`
  );
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
  console.log(
    `   POST   http://localhost:${PORT}/api/follow-requests/register         - Request to follow user`
  );
  console.log(
    `   GET    http://localhost:${PORT}/api/follow-requests/by-follower/:id  - Get follow requests by follower`
  );
  console.log(
    `   GET    http://localhost:${PORT}/api/follow-requests/by-followed/:id  - Get follow requests by followed`
  );
});
