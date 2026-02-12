import { PaginatedResult, PaginationParams } from '@/lib/pagination';
import { FollowRequestProcessingAction } from '@/models/Enums';
import { FollowRequestDto } from '@/models/followRequests';

export interface FollowRequestService {
  requestToFollowUser(
    followerId: string,
    followedUserEmail: string
  ): Promise<FollowRequestDto>;
  findSentFollowRequests(
    userId: string,
    params: PaginationParams<FollowRequestDto>
  ): Promise<PaginatedResult<FollowRequestDto>>;
  findReceivedFollowRequests(
    userId: string,
    params: PaginationParams<FollowRequestDto>
  ): Promise<PaginatedResult<FollowRequestDto>>;
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
