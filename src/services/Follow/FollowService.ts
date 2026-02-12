import { PaginatedResult, PaginationParams } from '@/lib/pagination';
import { FollowDto } from '@/models/follows';

export interface FollowService {
  create(followerId: string, followedId: string): Promise<FollowDto>;
  findAllUserFollowers(
    userId: string,
    params: PaginationParams<FollowDto>
  ): Promise<PaginatedResult<FollowDto>>;
  findAllUserFolloweds(
    userId: string,
    params: PaginationParams<FollowDto>
  ): Promise<PaginatedResult<FollowDto>>;
  deleteFollowByFollowerAndFollowedId(
    followId: string,
    followedId: string
  ): Promise<void>;
}
