import { NextFunction, Request, Response } from 'express';
import { UserServiceImpl } from '@/services/UserService/UserServiceImpl';
import { createUserSchema } from '@/models/users';

const userService = new UserServiceImpl();

/**
 * Handles user registration.
 * Creates a new user account with the provided details.
 *
 * @param req - Express request object containing user data in the body
 * @param res - Express response object
 * @param next - Express next function for error handling
 * @returns JSON response with created user on success
 */
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userData = createUserSchema.parse(req.body);
    const user = await userService.create(userData);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Handles user authentication and login.
 * Validates email and password, then returns a JWT token on success.
 *
 * @param req - Express request object containing email and password in the body
 * @param res - Express response object
 * @returns JSON response with token on success, or error message on failure
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  try {
    const { token } = await userService.authenticate(email, password);

    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    next(error);
  }
};
