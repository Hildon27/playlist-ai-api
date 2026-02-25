import { PlaylistCommentServiceImpl } from '../PlaylistCommentServiceImpl';
import { PlaylistCommentRepository } from '../../../repositories/PlaylistCommentRepository';
import { UserPlaylistRepository } from '../../../repositories/UserPlaylistRepository';
import { NotFoundError, ForbiddenError } from '../../../models/Errors';
import { Privacity } from '../../../models/Enums';
import {
  PlaylistCommentDTO,
  PlaylistCommentWithUserDTO,
  PlaylistCommentWithUserAndPlaylistDTO,
} from '../../../models/comments';

// Mock dependencies
jest.mock('../../../repositories/PlaylistCommentRepository');
jest.mock('../../../repositories/UserPlaylistRepository');
jest.mock('../../../lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('PlaylistCommentService', () => {
  let commentService: PlaylistCommentServiceImpl;
  let mockCommentRepository: jest.Mocked<PlaylistCommentRepository>;
  let mockPlaylistRepository: jest.Mocked<UserPlaylistRepository>;

  const userId = 'user-uuid-123';
  const anotherUserId = 'another-user-456';
  const playlistId = 'playlist-uuid-789';
  const commentId = 'comment-uuid-001';

  const mockPlaylist = {
    id: playlistId,
    name: 'Test Playlist',
    privacity: Privacity.PUBLIC,
    userId,
    aiMessage: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockComment: PlaylistCommentDTO = {
    id: commentId,
    content: 'Great playlist!',
    playlistId,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCommentWithUser: PlaylistCommentWithUserDTO = {
    ...mockComment,
    user: {
      id: userId,
      firstName: 'John',
      lastName: 'Doe',
    },
  };

  const mockCommentWithUserAndPlaylist: PlaylistCommentWithUserAndPlaylistDTO =
    {
      ...mockCommentWithUser,
      playlist: {
        id: playlistId,
        name: 'Test Playlist',
      },
    };

  beforeEach(() => {
    jest.clearAllMocks();

    mockCommentRepository = {
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      isCommentOwner: jest.fn(),
      findByIdWithUser: jest.fn(),
      findByPlaylistId: jest.fn(),
      findByUserId: jest.fn(),
    } as unknown as jest.Mocked<PlaylistCommentRepository>;

    mockPlaylistRepository = {
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<UserPlaylistRepository>;

    commentService = new PlaylistCommentServiceImpl(
      mockCommentRepository,
      mockPlaylistRepository
    );
  });

  describe('createComment', () => {
    // COMMENT-CREATE-01: Criar comentário válido
    it('should create comment successfully', async () => {
      mockPlaylistRepository.findById.mockResolvedValue(mockPlaylist);
      mockCommentRepository.create.mockResolvedValue(mockComment);

      const result = await commentService.createComment(userId, playlistId, {
        content: 'Great playlist!',
      });

      expect(result).toEqual(mockComment);
      expect(mockCommentRepository.create).toHaveBeenCalledWith(
        userId,
        playlistId,
        { content: 'Great playlist!' }
      );
    });

    // COMMENT-CREATE-02: Playlist não existe
    it('should throw NotFoundError when playlist does not exist', async () => {
      mockPlaylistRepository.findById.mockResolvedValue(null);

      await expect(
        commentService.createComment(userId, 'non-existent', {
          content: 'Test',
        })
      ).rejects.toThrow(NotFoundError);
    });

    // Additional: Verify playlist check is done first
    it('should check playlist existence before creating comment', async () => {
      mockPlaylistRepository.findById.mockResolvedValue(mockPlaylist);
      mockCommentRepository.create.mockResolvedValue(mockComment);

      await commentService.createComment(userId, playlistId, {
        content: 'Test',
      });

      expect(mockPlaylistRepository.findById).toHaveBeenCalledWith(playlistId);
      expect(mockCommentRepository.create).toHaveBeenCalled();
    });
  });

  describe('updateComment', () => {
    // COMMENT-UPD-01: Atualizar próprio comentário
    it('should update own comment successfully', async () => {
      const updatedComment = { ...mockComment, content: 'Updated content' };
      mockCommentRepository.exists.mockResolvedValue(true);
      mockCommentRepository.isCommentOwner.mockResolvedValue(true);
      mockCommentRepository.update.mockResolvedValue(updatedComment);

      const result = await commentService.updateComment(userId, commentId, {
        content: 'Updated content',
      });

      expect(result).toEqual(updatedComment);
      expect(mockCommentRepository.update).toHaveBeenCalledWith(commentId, {
        content: 'Updated content',
      });
    });

    // COMMENT-UPD-02: Comentário não existe
    it('should throw NotFoundError when comment does not exist', async () => {
      mockCommentRepository.exists.mockResolvedValue(false);

      await expect(
        commentService.updateComment(userId, 'non-existent', {
          content: 'Test',
        })
      ).rejects.toThrow(NotFoundError);
    });

    // COMMENT-UPD-03: Editar comentário de outro usuário
    it('should throw ForbiddenError when editing another users comment', async () => {
      mockCommentRepository.exists.mockResolvedValue(true);
      mockCommentRepository.isCommentOwner.mockResolvedValue(false);

      await expect(
        commentService.updateComment(anotherUserId, commentId, {
          content: 'Test',
        })
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('deleteComment', () => {
    // COMMENT-DEL-01: Deletar próprio comentário
    it('should delete own comment successfully', async () => {
      mockCommentRepository.exists.mockResolvedValue(true);
      mockCommentRepository.isCommentOwner.mockResolvedValue(true);
      mockCommentRepository.delete.mockResolvedValue(true);

      const result = await commentService.deleteComment(userId, commentId);

      expect(result).toBe(true);
      expect(mockCommentRepository.delete).toHaveBeenCalledWith(commentId);
    });

    // COMMENT-DEL-02: Comentário não existe
    it('should throw NotFoundError when deleting non-existent comment', async () => {
      mockCommentRepository.exists.mockResolvedValue(false);

      await expect(
        commentService.deleteComment(userId, 'non-existent')
      ).rejects.toThrow(NotFoundError);
    });

    // COMMENT-DEL-03: Deletar comentário de outro usuário
    it('should throw ForbiddenError when deleting another users comment', async () => {
      mockCommentRepository.exists.mockResolvedValue(true);
      mockCommentRepository.isCommentOwner.mockResolvedValue(false);

      await expect(
        commentService.deleteComment(anotherUserId, commentId)
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('getCommentById', () => {
    // COMMENT-GETID-01: Buscar comentário existente
    it('should return comment when it exists', async () => {
      mockCommentRepository.findByIdWithUser.mockResolvedValue(
        mockCommentWithUser
      );

      const result = await commentService.getCommentById(commentId);

      expect(result).toEqual(mockCommentWithUser);
      expect(mockCommentRepository.findByIdWithUser).toHaveBeenCalledWith(
        commentId
      );
    });

    // COMMENT-GETID-02: Comentário não existe
    it('should return null when comment does not exist', async () => {
      mockCommentRepository.findByIdWithUser.mockResolvedValue(null);

      const result = await commentService.getCommentById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('getCommentsByPlaylistId', () => {
    const defaultParams = { page: 1, size: 10 };

    // COMMENT-PLAYLIST-01: Listar comentários de playlist existente
    it('should return comments for existing playlist', async () => {
      const mockComments = [mockCommentWithUser];
      const paginatedResult = {
        data: mockComments,
        meta: { page: 1, size: 10, total: 1, totalPages: 1 },
      };
      mockPlaylistRepository.findById.mockResolvedValue(mockPlaylist);
      mockCommentRepository.findByPlaylistId.mockResolvedValue(paginatedResult);

      const result = await commentService.getCommentsByPlaylistId(
        playlistId,
        defaultParams
      );

      expect(result.data).toEqual(mockComments);
      expect(mockCommentRepository.findByPlaylistId).toHaveBeenCalledWith(
        playlistId,
        defaultParams
      );
    });

    // COMMENT-PLAYLIST-02: Playlist sem comentários
    it('should return empty array when playlist has no comments', async () => {
      const paginatedResult = {
        data: [],
        meta: { page: 1, size: 10, total: 0, totalPages: 1 },
      };
      mockPlaylistRepository.findById.mockResolvedValue(mockPlaylist);
      mockCommentRepository.findByPlaylistId.mockResolvedValue(paginatedResult);

      const result = await commentService.getCommentsByPlaylistId(
        playlistId,
        defaultParams
      );

      expect(result.data).toEqual([]);
    });

    // COMMENT-PLAYLIST-03: Playlist não existe
    it('should throw NotFoundError when playlist does not exist', async () => {
      mockPlaylistRepository.findById.mockResolvedValue(null);

      await expect(
        commentService.getCommentsByPlaylistId('non-existent', defaultParams)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getCommentsByUserId', () => {
    const defaultParams = { page: 1, size: 10 };

    // COMMENT-USER-01: Listar comentários do usuário
    it('should return all comments by user', async () => {
      const mockComments = [mockCommentWithUserAndPlaylist];
      const paginatedResult = {
        data: mockComments,
        meta: { page: 1, size: 10, total: 1, totalPages: 1 },
      };
      mockCommentRepository.findByUserId.mockResolvedValue(paginatedResult);

      const result = await commentService.getCommentsByUserId(
        userId,
        defaultParams
      );

      expect(result.data).toEqual(mockComments);
      expect(mockCommentRepository.findByUserId).toHaveBeenCalledWith(
        userId,
        defaultParams
      );
    });

    // COMMENT-USER-02: Usuário sem comentários
    it('should return empty array when user has no comments', async () => {
      const paginatedResult = {
        data: [],
        meta: { page: 1, size: 10, total: 0, totalPages: 1 },
      };
      mockCommentRepository.findByUserId.mockResolvedValue(paginatedResult);

      const result = await commentService.getCommentsByUserId(
        userId,
        defaultParams
      );

      expect(result.data).toEqual([]);
    });
  });

  describe('isCommentOwner', () => {
    // COMMENT-OWNER-01: Usuário é dono do comentário
    it('should return true when user is comment owner', async () => {
      mockCommentRepository.isCommentOwner.mockResolvedValue(true);

      const result = await commentService.isCommentOwner(commentId, userId);

      expect(result).toBe(true);
    });

    // COMMENT-OWNER-02: Usuário não é dono do comentário
    it('should return false when user is not comment owner', async () => {
      mockCommentRepository.isCommentOwner.mockResolvedValue(false);

      const result = await commentService.isCommentOwner(
        commentId,
        anotherUserId
      );

      expect(result).toBe(false);
    });
  });
});
