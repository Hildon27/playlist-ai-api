import express from 'express';
import userRoutes from '@/routes/userRoutes';
import followRequestRoutes from '@/routes/followRequestRoutes';
import followRoutes from '@/routes/followRoutes';
import playlistRoutes from '@/routes/playlistRoutes';
import commentRoutes from '@/routes/commentRoutes';
import { globalErrorHandler } from '@/middleware/global-error-handling';
import { endpoints } from 'endpoints';

const app = express();
const PORT = process.env.PORT ?? 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/follow-requests', followRequestRoutes);
app.use('/api/follows', followRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/comments', commentRoutes);

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
    endpoints,
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
    `   DELETE /api/follows/:followed/unfollow           → Deixar de seguir usuário`
  );
  console.log(
    `   DELETE /api/follows/:follower/remove             → Remover seguidor`
  );
  console.log('──────────────────────────────────────────────');
  console.log(
    '\n💡 Utilize o arquivo postman-collection.json para testar todos os endpoints!'
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
