import { ApiError, ErrorCode } from '@/models/Errors';
import {
  cancelFollowRequestSchema,
  followRequestBaseSchema,
  proccessFollowRequestSchema,
} from '@/models/followRequests';
import { FollowRequestServiceImpl } from '@/services/FollowRequestService/FollowRequestServiceImpl';
import { NextFunction, Request, Response } from 'express';
import { createLogger } from '@/lib/logger';

const logger = createLogger('FollowRequestController');
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
    logger.info({ followerId, followedUserEmail }, 'Creating follow request');

    const followRequest = await followRequestService.requestToFollowUser(
      followerId,
      followedUserEmail
    );

    logger.info({ followRequestId: followRequest.id }, 'Follow request created successfully');
    res.status(201).json({
      success: true,
      data: followRequest,
    });
  } catch (error) {
    logger.error({ error }, 'Error creating follow request');
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
    logger.info({ followerId }, 'Getting follow requests by follower');

    if (!followerId || followerId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const followRequests =
      await followRequestService.findAllByFollowerId(followerId);

    logger.info({ followerId, count: followRequests.length }, 'Follow requests retrieved');
    res.status(200).json({
      success: true,
      data: followRequests,
    });
  } catch (error) {
    logger.error({ error }, 'Error getting follow requests');
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
    logger.info({ followedId }, 'Getting follow requests by followed');

    if (!followedId || followedId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const followRequests =
      await followRequestService.findAllByFollowedId(followedId);

    logger.info({ followedId, count: followRequests.length }, 'Follow requests retrieved');
    res.status(200).json({
      success: true,
      data: followRequests,
    });
  } catch (error) {
    logger.error({ error }, 'Error getting follow requests');
    next(error);
  }
};

/**
 * Cancel a follow requests by ID
 */
export const cancelFollowRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: followRequestId } = req.params;
    const { followerId } = cancelFollowRequestSchema.parse(req.body);
    logger.info({ followRequestId, followerId }, 'Cancelling follow request');

    if (!followRequestId || followRequestId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const followRequests = await followRequestService.cancelFollowRequest(
      followRequestId,
      followerId
    );

    logger.info({ followRequestId }, 'Follow request cancelled successfully');
    res.status(204).json({
      success: true,
      data: followRequests,
    });
  } catch (error) {
    logger.error({ error }, 'Error cancelling follow request');
    next(error);
  }
};

/**
 * Process a follow requests by ID (approve or reject)
 */
export const processFollowRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: followRequestId } = req.params;
    const { followedId, action } = proccessFollowRequestSchema.parse(req.body);
    logger.info({ followRequestId, followedId, action }, 'Processing follow request');

    if (!followRequestId || followRequestId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const followRequests = await followRequestService.processFollowRequest(
      followRequestId,
      followedId,
      action
    );

    logger.info({ followRequestId, action }, 'Follow request processed successfully');
    res.status(200).json({
      success: true,
      data: followRequests,
    });
  } catch (error) {
    logger.error({ error }, 'Error processing follow request');
    next(error);
  }
};
