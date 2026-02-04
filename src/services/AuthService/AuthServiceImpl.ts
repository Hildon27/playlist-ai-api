import { UserRepository } from '@/repositories/UserRepository';
import { ApiError, ErrorCode } from '@/models/Errors';
import { CreateUserDTO, UserResponseDTO } from '@/models/users';
import { comparePassword, generateToken, hashPassword } from '../../utils/auth';
import { Privacity } from '@/models/Enums';
import { createLogger } from '@/lib/logger';
import { AuthResult, AuthService } from './AuthService';

const logger = createLogger('AuthService');

export class AuthServiceImpl implements AuthService {
  private readonly userRepository = new UserRepository();

  /**
   * Creates a new user with hashed password.
   *
   * @param data - User data including plain text password
   * @returns The created user without password
   * @throws ApiError if email is already in use
   */
  public async register(data: CreateUserDTO): Promise<UserResponseDTO> {
    logger.debug({ email: data.email }, 'Creating user');
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      logger.warn({ email: data.email }, 'Email already in use');
      throw new ApiError(ErrorCode.USER_EMAIL_IN_USE);
    }

    // Hash password before saving
    const hashedPassword = await hashPassword(data.password);
    const userWithHashedPassword = {
      ...data,
      password: hashedPassword,
    };

    const user = await this.userRepository.create(userWithHashedPassword);
    logger.info({ userId: user.id }, 'User created in database');
    return user;
  }

  /**
   * Authenticates a user by email and password.
   *
   * @param email - User's email address
   * @param password - User's plain text password
   * @returns AuthResult containing user data and JWT token
   * @throws ApiError if credentials are invalid
   */
  public async authenticate(
    email: string,
    password: string
  ): Promise<AuthResult> {
    logger.debug({ email }, 'Authenticating user');
    if (!email || email.trim() === '') {
      throw new ApiError(ErrorCode.VALIDATION_EMAIL_INVALID);
    }

    const user = await this.userRepository.findByEmailWithPassword(email);
    if (!user) {
      logger.warn({ email }, 'User not found for authentication');
      throw new ApiError(ErrorCode.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn({ email }, 'Invalid password attempt');
      throw new ApiError(ErrorCode.INVALID_CREDENTIALS);
    }

    const token = generateToken(user.id, user.email);
    logger.info({ userId: user.id }, 'User authenticated successfully');

    return {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        privacity: user.privacity as Privacity,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    };
  }
}
