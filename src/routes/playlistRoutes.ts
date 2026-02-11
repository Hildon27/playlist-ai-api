import { Router } from 'express';
import { UserPlaylistController } from '@/controllers/playlistController';

const router = Router();
const playlistController = new UserPlaylistController();

// Rotas para buscar playlists
router.get('/user', playlistController.getLoggedUserPlaylists);
router.get('/public/all', playlistController.getPublicPlaylists);

// Rotas para CRUD básico de playlists
router.post('/', playlistController.createPlaylist);
router.put('/:id', playlistController.updatePlaylist);
router.delete('/:id', playlistController.deletePlaylist);
router.get('/:id', playlistController.getPlaylistById);

// Rotas para gerenciar músicas nas playlists
router.post('/:id/musics', playlistController.addMusicToPlaylist);
router.delete('/:id/musics', playlistController.removeMusicFromPlaylist);
router.get('/:id/musics', playlistController.getPlaylistMusics);

export default router;
