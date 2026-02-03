import { ApiError, ErrorCode } from '@/models/Errors';
import { createUserSchema, updateUserSchema } from '@/models/users';
import { UserServiceImpl } from '@/services/UserService/UserServiceImpl';
import { NextFunction, Request, Response } from 'express';
import { createLogger } from '@/lib/logger';

const logger = createLogger('UserController');
const userService = new UserServiceImpl();

/**
 * Create a new user
 */
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info({ email: req.body.email }, 'Creating new user');
    const userData = createUserSchema.parse(req.body);

    const user = await userService.create(userData);

    logger.info({ userId: user.id }, 'User created successfully');
    res.status(201).json({
      success: true,
      data: user,
    });
  } catch (error) {
    logger.error({ error }, 'Error creating user');
    next(error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info({ userId: id }, 'Getting user by ID');

    if (!id || id.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const user = await userService.findById(id);

    if (!user) {
      logger.warn({ userId: id }, 'User not found');
      throw new ApiError(ErrorCode.USER_NOT_FOUND);
    }

    logger.info({ userId: id }, 'User found successfully');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).json({
        success: false,
        error: error.message,
        code: error.code,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    logger.info('Getting all users');
    const users = await userService.findAll();

    logger.info({ count: users.length }, 'Users retrieved successfully');
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).json({
        success: false,
        error: error.message,
        code: error.code,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

/**
 * Update user
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info({ userId: id }, 'Updating user');

    if (!id || id.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const userData = updateUserSchema.parse(req.body);

    const user = await userService.update(id, userData);

    if (!user) {
      logger.warn({ userId: id }, 'User not found for update');
      throw new ApiError(ErrorCode.USER_NOT_FOUND);
    }

    logger.info({ userId: id }, 'User updated successfully');
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).json({
        success: false,
        error: error.message,
        code: error.code,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};

/**
 * Delete user
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    logger.info({ userId: id }, 'Deleting user');

    if (!id || id.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    await userService.delete(id);

    logger.info({ userId: id }, 'User deleted successfully');
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    if (error instanceof ApiError) {
      res.status(error.status).json({
        success: false,
        error: error.message,
        code: error.code,
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
};
