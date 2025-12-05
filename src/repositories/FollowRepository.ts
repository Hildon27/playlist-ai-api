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
    });

    return follow;
  }

  public async findById(followId: string): Promise<FollowDto | null> {
    const follow = await this.prisma.follow.findFirst({
      where: {
        id: followId,
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
    });

    return follow ?? null;
  }

  public async findAllByFollowedId(followedId: string): Promise<FollowDto[]> {
    return await this.prisma.follow.findMany({
      where: {
        followedId,
      },
    });
  }

  public async delete(followId: string): Promise<void> {
    await this.prisma.follow.delete({
      where: {
        id: followId,
      },
    });
  }
}
