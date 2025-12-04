import express from 'express';
import userRoutes from '@/routes/userRoutes';
import followRequestRoutes from '@/routes/followRequestRoutes';
import followRoutes from '@/routes/followRoutes';
import { globalErrorHandler } from '@/middleware/global-error-handling';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/follow-requests', followRequestRoutes);
app.use('/api/follows', followRoutes);

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
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('\n📋 Endpoints disponíveis:');
  console.log('──────────────────────────────────────────────');
  console.log('🔎 Health');
  console.log(
    `   GET    /api/health                         → Verificar saúde da API`
  );
  console.log('──────────────────────────────────────────────');
  console.log('👤 Users');
  console.log(
    `   GET    /api/users                          → Listar todos usuários`
  );
  console.log(
    `   GET    /api/users/:id                      → Buscar usuário por ID`
  );
  console.log(`   POST   /api/users                          → Criar usuário`);
  console.log(
    `   PUT    /api/users/:id                      → Atualizar usuário`
  );
  console.log(
    `   DELETE /api/users/:id                      → Remover usuário`
  );
  console.log('──────────────────────────────────────────────');
  console.log('🔗 Follow Requests');
  console.log(
    `   POST   /api/follow-requests/register       → Solicitar seguir usuário`
  );
  console.log(
    `   GET    /api/follow-requests/by-follower/:id→ Listar solicitações por seguidor`
  );
  console.log(
    `   GET    /api/follow-requests/by-followed/:id→ Listar solicitações por seguido`
  );
  console.log(
    `   DELETE /api/follow-requests/:id            → Cancelar solicitação de seguir`
  );
  console.log(
    `   PATCH  /api/follow-requests/:id/process    → Processar solicitação (aprovar/rejeitar)`
  );
  console.log('──────────────────────────────────────────────');
  console.log('👥 Follows');
  console.log(
    `   GET    /api/follows/:userId/followers      → Listar seguidores do usuário`
  );
  console.log(
    `   DELETE /api/follows/:id/unfollow           → Deixar de seguir usuário`
  );
  console.log(
    `   DELETE /api/follows/:id/remove             → Remover seguidor`
  );
  console.log('──────────────────────────────────────────────');
  console.log(
    '\n💡 Utilize o arquivo postman-collection.json para testar todos os endpoints!'
  );
});
