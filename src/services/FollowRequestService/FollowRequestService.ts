import { FollowRequestDto } from '@/models/followRequests';

export interface FollowRequestService {
  requestToFollowUser(
    followerId: string,
    followedUserEmail: string
  ): Promise<FollowRequestDto>;
  findAllByFollowerId(followerId: string): Promise<FollowRequestDto[]>;
  findAllByFollowedId(followedId: string): Promise<FollowRequestDto[]>;
  cancelFollowRequest(
    followRequestId: string,
    followerId: string
  ): Promise<void>;
}
