import { FollowRepository } from '@/repositories/FollowRepository';
import { FollowService } from './FollowService';
import { FollowDto } from '@/models/follows';
import { UserRepository } from '@/repositories/UserRepository';
import { ApiError, ErrorCode } from '@/models/Errors';

export class FollowRequestServiceImpl implements FollowService {
  private readonly userRepository = new UserRepository;
  private readonly followRepository = new FollowRepository();

  public async create(
    followerId: string,
    followedId: string
  ): Promise<FollowDto> {
    const follower = await this.userRepository.findById(followerId);
    if (!follower) {
      throw new ApiError(ErrorCode.FOLLOWER_NOT_FOUND);
    }
    const followed = await this.userRepository.findById(followedId);
    if (!followed) {
      throw new ApiError(ErrorCode.FOLLOWED_NOT_FOUND);
    }
    return await this.followRepository.create(followerId, followedId);
  }

}
