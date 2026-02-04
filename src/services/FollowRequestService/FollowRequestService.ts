import { FollowRequestProcessingAction } from '@/models/Enums';
import { FollowRequestDto } from '@/models/followRequests';

export interface FollowRequestService {
  requestToFollowUser(
    followerId: string,
    followedUserEmail: string
  ): Promise<FollowRequestDto>;
  findSentFollowRequests(userId: string): Promise<FollowRequestDto[]>;
  findReceivedFollowRequests(userId: string): Promise<FollowRequestDto[]>;
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
