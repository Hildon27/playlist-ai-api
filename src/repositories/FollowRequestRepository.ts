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

  public async findById(
    followRequestId: string
  ): Promise<FollowRequestDto | null> {
    const followRequest = await this.prisma.followRequest.findFirst({
      where: {
        id: followRequestId,
      },
    });

    return followRequest ? this.toResponse(followRequest) : null;
  }

  public async findByFollowerAndFollowedId(
    followerId: string,
    followedId: string
  ): Promise<FollowRequestDto | null> {
    const followRequest = await this.prisma.followRequest.findFirst({
      where: { followerId, followedId },
      orderBy: { createdAt: 'desc' },
    });

    return followRequest ? this.toResponse(followRequest) : null;
  }

  public async findSentFollowRequests(
    userId: string
  ): Promise<FollowRequestDto[]> {
    const followRequests = await this.prisma.followRequest.findMany({
      where: { followerId: userId },
    });

    return followRequests.map(v => this.toResponse(v));
  }

  public async updateFollowRequestStatus(
    followRequestId: string,
    newStatus: FollowRequestStatus
  ): Promise<FollowRequestDto> {
    const updatedFollowRequest = await this.prisma.followRequest.update({
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
      where: {
        id: followRequestId,
      },
    });

    return this.toResponse(updatedFollowRequest);
  }

  public async findReceivedFollowRequests(
    userId: string
  ): Promise<FollowRequestDto[]> {
    const followRequests = await this.prisma.followRequest.findMany({
      where: { followedId: userId },
    });

    return followRequests.map(v => this.toResponse(v));
  }

  public async delete(followRequestId: string): Promise<void> {
    await this.prisma.followRequest.delete({
      where: {
        id: followRequestId,
      },
    });
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
