import {
  findAllUserFollowers,
  removeFollowerById,
  unfollowUserByFollowedId,
} from '@/controllers/followController';
import express from 'express';

const router = express.Router();

// Find all user followers
router.get('/followers', findAllUserFollowers);

// Unfollow user by follow ID
router.delete('/:followedId/unfollow', unfollowUserByFollowedId);

// Remove follower by follow ID
router.delete('/:followerId/remove', removeFollowerById);

export default router;
