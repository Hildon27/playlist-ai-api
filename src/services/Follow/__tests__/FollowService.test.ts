import { FollowServiceImpl } from '../FollowServiceImpl';
import { FollowRepository } from '../../../repositories/FollowRepository';
import { UserServiceImpl } from '../../UserService/UserServiceImpl';
import { ApiError, ErrorCode } from '../../../models/Errors';
import { Privacity } from '../../../models/Enums';
import {
  createPaginatedResultMock,
  createPaginationMock,
} from '@/__tests__/mocks/pagination';

// Mock dependencies
jest.mock('../../../repositories/FollowRepository');
jest.mock('../../UserService/UserServiceImpl');
jest.mock('../../../lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('FollowService', () => {
  let followService: FollowServiceImpl;
  let mockFollowRepository: jest.Mocked<FollowRepository>;
  let mockUserService: jest.Mocked<UserServiceImpl>;

  const followerId = 'follower-uuid-123';
  const followedId = 'followed-uuid-456';

  const mockFollower = {
    id: followerId,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@test.com',
    privacity: Privacity.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFollowed = {
    id: followedId,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@test.com',
    privacity: Privacity.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFollow = {
    id: 'follow-uuid-789',
    followerId,
    followedId,
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    followService = new FollowServiceImpl();
    mockFollowRepository = (followService as any).followRepository;
    mockUserService = (followService as any).userService;
  });

  describe('create', () => {
    it('FOLLOW-CREATE-01: should create follow with valid users', async () => {
      mockUserService.findById = jest
        .fn()
        .mockResolvedValueOnce(mockFollower)
        .mockResolvedValueOnce(mockFollowed);
      mockFollowRepository.create = jest.fn().mockResolvedValue(mockFollow);

      const result = await followService.create(followerId, followedId);

      expect(result).toEqual(mockFollow);
      expect(mockUserService.findById).toHaveBeenCalledWith(followerId);
      expect(mockUserService.findById).toHaveBeenCalledWith(followedId);
      expect(mockFollowRepository.create).toHaveBeenCalledWith(
        followerId,
        followedId
      );
    });

    it('FOLLOW-CREATE-02: should throw error when follower not found', async () => {
      mockUserService.findById = jest.fn().mockResolvedValue(null);

      await expect(
        followService.create('non-existent', followedId)
      ).rejects.toThrow(ApiError);
      await expect(
        followService.create('non-existent', followedId)
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOWER_NOT_FOUND,
      });
    });

    it('FOLLOW-CREATE-03: should throw error when followed not found', async () => {
      mockUserService.findById = jest
        .fn()
        .mockResolvedValueOnce(mockFollower) // first call for toThrow
        .mockResolvedValueOnce(null) // second call for toThrow
        .mockResolvedValueOnce(mockFollower) // first call for toMatchObject
        .mockResolvedValueOnce(null); // second call for toMatchObject

      await expect(
        followService.create(followerId, 'non-existent')
      ).rejects.toThrow(ApiError);
      await expect(
        followService.create(followerId, 'non-existent')
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOWED_NOT_FOUND,
      });
    });
  });

  describe('findAllUserFollowers', () => {
    it('FOLLOW-LIST-01: should return followers when user has them', async () => {
      const params = createPaginationMock();

      mockFollowRepository.findAllByFollowedId = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([mockFollow]));

      const result = await followService.findAllUserFollowers(
        followedId,
        params
      );

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(mockFollow);
      expect(mockFollowRepository.findAllByFollowedId).toHaveBeenCalledWith(
        followedId,
        params
      );
    });

    it('FOLLOW-LIST-02: should return empty array when user has no followers', async () => {
      const params = createPaginationMock();

      mockFollowRepository.findAllByFollowedId = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([]));

      const result = await followService.findAllUserFollowers(
        followedId,
        params
      );

      expect(result.data).toEqual([]);
    });
  });

  describe('findByFollowerAndFollowedId', () => {
    it('should return follow when exists', async () => {
      mockFollowRepository.findByFollowerAndFollowedId = jest
        .fn()
        .mockResolvedValue(mockFollow);

      const result = await followService.findByFollowerAndFollowedId(
        followerId,
        followedId
      );

      expect(result).toEqual(mockFollow);
    });

    it('should return null when follow does not exist', async () => {
      mockFollowRepository.findByFollowerAndFollowedId = jest
        .fn()
        .mockResolvedValue(null);

      const result = await followService.findByFollowerAndFollowedId(
        followerId,
        followedId
      );

      expect(result).toBeNull();
    });
  });

  describe('findAllUserFolloweds', () => {
    it('should return users the user is following', async () => {
      const params = createPaginationMock();

      mockFollowRepository.findAllByFollowerId = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([mockFollow]));

      const result = await followService.findAllUserFolloweds(
        followerId,
        params
      );

      expect(result.data).toHaveLength(1);
      expect(mockFollowRepository.findAllByFollowerId).toHaveBeenCalledWith(
        followerId,
        params
      );
    });

    it('should return empty array when user follows no one', async () => {
      const params = createPaginationMock();

      mockFollowRepository.findAllByFollowerId = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([]));

      const result = await followService.findAllUserFolloweds(
        followerId,
        params
      );

      expect(result.data).toEqual([]);
    });
  });

  describe('deleteFollowByFollowerAndFollowedId', () => {
    it('FOLLOW-DEL-01: should delete existing follow', async () => {
      mockFollowRepository.findByFollowerAndFollowedId = jest
        .fn()
        .mockResolvedValue(mockFollow);
      mockFollowRepository.delete = jest.fn().mockResolvedValue(undefined);

      await expect(
        followService.deleteFollowByFollowerAndFollowedId(
          followerId,
          followedId
        )
      ).resolves.not.toThrow();

      expect(mockFollowRepository.delete).toHaveBeenCalledWith(mockFollow.id);
    });

    it('FOLLOW-DEL-02: should throw error when follow not found', async () => {
      mockFollowRepository.findByFollowerAndFollowedId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        followService.deleteFollowByFollowerAndFollowedId(
          followerId,
          followedId
        )
      ).rejects.toThrow(ApiError);
      await expect(
        followService.deleteFollowByFollowerAndFollowedId(
          followerId,
          followedId
        )
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_NOT_FOUND,
      });
    });
  });
});
