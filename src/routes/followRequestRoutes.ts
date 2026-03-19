import {
  cancelFollowRequest,
  findSentFollowRequests,
  findReceivedFollowRequests,
  processFollowRequest,
  requestToFollowUser,
} from '@/controllers/followRequestController';
import express from 'express';

const router = express.Router();

// Request to follow a existent user
router.post('/register', requestToFollowUser);

// Find all follow requests sent by logged user
router.get('/sent', findSentFollowRequests);

// Find all follow requests received by the logged-in user.
router.get('/received', findReceivedFollowRequests);

// Cancel a follow request by ID
router.delete('/:id', cancelFollowRequest);

// Process a follow request by ID
router.patch('/:id/process', processFollowRequest);

export default router;
