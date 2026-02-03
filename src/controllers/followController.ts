import { ApiError, ErrorCode } from '@/models/Errors';
import { removeFollowerBodySchema, unfollowBodySchema } from '@/models/follows';
import { FollowServiceImpl } from '@/services/Follow/FollowServiceImpl';
import { NextFunction, Request, Response } from 'express';
import { createLogger } from '@/lib/logger';

const logger = createLogger('FollowController');
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
    logger.info({ userId }, 'Getting all followers for user');

    if (!userId || userId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const followers = await followService.findAllUserFollowers(userId);

    logger.info(
      { userId, count: followers.length },
      'Followers retrieved successfully'
    );
    res.status(200).json({
      success: true,
      data: followers,
    });
  } catch (error) {
    logger.error({ error }, 'Error getting followers');
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
    logger.info(
      { followerId: data.followerId, followedId },
      'Unfollowing user'
    );

    if (!followedId || followedId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    await followService.deleteFollowByIdAndFollowedId(
      data.followerId,
      followedId
    );

    logger.info(
      { followerId: data.followerId, followedId },
      'Unfollowed successfully'
    );
    res.status(204).json({
      success: true,
    });
  } catch (error) {
    logger.error({ error }, 'Error unfollowing user');
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
    logger.info(
      { followerId, followedId: data.followedId },
      'Removing follower'
    );

    if (!followerId || followerId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    await followService.deleteFollowByIdAndFollowedId(
      followerId,
      data.followedId
    );

    logger.info(
      { followerId, followedId: data.followedId },
      'Follower removed successfully'
    );
    res.status(204).json({
      success: true,
    });
  } catch (error) {
    logger.error({ error }, 'Error removing follower');
    next(error);
  }
};
