import { FollowRepository } from '@/repositories/FollowRepository';
import { FollowService } from './FollowService';
import { FollowDto } from '@/models/follows';
import { ApiError, ErrorCode } from '@/models/Errors';
import { UserServiceImpl } from '../UserService/UserServiceImpl';

export class FollowServiceImpl implements FollowService {
  private readonly followRepository = new FollowRepository();
  private readonly userService = new UserServiceImpl();

  public async create(
    followerId: string,
    followedId: string
  ): Promise<FollowDto> {
    const follower = await this.userService.findById(followerId);
    if (!follower) {
      throw new ApiError(ErrorCode.FOLLOWER_NOT_FOUND);
    }
    const followed = await this.userService.findById(followedId);
    if (!followed) {
      throw new ApiError(ErrorCode.FOLLOWED_NOT_FOUND);
    }
    return await this.followRepository.create(followerId, followedId);
  }

  public async findByFollowerAndFollowedId(
    followerId: string,
    followedId: string
  ): Promise<FollowDto | null> {
    return await this.followRepository.findByFollowerAndFollowedId(
      followerId,
      followedId
    );
  }

  public async findAllUserFollowers(userId: string): Promise<FollowDto[]> {
    return await this.followRepository.findAllByFollowedId(userId);
  }

  public async deleteFollowByIdAndFollowedId(
    followerId: string,
    followedId: string
  ): Promise<void> {
    const existentFollow =
      await this.followRepository.findByFollowerAndFollowedId(
        followerId,
        followedId
      );

    if (!existentFollow) {
      throw new ApiError(ErrorCode.FOLLOW_NOT_FOUND);
    }

    await this.followRepository.delete(existentFollow.id);
  }
}
