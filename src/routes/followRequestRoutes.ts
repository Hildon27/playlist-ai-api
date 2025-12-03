import {
  findAllByFollowedId,
  findAllByFollowerId,
  requestToFollowUser,
} from '@/controllers/followRequestController';
import express from 'express';

const router = express.Router();

// Request to follow a existent user
router.post('/register', requestToFollowUser);

// Find all requests by follower ID
router.get('/by-follower/:id', findAllByFollowerId);

// Find all requests by follower ID
router.get('/by-followed/:id', findAllByFollowedId);

export default router;
