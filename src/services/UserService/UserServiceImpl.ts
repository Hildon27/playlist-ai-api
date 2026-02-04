import { UserService } from './UserService';
import { UserRepository } from '@/repositories/UserRepository';
import { ApiError, ErrorCode } from '@/models/Errors';
import { UpdateUserDTO, UserResponseDTO } from '@/models/users';
import { createLogger } from '@/lib/logger';

const logger = createLogger('UserService');

export class UserServiceImpl implements UserService {
  private readonly userRepository = new UserRepository();

  public async findById(id: string): Promise<UserResponseDTO | null> {
    if (!id || id.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const user = await this.userRepository.findById(id);
    return user;
  }

  public async findByEmail(email: string): Promise<UserResponseDTO | null> {
    if (email.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_EMAIL_INVALID);
    }

    const user = await this.userRepository.findByEmail(email);
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
    logger.info('Starting user update');

    if (!id || id.trim() === '') {
      logger.warn('User update failed: userId not provided');
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      logger.warn({ userId: id }, 'User update failed: user not found');
      throw new ApiError(ErrorCode.USER_NOT_FOUND);
    }

    if (data.email && data.email !== existingUser.email) {
      logger.debug(
        {
          userId: id,
          email: data.email,
        },
        'Checking if email is already in use'
      );
      const emailExists = await this.userRepository.findByEmail(data.email);
      if (emailExists) {
        logger.warn(
          {
            userId: id,
            email: data.email,
          },
          'User update failed: email already in use'
        );
        throw new ApiError(ErrorCode.USER_EMAIL_IN_USE);
      }
    }

    const updatedUser = await this.userRepository.update(id, data);

    logger.info(
      {
        userId: id,
        updatedFields: Object.keys(data),
      },
      'User updated successfully'
    );

    return updatedUser;
  }

  public async delete(id: string): Promise<void> {
    logger.info('Starting user deletion');

    if (!id || id.trim() === '') {
      logger.warn('User deletion failed: userId not provided');
      throw new ApiError(ErrorCode.VALIDATION_USER_ID_REQUIRED);
    }

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      logger.warn({ userId: id }, 'User deletion failed: user not found');
      throw new ApiError(ErrorCode.USER_NOT_FOUND);
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      logger.error({ userId: id }, 'User deletion failed at repository level');
      throw new ApiError(ErrorCode.USER_DELETE_FAILED);
    }

    logger.info({ userId: id }, 'User deleted successfully');
  }
}
