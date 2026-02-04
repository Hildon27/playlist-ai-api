import { FollowRepository } from '@/repositories/FollowRepository';
import { FollowService } from './FollowService';
import { FollowDto } from '@/models/follows';
import { ApiError, ErrorCode } from '@/models/Errors';
import { UserServiceImpl } from '../UserService/UserServiceImpl';
import { createLogger } from '@/lib/logger';

const logger = createLogger('FollowService');

export class FollowServiceImpl implements FollowService {
  private readonly followRepository = new FollowRepository();
  private readonly userService = new UserServiceImpl();

  public async create(
    followerId: string,
    followedId: string
  ): Promise<FollowDto> {
    logger.debug({ followerId, followedId }, 'Creating follow relationship');
    const follower = await this.userService.findById(followerId);
    if (!follower) {
      logger.warn({ followerId }, 'Follower not found');
      throw new ApiError(ErrorCode.FOLLOWER_NOT_FOUND);
    }
    const followed = await this.userService.findById(followedId);
    if (!followed) {
      logger.warn({ followedId }, 'Followed user not found');
      throw new ApiError(ErrorCode.FOLLOWED_NOT_FOUND);
    }
    const result = await this.followRepository.create(followerId, followedId);
    logger.info({ followId: result.id }, 'Follow relationship created');
    return result;
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

  public async deleteFollowByFollowerAndFollowedId(
    followerId: string,
    followedId: string
  ): Promise<void> {
    logger.debug({ followerId, followedId }, 'Deleting follow relationship');
    const existentFollow =
      await this.followRepository.findByFollowerAndFollowedId(
        followerId,
        followedId
      );

    if (!existentFollow) {
      logger.warn({ followerId, followedId }, 'Follow relationship not found');
      throw new ApiError(ErrorCode.FOLLOW_NOT_FOUND);
    }

    await this.followRepository.delete(existentFollow.id);
    logger.info({ followId: existentFollow.id }, 'Follow relationship deleted');
  }
}
