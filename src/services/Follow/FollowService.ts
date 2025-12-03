import { FollowDto } from '@/models/follows';

export interface FollowService {
  create(
    followerId: string,
    followedId: string
  ): Promise<FollowDto>;
}
