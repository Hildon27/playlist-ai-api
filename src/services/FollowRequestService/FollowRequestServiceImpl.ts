import { UserRepository } from '@/repositories/UserRepository';
import { FollowRequestDto } from '@/models/followRequests';
import { FollowRequestService } from './FollowRequestService';
import { ApiError, ErrorCode } from '@/models/Errors';
import { FollowRequestRepository } from '@/repositories/FollowRequestRepository';
import { FollowRequestStatus, Privacity } from '@/models/Enums';

export class FollowRequestServiceImpl implements FollowRequestService {
  private readonly followRequestRepository = new FollowRequestRepository();
  private readonly userRepository = new UserRepository();

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
}
