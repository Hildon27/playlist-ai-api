import { User, Privacity as PrismaPrivacity } from '../../generated/prisma';
import { UpdateUserDTO, UserResponse } from '../models/UserTypes';
import { Privacity } from '../models/Enums';
import prisma from '../lib/prisma';
import { CreateUserDTO } from '../models/users';

export class UserRepository {
  private readonly prisma = prisma;

  public async create(data: CreateUserDTO): Promise<UserResponse> {
    const user = await this.prisma.user.create({
      data: this.toModel(data),
    });

    return this.toResponse(user);
  }

  public async update(
    id: string,
    data: UpdateUserDTO
  ): Promise<UserResponse | null> {
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

  public async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toResponse(user) : null;
  }

  public async findAll(): Promise<UserResponse[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u: User) => this.toResponse(u));
  }

  private toModel(data: Partial<CreateUserDTO & UpdateUserDTO>) {
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

  private toResponse(user: User): UserResponse {
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
