import { UserPlaylistServiceImpl } from '../UserPlaylistServiceImpl';
import { UserPlaylistRepository } from '../../../repositories/UserPlaylistRepository';
import { BadRequestError, NotFoundError } from '../../../models/Errors';
import { Privacity } from '../../../models/Enums';
import {
  createPaginatedResultMock,
  createPaginationMock,
} from '@/__tests__/mocks/pagination';

// Mock dependencies
jest.mock('../../../repositories/UserPlaylistRepository');
jest.mock('../../../lib/logger', () => ({
  createLogger: () => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }),
}));

describe('UserPlaylistService', () => {
  let playlistService: UserPlaylistServiceImpl;
  let mockPlaylistRepository: jest.Mocked<UserPlaylistRepository>;

  const userId = 'user-uuid-123';
  const playlistId = 'playlist-uuid-456';

  const mockPlaylist = {
    id: playlistId,
    name: 'My Playlist',
    privacity: Privacity.PUBLIC,
    aiMessage: null,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrivatePlaylist = {
    ...mockPlaylist,
    id: 'playlist-private-789',
    name: 'Private Playlist',
    privacity: Privacity.PRIVATE,
  };

  const mockPlaylistWithMusics = {
    ...mockPlaylist,
    musics: [
      {
        id: 'music-1',
        externalId: 'spotify-123',
        albumCover: 'https://example.com/cover1.jpg',
        createdAt: new Date(),
      },
      {
        id: 'music-2',
        externalId: 'spotify-456',
        albumCover: 'https://example.com/cover2.jpg',
        createdAt: new Date(),
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPlaylistRepository =
      new UserPlaylistRepository() as jest.Mocked<UserPlaylistRepository>;

    mockPlaylistRepository.findCoverTrackIdsByPlaylistId = jest
      .fn()
      .mockResolvedValue([]);
    mockPlaylistRepository.findCoverTrackIdsByPlaylistIds = jest
      .fn()
      .mockResolvedValue({});

    playlistService = new UserPlaylistServiceImpl(mockPlaylistRepository);
  });

  describe('createPlaylist', () => {
    it('PLAYLIST-CREATE-01: should create public playlist', async () => {
      mockPlaylistRepository.create = jest.fn().mockResolvedValue(mockPlaylist);

      const result = await playlistService.createPlaylist(userId, {
        name: 'My Playlist',
        privacity: Privacity.PUBLIC,
      });

      expect(result).toEqual(mockPlaylist);
      expect(mockPlaylistRepository.create).toHaveBeenCalledWith(userId, {
        name: 'My Playlist',
        privacity: Privacity.PUBLIC,
      });
    });

    it('PLAYLIST-CREATE-02: should create private playlist', async () => {
      const privatePlaylist = { ...mockPlaylist, privacity: Privacity.PRIVATE };
      mockPlaylistRepository.create = jest
        .fn()
        .mockResolvedValue(privatePlaylist);

      const result = await playlistService.createPlaylist(userId, {
        name: 'Private',
        privacity: Privacity.PRIVATE,
      });

      expect(result.privacity).toBe(Privacity.PRIVATE);
    });

    it('PLAYLIST-CREATE-03: should create playlist with aiMessage', async () => {
      const playlistWithAi = {
        ...mockPlaylist,
        aiMessage: 'Based on your taste...',
      };
      mockPlaylistRepository.create = jest
        .fn()
        .mockResolvedValue(playlistWithAi);

      const result = await playlistService.createPlaylist(userId, {
        name: 'AI Playlist',
        privacity: Privacity.PUBLIC,
        aiMessage: 'Based on your taste...',
      });

      expect(result.aiMessage).toBe('Based on your taste...');
    });
  });

  describe('updatePlaylist', () => {
    it('PLAYLIST-UPD-01: should update playlist name', async () => {
      const updated = { ...mockPlaylist, name: 'New Name' };
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.update = jest.fn().mockResolvedValue(updated);

      const result = await playlistService.updatePlaylist(userId, playlistId, {
        name: 'New Name',
      });

      expect(result?.name).toBe('New Name');
    });

    it('PLAYLIST-UPD-02: should update playlist privacity', async () => {
      const updated = { ...mockPlaylist, privacity: Privacity.PRIVATE };
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.update = jest.fn().mockResolvedValue(updated);

      const result = await playlistService.updatePlaylist(userId, playlistId, {
        privacity: Privacity.PRIVATE,
      });

      expect(result?.privacity).toBe(Privacity.PRIVATE);
    });

    it('PLAYLIST-UPD-03: should throw NotFoundError for non-existent playlist', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.updatePlaylist(userId, 'non-existent', {
          name: 'New Name',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('PLAYLIST-UPD-04: should throw NotFoundError for playlist of another user', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.updatePlaylist('other-user', playlistId, {
          name: 'New Name',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('deletePlaylist', () => {
    it('PLAYLIST-DEL-01: should delete existing playlist', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.delete = jest.fn().mockResolvedValue(true);

      const result = await playlistService.deletePlaylist(userId, playlistId);

      expect(result).toBe(true);
      expect(mockPlaylistRepository.delete).toHaveBeenCalledWith(playlistId);
    });

    it('PLAYLIST-DEL-02: should throw NotFoundError for non-existent playlist', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.deletePlaylist(userId, 'non-existent')
      ).rejects.toThrow(NotFoundError);
    });

    it('PLAYLIST-DEL-03: should throw NotFoundError for playlist of another user', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.deletePlaylist('other-user', playlistId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPlaylistById', () => {
    it('PLAYLIST-GET-01: should return playlist when found', async () => {
      mockPlaylistRepository.findById = jest
        .fn()
        .mockResolvedValue(mockPlaylist);

      const result = await playlistService.getPlaylistById(userId, playlistId);

      expect(result).toEqual({ ...mockPlaylist, coverImages: [] });
    });

    it('PLAYLIST-GET-02: should throw NotFoundError for non-existent playlist', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.getPlaylistById(userId, 'non-existent')
      ).rejects.toThrow(NotFoundError);
    });

    it('PLAYLIST-GET-03: should throw NotFoundError for playlist of another user', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.getPlaylistById('other-user', playlistId)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPlaylistWithMusics', () => {
    it('PLAYLIST-MUSICS-01: should return playlist with musics', async () => {
      mockPlaylistRepository.findByIdWithMusics = jest
        .fn()
        .mockResolvedValue(mockPlaylistWithMusics);

      const result = await playlistService.getPlaylistWithMusics(
        userId,
        playlistId
      );

      expect(result).toEqual({
        ...mockPlaylistWithMusics,
        coverImages: [
          'https://example.com/cover1.jpg',
          'https://example.com/cover2.jpg',
        ],
      });
      expect(result?.musics).toHaveLength(2);
    });

    it('PLAYLIST-MUSICS-02: should return playlist with empty musics array', async () => {
      const emptyPlaylist = { ...mockPlaylist, musics: [] };
      mockPlaylistRepository.findByIdWithMusics = jest
        .fn()
        .mockResolvedValue(emptyPlaylist);

      const result = await playlistService.getPlaylistWithMusics(
        userId,
        playlistId
      );

      expect(result?.musics).toEqual([]);
    });

    it('PLAYLIST-MUSICS-03: should throw NotFoundError for non-existent playlist', async () => {
      mockPlaylistRepository.findByIdWithMusics = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.getPlaylistWithMusics(userId, 'non-existent')
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPlaylistsByUserId', () => {
    it('PLAYLIST-USER-01: should return user playlists', async () => {
      const params = createPaginationMock();

      mockPlaylistRepository.findByUserId = jest
        .fn()
        .mockResolvedValue(
          createPaginatedResultMock([mockPlaylist, mockPrivatePlaylist])
        );

      const result = await playlistService.getPlaylistsByUserId(userId, params);

      expect(result.data).toHaveLength(2);
      expect(result.meta.page).toBe(1);
    });

    it('PLAYLIST-USER-02: should return empty array when user has no playlists', async () => {
      const params = createPaginationMock();

      mockPlaylistRepository.findByUserId = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([]));

      const result = await playlistService.getPlaylistsByUserId(userId, params);

      expect(result.data).toEqual([]);
    });
  });

  describe('getPublicPlaylists', () => {
    it('PLAYLIST-PUBLIC-01: should return public playlists', async () => {
      const params = createPaginationMock();

      mockPlaylistRepository.findPublicPlaylists = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([mockPlaylist]));

      const result = await playlistService.getPublicPlaylists(params);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.privacity).toBe(Privacity.PUBLIC);
      expect(result.meta.page).toBe(1);
    });

    it('PLAYLIST-PUBLIC-02: should return empty array when no public playlists', async () => {
      const params = createPaginationMock();

      mockPlaylistRepository.findPublicPlaylists = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([]));

      const result = await playlistService.getPublicPlaylists(params);

      expect(result.data).toEqual([]);
    });
  });

  describe('addMusicToPlaylist', () => {
    it('PLAYLIST-ADD-01: should add new music to playlist', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.addMusicToPlaylist = jest
        .fn()
        .mockResolvedValue(true);

      const result = await playlistService.addMusicToPlaylist(
        userId,
        playlistId,
        {
          externalId: 'spotify-id-123',
        }
      );

      expect(result).toBe(true);
    });

    it('PLAYLIST-ADD-02: should throw BadRequestError for duplicate music', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.addMusicToPlaylist = jest
        .fn()
        .mockResolvedValue(false);

      await expect(
        playlistService.addMusicToPlaylist(userId, playlistId, {
          externalId: 'spotify-id-123',
        })
      ).rejects.toThrow(BadRequestError);
    });

    it('PLAYLIST-ADD-03: should throw NotFoundError for non-existent playlist', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.addMusicToPlaylist(userId, 'non-existent', {
          externalId: 'spotify-id-123',
        })
      ).rejects.toThrow(NotFoundError);
    });

    it('PLAYLIST-ADD-04: should throw NotFoundError for playlist of another user', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.addMusicToPlaylist('other-user', playlistId, {
          externalId: 'spotify-id-123',
        })
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('removeMusicFromPlaylist', () => {
    it('PLAYLIST-REM-01: should remove existing music', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.removeMusicFromPlaylist = jest
        .fn()
        .mockResolvedValue(true);

      const result = await playlistService.removeMusicFromPlaylist(
        userId,
        playlistId,
        'music-1'
      );

      expect(result).toBe(true);
    });

    it('PLAYLIST-REM-02: should throw BadRequestError for non-existent music', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.removeMusicFromPlaylist = jest
        .fn()
        .mockResolvedValue(false);

      await expect(
        playlistService.removeMusicFromPlaylist(
          userId,
          playlistId,
          'non-existent-music'
        )
      ).rejects.toThrow(BadRequestError);
    });

    it('PLAYLIST-REM-03: should throw NotFoundError for non-existent playlist', async () => {
      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.removeMusicFromPlaylist(
          userId,
          'non-existent',
          'music-1'
        )
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPlaylistMusics', () => {
    it('PLAYLIST-GETM-01: should return playlist musics', async () => {
      const params = createPaginationMock();

      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.getPlaylistMusics = jest
        .fn()
        .mockResolvedValue(
          createPaginatedResultMock(mockPlaylistWithMusics.musics)
        );

      const result = await playlistService.getPlaylistMusics(
        userId,
        playlistId,
        params
      );

      expect(result.data).toHaveLength(2);
    });

    it('PLAYLIST-GETM-02: should return empty array for empty playlist', async () => {
      const params = createPaginationMock();

      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(mockPlaylist);
      mockPlaylistRepository.getPlaylistMusics = jest
        .fn()
        .mockResolvedValue(createPaginatedResultMock([]));

      const result = await playlistService.getPlaylistMusics(
        userId,
        playlistId,
        params
      );

      expect(result.data).toEqual([]);
    });

    it('PLAYLIST-GETM-03: should throw NotFoundError for non-existent playlist', async () => {
      const params = createPaginationMock();

      mockPlaylistRepository.findByIdAndUserId = jest
        .fn()
        .mockResolvedValue(null);

      await expect(
        playlistService.getPlaylistMusics(userId, 'non-existent', params)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('validatePlaylistOwnership', () => {
    it('PLAYLIST-OWN-01: should return true when user is owner', async () => {
      mockPlaylistRepository.findById = jest
        .fn()
        .mockResolvedValue(mockPlaylist);

      const result = await playlistService.validatePlaylistOwnership(
        playlistId,
        userId
      );

      expect(result).toBe(true);
    });

    it('PLAYLIST-OWN-02: should return false when user is not owner', async () => {
      mockPlaylistRepository.findById = jest
        .fn()
        .mockResolvedValue(mockPlaylist);

      const result = await playlistService.validatePlaylistOwnership(
        playlistId,
        'other-user'
      );

      expect(result).toBe(false);
    });

    it('PLAYLIST-OWN-03: should return false for non-existent playlist', async () => {
      mockPlaylistRepository.findById = jest.fn().mockResolvedValue(null);

      const result = await playlistService.validatePlaylistOwnership(
        'non-existent',
        userId
      );

      expect(result).toBe(false);
    });
  });

  describe('canAccessPlaylist', () => {
    it('PLAYLIST-ACC-01: should return true for public playlist without userId', async () => {
      mockPlaylistRepository.findById = jest
        .fn()
        .mockResolvedValue(mockPlaylist);

      const result = await playlistService.canAccessPlaylist(playlistId);

      expect(result).toBe(true);
    });

    it('PLAYLIST-ACC-02: should return false for private playlist without userId', async () => {
      mockPlaylistRepository.findById = jest
        .fn()
        .mockResolvedValue(mockPrivatePlaylist);

      const result = await playlistService.canAccessPlaylist(
        mockPrivatePlaylist.id
      );

      expect(result).toBe(false);
    });

    it('PLAYLIST-ACC-03: should return true for private playlist with owner userId', async () => {
      mockPlaylistRepository.findById = jest
        .fn()
        .mockResolvedValue(mockPrivatePlaylist);

      const result = await playlistService.canAccessPlaylist(
        mockPrivatePlaylist.id,
        userId
      );

      expect(result).toBe(true);
    });

    it('PLAYLIST-ACC-04: should return false for private playlist with non-owner userId', async () => {
      mockPlaylistRepository.findById = jest
        .fn()
        .mockResolvedValue(mockPrivatePlaylist);

      const result = await playlistService.canAccessPlaylist(
        mockPrivatePlaylist.id,
        'other-user'
      );

      expect(result).toBe(false);
    });
  });
});
