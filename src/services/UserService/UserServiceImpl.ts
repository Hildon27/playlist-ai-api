import { UserService } from './UserService';
import { UserRepository } from '@/repositories/UserRepository';
import { ApiError, ErrorCode } from '@/models/Errors';
import { CreateUserDTO, UpdateUserDTO, UserResponseDTO } from '@/models/users';

export class UserServiceImpl implements UserService {
  private readonly userRepository = new UserRepository();

  public async create(data: CreateUserDTO): Promise<UserResponseDTO> {
    // Verificar se já existe um usuário com este email
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new ApiError(ErrorCode.USER_EMAIL_IN_USE);
    }

    // Criar o usuário
    const user = await this.userRepository.create(data);
    return user;
  }

  public async findById(id: string): Promise<UserResponseDTO | null> {
    if (!id || id.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const user = await this.userRepository.findById(id);
    return user;
  }

  public async findAll(): Promise<UserResponseDTO[]> {
    const users = await this.userRepository.findAll();
    return users;
  }

  public async update(
    id: string,
    data: UpdateUserDTO
  ): Promise<UserResponseDTO | null> {
    if (!id || id.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    // Verificar se o usuário existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new ApiError(ErrorCode.USER_NOT_FOUND);
    }

    // Se estiver atualizando o email, verificar se não está sendo usado por outro usuário
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepository.findByEmail(data.email);
      if (emailExists) {
        throw new ApiError(ErrorCode.USER_EMAIL_IN_USE);
      }
    }

    // Atualizar o usuário
    const updatedUser = await this.userRepository.update(id, data);
    return updatedUser;
  }

  public async delete(id: string): Promise<void> {
    if (!id || id.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    // Verificar se o usuário existe
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new ApiError(ErrorCode.USER_NOT_FOUND);
    }

    // Deletar o usuário
    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new ApiError(ErrorCode.USER_DELETE_FAILED);
    }
  }
}
