import { FollowRequestDto } from '@/models/followRequests';

export interface FollowRequestService {
  requestToFollowUser(
    followerId: string,
    followedUserEmail: string
  ): Promise<FollowRequestDto>;
}
