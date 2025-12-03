import { requestToFollowUser } from '@/controllers/followRequestController';
import express from 'express';

const router = express.Router();

// Request to follow a existent user
router.post('/register', requestToFollowUser);

export default router;
