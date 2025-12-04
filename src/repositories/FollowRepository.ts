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

  public async findAllByFollowedId(followedId: string): Promise<FollowDto[]> {
    return await this.prisma.follow.findMany({
      where: {
        followedId,
      },
    });
  }
}
