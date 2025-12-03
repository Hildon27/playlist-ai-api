import { UserRepository } from '@/repositories/UserRepository';
import { FollowRequestDto } from '@/models/followRequests';
import { FollowRequestService } from './FollowRequestService';
import { ApiError, ErrorCode } from '@/models/Errors';
import { FollowRequestRepository } from '@/repositories/FollowRequestRepository';
import {
  FollowRequestProcessingAction,
  FollowRequestStatus,
  Privacity,
} from '@/models/Enums';
import { FollowRepository } from '@/repositories/FollowRepository';

export class FollowRequestServiceImpl implements FollowRequestService {
  private readonly followRequestRepository = new FollowRequestRepository();
  private readonly userRepository = new UserRepository();
  private readonly followRepository = new FollowRepository();

  async requestToFollowUser(
    followerId: string,
    followedUserEmail: string
  ): Promise<FollowRequestDto> {
    const existentUser =
      await this.userRepository.findByEmail(followedUserEmail);

    if (!existentUser || existentUser.privacity === Privacity.PRIVATE) {
      throw new ApiError(
        ErrorCode.FOLLOW_REQUEST_PUBLIC_FOLLOWED_USER_NOT_FOUND
      );
    }

    const followedId = existentUser.id;

    if (followerId === followedId) {
      throw new ApiError(
        ErrorCode.FOLLOWER_ID_AND_FOLLOWED_ID_CAN_NOT_BE_EQUALS
      );
    }

    const exitentfollowRequest =
      await this.followRequestRepository.findByFollowerAndFollowedId(
        followerId,
        followedId
      );

    if (
      exitentfollowRequest &&
      exitentfollowRequest.status !== FollowRequestStatus.REJECTED
    ) {
      throw new ApiError(ErrorCode.FOLLOW_REQUEST_ALREADY_EXISTS);
    }

    return await this.followRequestRepository.create(followerId, followedId);
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

    if (!followRequest || followRequest.followerId !== followerId) {
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
    const followRequest =
      await this.followRequestRepository.findById(followRequestId);

    if (!followRequest || followRequest.followedId !== followedId) {
      throw new ApiError(ErrorCode.FOLLOW_REQUEST_NOT_FOUND);
    }
    if (followRequest.status !== FollowRequestStatus.PENDING) {
      throw new ApiError(ErrorCode.FOLLOW_REQUEST_NOT_PENDING);
    }

    const newStatus =
      action === FollowRequestProcessingAction.ACCEPT
        ? FollowRequestStatus.APPROVED
        : FollowRequestStatus.REJECTED;

        
    if (action === FollowRequestProcessingAction.ACCEPT) {
      await this.followRepository.create(followRequest.followerId, followRequest.followedId);
    }

    return await this.followRequestRepository.updateFollowRequestStatus(
      followRequestId,
      newStatus
    );
  }
}
