import { ApiError, ErrorCode } from '@/models/Errors';
import { FollowServiceImpl } from '@/services/Follow/FollowServiceImpl';
import { NextFunction, Request, Response } from 'express';
import { createLogger } from '@/lib/logger';
import { AuthContext } from 'contexts/auth-context';

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
    const user = AuthContext.getLoggedUser();

    const followers = await followService.findAllUserFollowers(user.id);

    logger.info(
      { userId: user.id, count: followers.length },
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

    if (!followedId || followedId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const user = AuthContext.getLoggedUser();

    logger.info({ followerId: user.id, followedId }, 'Unfollowing user');

    await followService.deleteFollowByFollowerAndFollowedId(
      user.id,
      followedId
    );

    logger.info({ followerId: user.id, followedId }, 'Unfollowed successfully');
    res.status(204).json({
      success: true,
    });
  } catch (error) {
    logger.error({ error }, 'Error unfollowing user');
    next(error);
  }
};

/**
 * Remove follower by ID
 */
export const removeFollowerById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { followerId } = req.params;

    if (!followerId || followerId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const user = AuthContext.getLoggedUser();

    logger.info({ followerId, followedId: user.id }, 'Removing follower');

    await followService.deleteFollowByFollowerAndFollowedId(
      followerId,
      user.id
    );

    logger.info(
      { followerId, followedId: user.id },
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
