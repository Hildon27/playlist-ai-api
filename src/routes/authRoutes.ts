import express from 'express';
import { login, register } from '../controllers/authController';

const router = express.Router();

// Register a new user
router.post('/register', register);

// Login
router.post('/login', login);

export default router;
