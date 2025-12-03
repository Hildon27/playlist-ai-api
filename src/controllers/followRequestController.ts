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
