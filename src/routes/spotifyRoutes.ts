import { Router } from 'express';
import {
  searchTracks,
  getTrack,
  validateTracks,
  getRecommendations,
} from '@/controllers/spotifyController';

const router = Router();

// Search tracks
router.get('/search', searchTracks);

// Get single track by ID
router.get('/tracks/:id', getTrack);

// Validate multiple track IDs
router.post('/validate', validateTracks);

// Get recommendations based on seed tracks
router.post('/recommendations', getRecommendations);

export default router;
