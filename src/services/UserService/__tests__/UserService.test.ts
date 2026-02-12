import { UserServiceImpl } from '../UserServiceImpl';
import { UserRepository } from '../../../repositories/UserRepository';
import { ApiError, ErrorCode } from '../../../models/Errors';
import { Privacity } from '../../../models/Enums';
import {
  createPaginatedResultMock,
  createPaginationMock,
} from '@/__tests__/mocks/pagination';
import { UserResponseDTO } from '@/models/users';

// Mock dependencies
jest.mock('../../../repositories/UserRepository');
jest.mock('../../../lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('UserService', () => {
  let userService: UserServiceImpl;
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

  const mockUser2 = {
    id: 'user-uuid-456',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@test.com',
    privacity: Privacity.PRIVATE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserServiceImpl();
    mockUserRepository = (userService as any).userRepository;
  });

  describe('findById', () => {
    it('USER-FIND-01: should return user when found', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);

      const result = await userService.findById('user-uuid-123');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findById).toHaveBeenCalledWith('user-uuid-123');
    });

    it('USER-FIND-02: should return null when user not found', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      const result = await userService.findById('non-existent-uuid');

      expect(result).toBeNull();
    });

    it('USER-FIND-03: should throw error for empty id', async () => {
      await expect(userService.findById('')).rejects.toThrow(ApiError);
      await expect(userService.findById('')).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_USER_ID_REQUIRED,
      });
    });

    it('USER-FIND-04: should throw error for whitespace-only id', async () => {
      await expect(userService.findById('   ')).rejects.toThrow(ApiError);
      await expect(userService.findById('   ')).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_USER_ID_REQUIRED,
      });
    });
  });

  describe('findByEmail', () => {
    it('USER-EMAIL-01: should return user when email exists', async () => {
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(mockUser);

      const result = await userService.findByEmail('john@test.com');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
        'john@test.com'
      );
    });

    it('USER-EMAIL-02: should return null when email not found', async () => {
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(null);

      const result = await userService.findByEmail('notfound@test.com');

      expect(result).toBeNull();
    });

    it('USER-EMAIL-03: should throw error for empty email', async () => {
      await expect(userService.findByEmail('')).rejects.toThrow(ApiError);
      await expect(userService.findByEmail('')).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_EMAIL_INVALID,
      });
    });
  });

  describe('findAll', () => {
    it('USER-ALL-01: should return all users', async () => {
      const params = createPaginationMock();

      mockUserRepository.findAll = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([mockUser, mockUser2]));

      const result = await userService.findAll(params);

      expect(result.data).toHaveLength(2);
      expect(result.data).toContainEqual(mockUser);
      expect(result.data).toContainEqual(mockUser2);
    });

    it('USER-ALL-02: should return empty array when no users exist', async () => {
      const params = createPaginationMock();

      mockUserRepository.findAll = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([]));

      const result = await userService.findAll(params);

      expect(result.data).toEqual([]);
    });
  });

  describe('update', () => {
    it('USER-UPD-01: should update user firstName', async () => {
      const updatedUser = { ...mockUser, firstName: 'Jane' };
      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await userService.update('user-uuid-123', {
        firstName: 'Jane',
      });

      expect(result?.firstName).toBe('Jane');
      expect(mockUserRepository.update).toHaveBeenCalledWith('user-uuid-123', {
        firstName: 'Jane',
      });
    });

    it('USER-UPD-02: should update email when available', async () => {
      const updatedUser = { ...mockUser, email: 'newemail@test.com' };
      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(null);
      mockUserRepository.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await userService.update('user-uuid-123', {
        email: 'newemail@test.com',
      });

      expect(result?.email).toBe('newemail@test.com');
    });

    it('USER-UPD-03: should throw error when email already in use', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.findByEmail = jest.fn().mockResolvedValue(mockUser2);

      await expect(
        userService.update('user-uuid-123', { email: 'jane@test.com' })
      ).rejects.toThrow(ApiError);
      await expect(
        userService.update('user-uuid-123', { email: 'jane@test.com' })
      ).rejects.toMatchObject({
        code: ErrorCode.USER_EMAIL_IN_USE,
      });
    });

    it('USER-UPD-04: should throw error when user not found', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(
        userService.update('non-existent', { firstName: 'Jane' })
      ).rejects.toThrow(ApiError);
      await expect(
        userService.update('non-existent', { firstName: 'Jane' })
      ).rejects.toMatchObject({
        code: ErrorCode.USER_NOT_FOUND,
      });
    });

    it('USER-UPD-05: should throw error for empty id', async () => {
      await expect(
        userService.update('', { firstName: 'Jane' })
      ).rejects.toThrow(ApiError);
      await expect(
        userService.update('', { firstName: 'Jane' })
      ).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_USER_ID_REQUIRED,
      });
    });

    it('USER-UPD-06: should update multiple fields', async () => {
      const updatedUser = { ...mockUser, firstName: 'Jane', lastName: 'Smith' };
      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.update = jest.fn().mockResolvedValue(updatedUser);

      const result = await userService.update('user-uuid-123', {
        firstName: 'Jane',
        lastName: 'Smith',
      });

      expect(result?.firstName).toBe('Jane');
      expect(result?.lastName).toBe('Smith');
    });
  });

  describe('delete', () => {
    it('USER-DEL-01: should delete existing user', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue(mockUser);
      mockUserRepository.delete = jest.fn().mockResolvedValue(true);

      await expect(userService.delete('user-uuid-123')).resolves.not.toThrow();
      expect(mockUserRepository.delete).toHaveBeenCalledWith('user-uuid-123');
    });

    it('USER-DEL-02: should throw error when user not found', async () => {
      mockUserRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(userService.delete('non-existent')).rejects.toThrow(
        ApiError
      );
      await expect(userService.delete('non-existent')).rejects.toMatchObject({
        code: ErrorCode.USER_NOT_FOUND,
      });
    });

    it('USER-DEL-03: should throw error for empty id', async () => {
      await expect(userService.delete('')).rejects.toThrow(ApiError);
      await expect(userService.delete('')).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_USER_ID_REQUIRED,
      });
    });
  });
});
