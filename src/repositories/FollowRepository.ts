import { paginate, PaginatedResult, PaginationParams } from '@/lib/pagination';
import prisma from '../lib/prisma';
import { FollowDto } from '@/models/follows';

export class FollowRepository {
  private readonly prisma = prisma;

  public async create(
    followerId: string,
    followedId: string
  ): Promise<FollowDto> {
    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followedId,
      },
      include: {
        follower: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        followed: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return follow;
  }

  public async findById(followId: string): Promise<FollowDto | null> {
    const follow = await this.prisma.follow.findFirst({
      where: {
        id: followId,
      },
      include: {
        follower: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        followed: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return follow ?? null;
  }

  public async findByFollowerAndFollowedId(
    followerId: string,
    followedId: string
  ): Promise<FollowDto | null> {
    const follow = await this.prisma.follow.findFirst({
      where: {
        followerId,
        followedId,
      },
      include: {
        follower: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        followed: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    return follow ?? null;
  }

  public async findAllByFollowedId(
    followedId: string,
    params: PaginationParams<FollowDto>
  ): Promise<PaginatedResult<FollowDto>> {
    return paginate(
      this.prisma.follow,
      {
        where: { followedId },
        include: {
          follower: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          followed: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
      params
    );
  }

  public async findAllByFollowerId(
    followerId: string,
    params: PaginationParams<FollowDto>
  ): Promise<PaginatedResult<FollowDto>> {
    return paginate(
      this.prisma.follow,
      {
        where: { followerId },
        include: {
          follower: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          followed: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
      params
    );
  }

  public async delete(followId: string): Promise<void> {
    await this.prisma.follow.delete({
      where: {
        id: followId,
      },
    });
  }
}
