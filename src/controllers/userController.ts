import { ApiError, ErrorCode } from '@/models/Errors';
import { updateUserSchema } from '@/models/users';
import { UserServiceImpl } from '@/services/UserService/UserServiceImpl';
import { Request, Response } from 'express';
import { createLogger } from '@/lib/logger';
import { AuthContext } from 'contexts/auth-context';

const logger = createLogger('UserController');
const userService = new UserServiceImpl();

/**
 * Get logged user data
 */
export const getLoggedUserData = async (_: Request, res: Response) => {
  try {
    const loggedUser = AuthContext.getLoggedUser();

    const user = await userService.findById(loggedUser.id);

    if (!user) {
      logger.warn('User not found');
      throw new ApiError(ErrorCode.USER_NOT_FOUND);
    }

    logger.info({ userId: user.id }, 'User found successfully');
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
export const getAllUsers = async (_: Request, res: Response) => {
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
 * Update logged user account
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    logger.info('Updating user');

    const userData = updateUserSchema.parse(req.body);

    const loggedUser = AuthContext.getLoggedUser();

    const user = await userService.update(loggedUser.id, userData);

    if (!user) {
      logger.warn('User not found for update');
      throw new ApiError(ErrorCode.USER_NOT_FOUND);
    }

    logger.info('User updated successfully');
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
 * Delete logged user account
 */
export const deleteUser = async (_: Request, res: Response) => {
  try {
    logger.info('Deleting user');

    const loggedUser = AuthContext.getLoggedUser();

    await userService.delete(loggedUser.id);

    logger.info('User deleted successfully');
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
