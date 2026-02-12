import { AuthServiceImpl } from '../AuthServiceImpl';
import { UserRepository } from '../../../repositories/UserRepository';
import * as authUtils from '../../../utils/auth';
import { ApiError, ErrorCode } from '../../../models/Errors';
import { Privacity } from '../../../models/Enums';

// Mock dependencies
jest.mock('../../../repositories/UserRepository');
jest.mock('../../../utils/auth');
jest.mock('../../../lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('AuthService', () => {
  let authService: AuthServiceImpl;
  let mockUserRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: 'user-uuid-123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    privacity: Privacity.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserWithPassword = {
    ...mockUser,
    password: 'hashed-password-123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthServiceImpl();
    mockUserRepository = (authService as any).userRepository;
  });

  describe('register', () => {
    const createUserDTO = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@test.com',
      password: '123456',
      privacity: Privacity.PUBLIC,
    };

    it('AUTH-REG-01: should register user with valid data', async () => {
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserRepository.create = jest.fn().mockResolvedValue(mockUser);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue(
        'hashed-password'
      );

      const result = await authService.register(createUserDTO);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        createUserDTO.email
      );
      expect(authUtils.hashPassword).toHaveBeenCalledWith(
        createUserDTO.password
      );
      expect(mockUserRepository.create).toHaveBeenCalled();
    });

    it('AUTH-REG-02: should throw error when email already exists', async () => {
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);

      await expect(authService.register(createUserDTO)).rejects.toThrow(
        ApiError
      );
      await expect(authService.register(createUserDTO)).rejects.toMatchObject({
        code: ErrorCode.USER_EMAIL_IN_USE,
      });
    });

    it('AUTH-REG-03: should hash password before saving', async () => {
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserRepository.create = jest.fn().mockResolvedValue(mockUser);
      (authUtils.hashPassword as jest.Mock).mockResolvedValue(
        'hashed-password-xyz'
      );

      await authService.register(createUserDTO);

      expect(authUtils.hashPassword).toHaveBeenCalledWith('123456');
      expect(mockUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: 'hashed-password-xyz',
        })
      );
    });
  });

  describe('authenticate', () => {
    it('AUTH-LOGIN-01: should authenticate with valid credentials', async () => {
      mockUserRepository.findByEmailWithPassword = jest
        .fn()
        .mockResolvedValue(mockUserWithPassword);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (authUtils.generateToken as jest.Mock).mockReturnValue('jwt-token-123');

      const result = await authService.authenticate('john@test.com', '123456');

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token', 'jwt-token-123');
      expect(result.user.id).toBe(mockUser.id);
      expect(result.user.email).toBe(mockUser.email);
    });

    it('AUTH-LOGIN-02: should throw error for non-existent email', async () => {
      mockUserRepository.findByEmailWithPassword = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        authService.authenticate('notfound@test.com', '123456')
      ).rejects.toThrow(ApiError);
      await expect(
        authService.authenticate('notfound@test.com', '123456')
      ).rejects.toMatchObject({
        code: ErrorCode.INVALID_CREDENTIALS,
      });
    });

    it('AUTH-LOGIN-03: should throw error for invalid password', async () => {
      mockUserRepository.findByEmailWithPassword = jest
        .fn()
        .mockResolvedValue(mockUserWithPassword);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.authenticate('john@test.com', 'wrong-password')
      ).rejects.toThrow(ApiError);
      await expect(
        authService.authenticate('john@test.com', 'wrong-password')
      ).rejects.toMatchObject({
        code: ErrorCode.INVALID_CREDENTIALS,
      });
    });

    it('AUTH-LOGIN-04: should throw error for empty email', async () => {
      await expect(authService.authenticate('', '123456')).rejects.toThrow(
        ApiError
      );
      await expect(
        authService.authenticate('', '123456')
      ).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_EMAIL_INVALID,
      });
    });

    it('AUTH-LOGIN-05: should generate JWT token with correct payload', async () => {
      mockUserRepository.findByEmailWithPassword = jest
        .fn()
        .mockResolvedValue(mockUserWithPassword);
      (authUtils.comparePassword as jest.Mock).mockResolvedValue(true);
      (authUtils.generateToken as jest.Mock).mockReturnValue('jwt-token-123');

      await authService.authenticate('john@test.com', '123456');

      expect(authUtils.generateToken).toHaveBeenCalledWith(
        mockUser.id,
        mockUser.email
      );
    });
  });
});
