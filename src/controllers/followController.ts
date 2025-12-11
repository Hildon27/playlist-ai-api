import { ApiError, ErrorCode } from '@/models/Errors';
import { removeFollowerBodySchema, unfollowBodySchema } from '@/models/follows';
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

/**
 * Unfollow user by followed ID
 */
export const unfollowUserByFollowedId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { followedId } = req.params;
    const data = unfollowBodySchema.parse(req.body);

    if (!followedId || followedId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    await followService.deleteFollowByIdAndFollowedId(
      data.followerId,
      followedId
    );

    res.status(204).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove follower by follower ID
 */
export const removeFollowerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { followerId } = req.params;
    const data = removeFollowerBodySchema.parse(req.body);

    if (!followerId || followerId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    await followService.deleteFollowByIdAndFollowedId(
      followerId,
      data.followedId
    );

    res.status(204).json({
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
