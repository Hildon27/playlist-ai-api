import {
  cancelFollowRequest,
  findAllByFollowedId,
  findAllByFollowerId,
  processFollowRequest,
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

// Cancel a follow request by ID
router.delete('/:id', cancelFollowRequest);

// Process a follow request by ID
router.patch('/:id/process', processFollowRequest);

export default router;
