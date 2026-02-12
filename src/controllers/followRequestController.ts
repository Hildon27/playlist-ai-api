import { ApiError, ErrorCode } from '@/models/Errors';
import {
  findManyFollowRequestsSchema,
  followRequestBaseSchema,
  proccessFollowRequestSchema,
} from '@/models/followRequests';
import { FollowRequestServiceImpl } from '@/services/FollowRequestService/FollowRequestServiceImpl';
import { NextFunction, Request, Response } from 'express';
import { createLogger } from '@/lib/logger';
import { AuthContext } from 'contexts/auth-context';

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
    const { followedUserEmail } = data;

    const user = AuthContext.getLoggedUser();
    const followerId = user.id;

    logger.info({ followerId, followedUserEmail }, 'Creating follow request');

    const followRequest = await followRequestService.requestToFollowUser(
      followerId,
      followedUserEmail
    );

    logger.info(
      { followRequestId: followRequest.id },
      'Follow request created successfully'
    );
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
 * Find all follow requests sent by logged user
 */
export const findSentFollowRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = AuthContext.getLoggedUser();

    const params = findManyFollowRequestsSchema.parse(req.query);

    const followRequests = await followRequestService.findSentFollowRequests(
      user.id,
      params
    );

    logger.info(
      { followerId: user.id, count: followRequests.data.length },
      'Follow requests retrieved'
    );
    res.status(200).json({
      success: true,
      ...followRequests,
    });
  } catch (error) {
    logger.error({ error }, 'Error getting follow requests');
    next(error);
  }
};

/**
 * Find all follow requests received by the logged-in user.
 */
export const findReceivedFollowRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = AuthContext.getLoggedUser();

    const params = findManyFollowRequestsSchema.parse(req.query);

    const followRequests =
      await followRequestService.findReceivedFollowRequests(user.id, params);

    logger.info(
      { followedId: user.id, count: followRequests.data.length },
      'Follow requests retrieved'
    );
    res.status(200).json({
      success: true,
      ...followRequests,
    });
  } catch (error) {
    logger.error({ error }, 'Error getting follow requests');
    next(error);
  }
};

/**
 * Cancel a follow request by ID
 */
export const cancelFollowRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id: followRequestId } = req.params;

    if (!followRequestId || followRequestId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const user = AuthContext.getLoggedUser();

    logger.info(
      { followRequestId, followerId: user.id },
      'Cancelling follow request'
    );

    const followRequests = await followRequestService.cancelFollowRequest(
      followRequestId,
      user.id
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
    const { action } = proccessFollowRequestSchema.parse(req.body);

    if (!followRequestId || followRequestId.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const user = AuthContext.getLoggedUser();

    logger.info(
      { followRequestId, followedId: user.id, action },
      'Processing follow request'
    );

    const followRequests = await followRequestService.processFollowRequest(
      followRequestId,
      user.id,
      action
    );

    logger.info(
      { followRequestId, action },
      'Follow request processed successfully'
    );
    res.status(200).json({
      success: true,
      data: followRequests,
    });
  } catch (error) {
    logger.error({ error }, 'Error processing follow request');
    next(error);
  }
};
