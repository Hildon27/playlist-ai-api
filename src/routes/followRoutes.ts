import {
  findAllUserFollowers,
  unfollowUserByFollowId,
} from '@/controllers/followController';
import express from 'express';

const router = express.Router();

// Find all user followers
router.get('/:userId/followers', findAllUserFollowers);

// Unfollow user by follow ID
router.delete('/:id/unfollow', unfollowUserByFollowId);

// Remove follower by follow ID
router.delete('/:id/remove', unfollowUserByFollowId);

export default router;
