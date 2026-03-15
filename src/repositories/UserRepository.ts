import { User, Privacity as PrismaPrivacity } from '../../generated/prisma';
import { Privacity } from '@/models/Enums';
import prisma from '../lib/prisma';
import {
  CreateUserDTO,
  UpdateUserDTO,
  UserResponseDTO,
  UserResponseWithFollowInfoDTO,
} from '@/models/users';
import { paginate, PaginatedResult, PaginationParams } from '@/lib/pagination';

export class UserRepository {
  private readonly prisma = prisma;

  public async create(data: CreateUserDTO): Promise<UserResponseDTO> {
    const user = await this.prisma.user.create({
      data: this.toModel(data),
    });

    return this.toResponse(user);
  }

  public async update(
    id: string,
    data: UpdateUserDTO
  ): Promise<UserResponseDTO | null> {
    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: this.toModel(data),
      });

      return this.toResponse(user);
    } catch {
      return null;
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  public async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toResponse(user) : null;
  }

  /**
   * Finds a user by email and includes the password field.
   * Used only for authentication purposes.
   *
   * @param email - The user's email address
   * @returns User with password or null if not found
   */
  public async findByEmailWithPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  public async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toResponse(user) : null;
  }

  public async findAll(
    params: PaginationParams<UserResponseDTO>,
    ignoreIds?: string[],
    privacities?: Privacity[]
  ): Promise<PaginatedResult<UserResponseDTO>> {
    const where: any = {};

    if (ignoreIds && ignoreIds.length > 0) {
      where.id = { notIn: ignoreIds };
    }

    if (privacities && privacities.length > 0) {
      where.privacity = { in: privacities };
    }

    return paginate(this.prisma.user, { where }, params, this.toResponse);
  }

  public async findAllWithFollowInfo(
    params: PaginationParams<UserResponseDTO>,
    loggedUserId: string,
    ignoreIds?: string[],
    privacities?: Privacity[]
  ): Promise<PaginatedResult<UserResponseWithFollowInfoDTO>> {
    const where: any = {};

    if (ignoreIds && ignoreIds.length > 0) {
      where.id = { notIn: ignoreIds };
    }

    if (privacities && privacities.length > 0) {
      where.privacity = { in: privacities };
    }

    // Paginação normal
    const paginatedResult = await paginate(
      this.prisma.user,
      { where },
      params,
      this.toResponse
    );

    const userIds = paginatedResult.data.map(u => u.id);
    if (userIds.length === 0) {
      return { ...paginatedResult, data: [] };
    }

    // 1️⃣ Quem o usuário logado já segue
    const follows = await this.prisma.follow.findMany({
      where: {
        followerId: loggedUserId,
        followedId: { in: userIds },
      },
      select: { followedId: true },
    });
    const followedIdsSet = new Set(follows.map(f => f.followedId));

    // 2️⃣ Solicitações pendentes enviadas pelo usuário logado
    const followRequests = await this.prisma.followRequest.findMany({
      where: {
        followerId: loggedUserId,
        followedId: { in: userIds },
        status: 'pending', // status conforme schema do seu DB
      },
      select: { id: true, followedId: true },
    });
    const followRequestMap = new Map(
      followRequests.map(f => [f.followedId, f.id])
    );

    // 3️⃣ Mapear DTO
    const itemsWithFollow: UserResponseWithFollowInfoDTO[] =
      paginatedResult.data.map(user => ({
        ...user,
        followedByLoggedUser: followedIdsSet.has(user.id),
        followRequestPending: followRequestMap.has(user.id),
        followRequestId: followRequestMap.get(user.id),
      }));

    return {
      ...paginatedResult,
      data: itemsWithFollow,
    };
  }

  private toModel(data: CreateUserDTO | UpdateUserDTO) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model: any = { ...data };

    Object.keys(model).forEach(key => {
      if (model[key] === undefined) delete model[key];
    });

    if (model.privacity) {
      model.privacity = model.privacity as PrismaPrivacity;
    }

    return model;
  }

  private toResponse(user: User): UserResponseDTO {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      privacity: user.privacity as Privacity,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
