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

  public async findAllUserFollowers(userId: string): Promise<FollowDto[]> {
    return await this.followRepository.findAllByFollowedId(userId);
  }
}
