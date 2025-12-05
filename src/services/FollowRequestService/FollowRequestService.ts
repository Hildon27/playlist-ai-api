import { FollowRequestProcessingAction } from '@/models/Enums';
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
  processFollowRequest(
    followRequestId: string,
    followedId: string,
    action: FollowRequestProcessingAction
  ): Promise<FollowRequestDto>;
}
