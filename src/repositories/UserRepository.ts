import { User, Privacity as PrismaPrivacity } from '../../generated/prisma';
import { Privacity } from '@/models/Enums';
import prisma from '../lib/prisma';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '@/models/users';
import {
  buildPaginatedResult,
  getPaginationOffset,
  PaginatedResult,
  PaginationParams,
} from '@/lib/pagination';

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
    params: PaginationParams<UserResponseDTO>
  ): Promise<PaginatedResult<UserResponseDTO>> {
    const { page, size, sortBy = 'createdAt', sortOrder = 'asc' } = params;

    const offset = getPaginationOffset(page, size);

    const users = await this.prisma.user.findMany({
      skip: offset,
      take: size,
      orderBy: { [sortBy]: sortOrder },
    });
    const mappedUsers = users.map((u: User) => this.toResponse(u));

    const total = await this.prisma.user.count();

    return buildPaginatedResult(mappedUsers, total, page, size);
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
