import { Router } from 'express';
import { generatePlaylist } from '@/controllers/aiController';

const router = Router();

// Generate playlist using AI
router.post('/generate-playlist', generatePlaylist);

export default router;
