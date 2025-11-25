import express from 'express';
import {
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
} from '../controllers/userController';

const router = express.Router();

// Create a new user
router.post('/', createUser);

// Get user by ID
router.get('/:id', getUserById);

// Get all users
router.get('/', getAllUsers);

// Update user
router.put('/:id', updateUser);

// Delete user
router.delete('/:id', deleteUser);

export default router;
