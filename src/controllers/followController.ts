import { ApiError, ErrorCode } from '@/models/Errors';
import { FollowServiceImpl } from '@/services/Follow/FollowServiceImpl';
import { NextFunction, Request, Response } from 'express';

const followService = new FollowServiceImpl();

/**
 * Find all user followers
 */
export const findAllUserFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    if (!userId || userId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const followers = await followService.findAllUserFollowers(userId);

    res.status(200).json({
      success: true,
      data: followers,
    });
  } catch (error) {
    next(error);
  }
};
