import express from 'express';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Root route
app.get('/', (req, res) => {
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
    error: 'Route not found',
  });
});

// Error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
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
});
