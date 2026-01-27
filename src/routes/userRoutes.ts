import express from 'express';
import {
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController';

const router = express.Router();

// Get user by ID
router.get('/:id', getUserById);

// Get all users
router.get('/', getAllUsers);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

export default router;
