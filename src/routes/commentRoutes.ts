import { Router } from 'express';
import { PlaylistCommentController } from '@/controllers/playlistCommentController';

const router = Router();
const commentController = new PlaylistCommentController();

// CRUD routes for playlist comments
router.post('/:playlistId', commentController.createComment);
router.get('/:id', commentController.getCommentById);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);

// Routes to get comments by playlist or user
router.get('/playlist/:playlistId', commentController.getCommentsByPlaylistId);
router.get('/user/:userId', commentController.getCommentsByUserId);

export default router;
