import { ApiError, ErrorCode } from '@/models/Errors';
import { followRequestBaseSchema } from '@/models/followRequests';
import { FollowRequestServiceImpl } from '@/services/FollowRequestService/FollowRequestServiceImpl';
import { NextFunction, Request, Response } from 'express';

const followRequestService = new FollowRequestServiceImpl();

/**
 * Request to follow a existent user
 */
export const requestToFollowUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = followRequestBaseSchema.parse(req.body);
    const { followerId, followedUserEmail } = data;

    const followRequest = await followRequestService.requestToFollowUser(
      followerId,
      followedUserEmail
    );

    res.status(201).json({
      success: true,
      data: followRequest,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Find all follow requests by follower ID
 */
export const findAllByFollowerId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: followerId } = req.params;

    if (!followerId || followerId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const followRequests =
      await followRequestService.findAllByFollowerId(followerId);

    res.status(200).json({
      success: true,
      data: followRequests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Find all follow requests by followed ID
 */
export const findAllByFollowedId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: followedId } = req.params;

    if (!followedId || followedId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const followRequests =
      await followRequestService.findAllByFollowedId(followedId);

    res.status(200).json({
      success: true,
      data: followRequests,
    });
  } catch (error) {
    next(error);
  }
};
