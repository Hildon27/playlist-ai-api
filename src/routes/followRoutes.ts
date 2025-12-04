import { findAllUserFollowers } from '@/controllers/followController';
import express from 'express';

const router = express.Router();

// Find all user followers
router.get('/:userId/followers', findAllUserFollowers);

export default router;
