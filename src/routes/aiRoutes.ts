import { Router } from 'express';
import { generatePlaylist } from '@/controllers/aiController';
import { authenticate } from '@/middleware/authMiddleware';

const router = Router();

// Generate playlist using AI
router.post('/generate-playlist', authenticate, generatePlaylist);

export default router;
