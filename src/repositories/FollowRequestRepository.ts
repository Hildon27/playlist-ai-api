import { FollowRequestDto } from '@/models/followRequests';
import prisma from '../lib/prisma';
import { FollowRequest } from '../../generated/prisma';
import { FollowRequestStatus } from '@/models/Enums';

export class FollowRequestRepository {
  private readonly prisma = prisma;

  public async create(
    followerId: string,
    followedId: string
  ): Promise<FollowRequestDto> {
    const followRequest = await this.prisma.followRequest.create({
      data: {
        followerId,
        followedId,
        status: FollowRequestStatus.PENDING,
      },
    });

    return this.toResponse(followRequest);
  }

  public async findByFollowerAndFollowedId(
    followerId: string,
    followedId: string
  ): Promise<FollowRequestDto | null> {
    const followRequest = await this.prisma.followRequest.findFirst({
      where: { followerId, followedId },
    });

    return followRequest ? this.toResponse(followRequest) : null;
  }

  private toResponse(followRequest: FollowRequest): FollowRequestDto {
    return {
      id: followRequest.id,
      followerId: followRequest.followerId,
      followedId: followRequest.followedId,
      status: followRequest.status as FollowRequestStatus,
      createdAt: followRequest.createdAt,
      updatedAt: followRequest.updatedAt,
    };
  }
}
