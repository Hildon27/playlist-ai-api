import { FollowRequestDto } from '@/models/followRequests';
import { FollowRequestService } from './FollowRequestService';
import { ApiError, ErrorCode } from '@/models/Errors';
import { FollowRequestRepository } from '@/repositories/FollowRequestRepository';
import {
  FollowRequestProcessingAction,
  FollowRequestStatus,
  Privacity,
} from '@/models/Enums';
import { FollowServiceImpl } from '../Follow/FollowServiceImpl';
import { UserServiceImpl } from '../UserService/UserServiceImpl';
import { createLogger } from '@/lib/logger';

const logger = createLogger('FollowRequestService');

export class FollowRequestServiceImpl implements FollowRequestService {
  private readonly followRequestRepository = new FollowRequestRepository();
  private readonly userService = new UserServiceImpl();
  private readonly followService = new FollowServiceImpl();

  async requestToFollowUser(
    followerId: string,
    followedUserEmail: string
  ): Promise<FollowRequestDto> {
    logger.debug({ followerId, followedUserEmail }, 'Creating follow request');
    const existentUser = await this.userService.findByEmail(followedUserEmail);

    if (!existentUser || existentUser.privacity === Privacity.PRIVATE) {
      logger.warn({ followedUserEmail }, 'Followed user not found or private');
      throw new ApiError(
        ErrorCode.FOLLOW_REQUEST_PUBLIC_FOLLOWED_USER_NOT_FOUND
      );
    }

    const followedId = existentUser.id;

    if (followerId === followedId) {
      logger.warn({ followerId }, 'User cannot follow themselves');
      throw new ApiError(
        ErrorCode.FOLLOWER_ID_AND_FOLLOWED_ID_CAN_NOT_BE_EQUALS
      );
    }

    const existentFollow = await this.followService.findByFollowerAndFollowedId(
      followerId,
      followedId
    );

    if (existentFollow) {
      logger.warn({ followerId, followedId }, 'Follow already exists');
      throw new ApiError(ErrorCode.FOLLOW_ALREADY_EXISTS);
    }

    const exitentfollowRequest =
      await this.followRequestRepository.findByFollowerAndFollowedId(
        followerId,
        followedId
      );

    if (
      exitentfollowRequest &&
      exitentfollowRequest.status === FollowRequestStatus.PENDING
    ) {
      logger.warn({ followerId, followedId }, 'Follow request already pending');
      throw new ApiError(ErrorCode.FOLLOW_REQUEST_ALREADY_EXISTS);
    }

    const result = await this.followRequestRepository.create(followerId, followedId);
    logger.info({ followRequestId: result.id }, 'Follow request created');
    return result;
  }

  public async findAllByFollowerId(
    followerId: string
  ): Promise<FollowRequestDto[]> {
    return await this.followRequestRepository.findAllByFollowerId(followerId);
  }

  public async findAllByFollowedId(
    followedId: string
  ): Promise<FollowRequestDto[]> {
    return await this.followRequestRepository.findAllByFollowedId(followedId);
  }

  public async cancelFollowRequest(
    followRequestId: string,
    followerId: string
  ): Promise<void> {
    const followRequest =
      await this.followRequestRepository.findById(followRequestId);

    if (followRequest?.followerId !== followerId) {
      throw new ApiError(ErrorCode.FOLLOW_REQUEST_NOT_FOUND);
    }
    if (followRequest.status !== FollowRequestStatus.PENDING) {
      throw new ApiError(ErrorCode.FOLLOW_REQUEST_NOT_PENDING);
    }

    await this.followRequestRepository.delete(followRequestId);
  }

  public async processFollowRequest(
    followRequestId: string,
    followedId: string,
    action: FollowRequestProcessingAction
  ): Promise<FollowRequestDto> {
    logger.debug({ followRequestId, followedId, action }, 'Processing follow request');
    const followRequest =
      await this.followRequestRepository.findById(followRequestId);

    if (followRequest?.followedId !== followedId) {
      logger.warn({ followRequestId }, 'Follow request not found');
      throw new ApiError(ErrorCode.FOLLOW_REQUEST_NOT_FOUND);
    }
    if (followRequest.status !== FollowRequestStatus.PENDING) {
      logger.warn({ followRequestId, status: followRequest.status }, 'Follow request not pending');
      throw new ApiError(ErrorCode.FOLLOW_REQUEST_NOT_PENDING);
    }

    const newStatus =
      action === FollowRequestProcessingAction.ACCEPT
        ? FollowRequestStatus.APPROVED
        : FollowRequestStatus.REJECTED;

    if (action === FollowRequestProcessingAction.ACCEPT) {
      await this.followService.create(
        followRequest.followerId,
        followRequest.followedId
      );
      logger.info({ followRequestId }, 'Follow request accepted, follow created');
    } else {
      logger.info({ followRequestId }, 'Follow request rejected');
    }

    return await this.followRequestRepository.updateFollowRequestStatus(
      followRequestId,
      newStatus
    );
  }
}
