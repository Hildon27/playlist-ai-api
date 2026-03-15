import express from 'express';
import {
  getLoggedUserData,
  getAllPublicUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController';

const router = express.Router();

// Get user by ID
router.get('/me', getLoggedUserData);

// Get all users
router.get('/', getAllPublicUsers);

// Update user
router.put('/me', updateUser);

// Delete user
router.delete('/me', deleteUser);

export default router;
