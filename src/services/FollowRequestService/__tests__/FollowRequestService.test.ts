import { FollowRequestServiceImpl } from '../FollowRequestServiceImpl';
import { FollowRequestRepository } from '../../../repositories/FollowRequestRepository';
import { FollowServiceImpl } from '../../Follow/FollowServiceImpl';
import { UserServiceImpl } from '../../UserService/UserServiceImpl';
import { ApiError, ErrorCode } from '../../../models/Errors';
import {
  Privacity,
  FollowRequestStatus,
  FollowRequestProcessingAction,
} from '../../../models/Enums';
import { FollowRequestDto } from '../../../models/followRequests';

// Mock dependencies
jest.mock('../../../repositories/FollowRequestRepository');
jest.mock('../../Follow/FollowServiceImpl');
jest.mock('../../UserService/UserServiceImpl');
jest.mock('../../../lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('FollowRequestService', () => {
  let followRequestService: FollowRequestServiceImpl;
  let mockFollowRequestRepository: jest.Mocked<FollowRequestRepository>;
  let mockFollowService: jest.Mocked<FollowServiceImpl>;
  let mockUserService: jest.Mocked<UserServiceImpl>;

  const followerId = 'follower-uuid-123';
  const followedId = 'followed-uuid-456';
  const followRequestId = 'request-uuid-789';

  const mockFollowed = {
    id: followedId,
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@test.com',
    privacity: Privacity.PUBLIC,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrivateUser = {
    ...mockFollowed,
    privacity: Privacity.PRIVATE,
  };

  const mockFollowRequest: FollowRequestDto = {
    id: followRequestId,
    followerId,
    followedId,
    status: FollowRequestStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockFollowRequestRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByFollowerAndFollowedId: jest.fn(),
      findSentFollowRequests: jest.fn(),
      findReceivedFollowRequests: jest.fn(),
      delete: jest.fn(),
      updateFollowRequestStatus: jest.fn(),
    } as unknown as jest.Mocked<FollowRequestRepository>;

    mockFollowService = {
      create: jest.fn(),
      findByFollowerAndFollowedId: jest.fn(),
      findAllUserFollowers: jest.fn(),
      deleteFollowByFollowerAndFollowedId: jest.fn(),
    } as unknown as jest.Mocked<FollowServiceImpl>;

    mockUserService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserServiceImpl>;

    (FollowRequestRepository as jest.Mock).mockImplementation(
      () => mockFollowRequestRepository
    );
    (FollowServiceImpl as jest.Mock).mockImplementation(
      () => mockFollowService
    );
    (UserServiceImpl as jest.Mock).mockImplementation(() => mockUserService);

    followRequestService = new FollowRequestServiceImpl();
  });

  describe('requestToFollowUser', () => {
    // FR-CREATE-01: Criar request para usuário público
    it('should create follow request for public user', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockFollowed);
      mockFollowService.findByFollowerAndFollowedId.mockResolvedValue(null);
      mockFollowRequestRepository.findByFollowerAndFollowedId.mockResolvedValue(
        null
      );
      mockFollowRequestRepository.create.mockResolvedValue(mockFollowRequest);

      const result = await followRequestService.requestToFollowUser(
        followerId,
        'jane@test.com'
      );

      expect(result).toEqual(mockFollowRequest);
      expect(result.status).toBe(FollowRequestStatus.PENDING);
      expect(mockFollowRequestRepository.create).toHaveBeenCalledWith(
        followerId,
        followedId
      );
    });

    // FR-CREATE-02: Usuário destino não encontrado
    it('should throw error when followed user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        followRequestService.requestToFollowUser(
          followerId,
          'notfound@test.com'
        )
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.requestToFollowUser(
          followerId,
          'notfound@test.com'
        )
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_REQUEST_PUBLIC_FOLLOWED_USER_NOT_FOUND,
      });
    });

    // FR-CREATE-03: Usuário destino é privado
    it('should throw error when followed user is private', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockPrivateUser);

      await expect(
        followRequestService.requestToFollowUser(followerId, 'jane@test.com')
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.requestToFollowUser(followerId, 'jane@test.com')
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_REQUEST_PUBLIC_FOLLOWED_USER_NOT_FOUND,
      });
    });

    // FR-CREATE-04: Tentar seguir a si mesmo
    it('should throw error when trying to follow yourself', async () => {
      const selfUser = { ...mockFollowed, id: followerId };
      mockUserService.findByEmail.mockResolvedValue(selfUser);

      await expect(
        followRequestService.requestToFollowUser(followerId, 'jane@test.com')
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.requestToFollowUser(followerId, 'jane@test.com')
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOWER_ID_AND_FOLLOWED_ID_CAN_NOT_BE_EQUALS,
      });
    });

    // FR-CREATE-05: Já está seguindo
    it('should throw error when already following', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockFollowed);
      mockFollowService.findByFollowerAndFollowedId.mockResolvedValue({
        id: 'follow-id',
        followerId,
        followedId,
        createdAt: new Date(),
      });

      await expect(
        followRequestService.requestToFollowUser(followerId, 'jane@test.com')
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.requestToFollowUser(followerId, 'jane@test.com')
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_ALREADY_EXISTS,
      });
    });

    // FR-CREATE-06: Request já pendente
    it('should throw error when request already pending', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockFollowed);
      mockFollowService.findByFollowerAndFollowedId.mockResolvedValue(null);
      mockFollowRequestRepository.findByFollowerAndFollowedId.mockResolvedValue(
        mockFollowRequest
      );

      await expect(
        followRequestService.requestToFollowUser(followerId, 'jane@test.com')
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.requestToFollowUser(followerId, 'jane@test.com')
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_REQUEST_ALREADY_EXISTS,
      });
    });
  });

  describe('findSentFollowRequests', () => {
    // FR-SENT-01: Usuário com requests enviados
    it('should return sent follow requests', async () => {
      const mockRequests = [mockFollowRequest];
      mockFollowRequestRepository.findSentFollowRequests.mockResolvedValue(
        mockRequests
      );

      const result =
        await followRequestService.findSentFollowRequests(followerId);

      expect(result).toEqual(mockRequests);
      expect(
        mockFollowRequestRepository.findSentFollowRequests
      ).toHaveBeenCalledWith(followerId);
    });

    // FR-SENT-02: Usuário sem requests enviados
    it('should return empty array when no sent requests', async () => {
      mockFollowRequestRepository.findSentFollowRequests.mockResolvedValue([]);

      const result =
        await followRequestService.findSentFollowRequests(followerId);

      expect(result).toEqual([]);
    });
  });

  describe('findReceivedFollowRequests', () => {
    // FR-RECV-01: Usuário com requests recebidos
    it('should return received follow requests', async () => {
      const mockRequests = [mockFollowRequest];
      mockFollowRequestRepository.findReceivedFollowRequests.mockResolvedValue(
        mockRequests
      );

      const result =
        await followRequestService.findReceivedFollowRequests(followedId);

      expect(result).toEqual(mockRequests);
      expect(
        mockFollowRequestRepository.findReceivedFollowRequests
      ).toHaveBeenCalledWith(followedId);
    });

    // FR-RECV-02: Usuário sem requests recebidos
    it('should return empty array when no received requests', async () => {
      mockFollowRequestRepository.findReceivedFollowRequests.mockResolvedValue(
        []
      );

      const result =
        await followRequestService.findReceivedFollowRequests(followedId);

      expect(result).toEqual([]);
    });
  });

  describe('cancelFollowRequest', () => {
    // FR-CANCEL-01: Cancelar request próprio pendente
    it('should cancel own pending request', async () => {
      mockFollowRequestRepository.findById.mockResolvedValue(mockFollowRequest);
      mockFollowRequestRepository.delete.mockResolvedValue(undefined);

      await followRequestService.cancelFollowRequest(
        followRequestId,
        followerId
      );

      expect(mockFollowRequestRepository.delete).toHaveBeenCalledWith(
        followRequestId
      );
    });

    // FR-CANCEL-02: Cancelar request de outro usuário
    it('should throw error when canceling another users request', async () => {
      mockFollowRequestRepository.findById.mockResolvedValue(mockFollowRequest);

      await expect(
        followRequestService.cancelFollowRequest(
          followRequestId,
          'another-user-id'
        )
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.cancelFollowRequest(
          followRequestId,
          'another-user-id'
        )
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_REQUEST_NOT_FOUND,
      });
    });

    // FR-CANCEL-03: Cancelar request já processado
    it('should throw error when request is not pending', async () => {
      const approvedRequest = {
        ...mockFollowRequest,
        status: FollowRequestStatus.APPROVED,
      };
      mockFollowRequestRepository.findById.mockResolvedValue(approvedRequest);

      await expect(
        followRequestService.cancelFollowRequest(followRequestId, followerId)
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.cancelFollowRequest(followRequestId, followerId)
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_REQUEST_NOT_PENDING,
      });
    });

    // Additional: Request not found
    it('should throw error when request not found', async () => {
      mockFollowRequestRepository.findById.mockResolvedValue(null);

      await expect(
        followRequestService.cancelFollowRequest(followRequestId, followerId)
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.cancelFollowRequest(followRequestId, followerId)
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_REQUEST_NOT_FOUND,
      });
    });
  });

  describe('processFollowRequest', () => {
    // FR-PROC-01: Aceitar request pendente
    it('should accept pending request and create follow', async () => {
      const approvedRequest = {
        ...mockFollowRequest,
        status: FollowRequestStatus.APPROVED,
      };
      mockFollowRequestRepository.findById.mockResolvedValue(mockFollowRequest);
      mockFollowRequestRepository.updateFollowRequestStatus.mockResolvedValue(
        approvedRequest
      );
      mockFollowService.create.mockResolvedValue({
        id: 'follow-id',
        followerId,
        followedId,
        createdAt: new Date(),
      });

      const result = await followRequestService.processFollowRequest(
        followRequestId,
        followedId,
        FollowRequestProcessingAction.ACCEPT
      );

      expect(result.status).toBe(FollowRequestStatus.APPROVED);
      expect(mockFollowService.create).toHaveBeenCalledWith(
        followerId,
        followedId
      );
    });

    // FR-PROC-02: Rejeitar request pendente
    it('should reject pending request', async () => {
      const rejectedRequest = {
        ...mockFollowRequest,
        status: FollowRequestStatus.REJECTED,
      };
      mockFollowRequestRepository.findById.mockResolvedValue(mockFollowRequest);
      mockFollowRequestRepository.updateFollowRequestStatus.mockResolvedValue(
        rejectedRequest
      );

      const result = await followRequestService.processFollowRequest(
        followRequestId,
        followedId,
        FollowRequestProcessingAction.REJECT
      );

      expect(result.status).toBe(FollowRequestStatus.REJECTED);
      expect(mockFollowService.create).not.toHaveBeenCalled();
    });

    // FR-PROC-03: Processar request de outro usuário
    it('should throw error when processing request not owned by user', async () => {
      mockFollowRequestRepository.findById.mockResolvedValue(mockFollowRequest);

      await expect(
        followRequestService.processFollowRequest(
          followRequestId,
          'wrong-user-id',
          FollowRequestProcessingAction.ACCEPT
        )
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.processFollowRequest(
          followRequestId,
          'wrong-user-id',
          FollowRequestProcessingAction.ACCEPT
        )
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_REQUEST_NOT_FOUND,
      });
    });

    // FR-PROC-04: Processar request já processado
    it('should throw error when request is already processed', async () => {
      const approvedRequest = {
        ...mockFollowRequest,
        status: FollowRequestStatus.APPROVED,
      };
      mockFollowRequestRepository.findById.mockResolvedValue(approvedRequest);

      await expect(
        followRequestService.processFollowRequest(
          followRequestId,
          followedId,
          FollowRequestProcessingAction.ACCEPT
        )
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.processFollowRequest(
          followRequestId,
          followedId,
          FollowRequestProcessingAction.ACCEPT
        )
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_REQUEST_NOT_PENDING,
      });
    });

    // FR-PROC-05: Aceitar cria relacionamento Follow
    it('should create follow relationship when accepting', async () => {
      mockFollowRequestRepository.findById.mockResolvedValue(mockFollowRequest);
      mockFollowRequestRepository.updateFollowRequestStatus.mockResolvedValue({
        ...mockFollowRequest,
        status: FollowRequestStatus.APPROVED,
      });

      await followRequestService.processFollowRequest(
        followRequestId,
        followedId,
        FollowRequestProcessingAction.ACCEPT
      );

      expect(mockFollowService.create).toHaveBeenCalledWith(
        followerId,
        followedId
      );
    });

    // Additional: Request not found
    it('should throw error when request not found', async () => {
      mockFollowRequestRepository.findById.mockResolvedValue(null);

      await expect(
        followRequestService.processFollowRequest(
          followRequestId,
          followedId,
          FollowRequestProcessingAction.ACCEPT
        )
      ).rejects.toThrow(ApiError);

      await expect(
        followRequestService.processFollowRequest(
          followRequestId,
          followedId,
          FollowRequestProcessingAction.ACCEPT
        )
      ).rejects.toMatchObject({
        code: ErrorCode.FOLLOW_REQUEST_NOT_FOUND,
      });
    });
  });
});
