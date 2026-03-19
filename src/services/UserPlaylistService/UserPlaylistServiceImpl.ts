import { UserPlaylistService } from './UserPlaylistService';
import { UserPlaylistRepository } from '@/repositories/UserPlaylistRepository';
import { Privacity } from '@/models/Enums';
import {
  CreateUserPlaylistDTO,
  UpdateUserPlaylistDTO,
  UserPlaylistDTO,
  PlaylistWithMusicsDTO,
  AddMusicToPlaylistDTO,
  MusicDTO,
} from '@/models/playlists';
import { createLogger } from '@/lib/logger';
import { BadRequestError, NotFoundError } from '@/models/Errors';
import { PaginatedResult, PaginationParams } from '@/lib/pagination';

const logger = createLogger('PlaylistService');

export class UserPlaylistServiceImpl implements UserPlaylistService {
  constructor(
    private readonly userPlaylistRepository: UserPlaylistRepository
  ) {}

  public async createPlaylist(
    userId: string,
    data: CreateUserPlaylistDTO
  ): Promise<UserPlaylistDTO> {
    logger.debug(
      { name: data.name, privacity: data.privacity },
      'Creating playlist'
    );

    const result = await this.userPlaylistRepository.create(userId, data);

    logger.info({ playlistId: result.id }, 'Playlist created');

    return result;
  }

  public async updatePlaylist(
    userId: string,
    id: string,
    data: UpdateUserPlaylistDTO
  ): Promise<UserPlaylistDTO | null> {
    const existingPlaylist =
      await this.userPlaylistRepository.findByIdAndUserId(id, userId);
    if (!existingPlaylist) {
      logger.warn({ playlistId: id }, 'Playlist not found for update');
      throw new NotFoundError('Playlist não encontrada');
    }

    return await this.userPlaylistRepository.update(id, data);
  }

  public async deletePlaylist(userId: string, id: string): Promise<boolean> {
    logger.debug({ playlistId: id }, 'Deleting playlist');

    const existingPlaylist =
      await this.userPlaylistRepository.findByIdAndUserId(id, userId);

    if (!existingPlaylist) {
      logger.warn({ playlistId: id }, 'Playlist not found for deletion');
      throw new NotFoundError('Playlist não encontrada');
    }

    const result = await this.userPlaylistRepository.delete(id);
    if (result) {
      logger.info({ playlistId: id }, 'Playlist deleted');
    }
    return result;
  }

  public async getPlaylistById(
    userId: string,
    id: string
  ): Promise<UserPlaylistDTO | null> {
    const existingPlaylist = await this.userPlaylistRepository.findById(id);

    if (!existingPlaylist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    const isPrivatePlaylist = existingPlaylist.privacity === Privacity.PRIVATE;

    if (isPrivatePlaylist && existingPlaylist.userId !== userId) {
      throw new NotFoundError('Playlist não encontrada');
    }

    return await this.attachCoverImagesToPlaylist(existingPlaylist);
  }

  public async getPlaylistWithMusics(
    userId: string,
    id: string
  ): Promise<PlaylistWithMusicsDTO | null> {
    const existingPlaylist =
      await this.userPlaylistRepository.findByIdWithMusics(id);

    if (!existingPlaylist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    const isPrivatePlaylist = existingPlaylist.privacity === Privacity.PRIVATE;

    if (isPrivatePlaylist && existingPlaylist.userId !== userId) {
      throw new NotFoundError('Playlist não encontrada');
    }

    // Get cover images from stored albumCover in musics
    const coverImages = existingPlaylist.musics
      .slice(0, 4)
      .map(music => music.albumCover)
      .filter((cover): cover is string => !!cover);

    return {
      ...existingPlaylist,
      coverImages,
    };
  }

  public async getPlaylistsByUserId(
    userId: string,
    params: PaginationParams<UserPlaylistDTO>
  ): Promise<PaginatedResult<UserPlaylistDTO>> {
    const playlists = await this.userPlaylistRepository.findByUserId(
      userId,
      params
    );

    return {
      ...playlists,
      data: await this.attachCoverImagesToPlaylists(playlists.data),
    };
  }

  public async getPublicPlaylists(
    params: PaginationParams<UserPlaylistDTO>
  ): Promise<PaginatedResult<UserPlaylistDTO>> {
    const playlists =
      await this.userPlaylistRepository.findPublicPlaylists(params);

    return {
      ...playlists,
      data: await this.attachCoverImagesToPlaylists(playlists.data),
    };
  }

  public async addMusicToPlaylist(
    userId: string,
    playlistId: string,
    musicData: AddMusicToPlaylistDTO
  ): Promise<boolean> {
    const existingPlaylist =
      await this.userPlaylistRepository.findByIdAndUserId(playlistId, userId);

    if (!existingPlaylist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    const added = await this.userPlaylistRepository.addMusicToPlaylist(
      playlistId,
      musicData
    );

    if (!added) {
      throw new BadRequestError(
        'Música já existe na playlist ou erro ao adicionar'
      );
    }

    return added;
  }

  public async removeMusicFromPlaylist(
    userId: string,
    playlistId: string,
    musicId: string
  ): Promise<boolean> {
    const existingPlaylist =
      await this.userPlaylistRepository.findByIdAndUserId(playlistId, userId);

    if (!existingPlaylist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    const removed = await this.userPlaylistRepository.removeMusicFromPlaylist(
      playlistId,
      musicId
    );

    if (!removed) {
      throw new BadRequestError('Erro ao remover música da playlist');
    }

    return removed;
  }

  public async getPlaylistMusics(
    userId: string,
    playlistId: string,
    params: PaginationParams<MusicDTO>
  ): Promise<PaginatedResult<MusicDTO>> {
    const existingPlaylist =
      await this.userPlaylistRepository.findByIdAndUserId(playlistId, userId);

    if (!existingPlaylist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    return await this.userPlaylistRepository.getPlaylistMusics(
      playlistId,
      params
    );
  }

  public async validatePlaylistOwnership(
    playlistId: string,
    userId: string
  ): Promise<boolean> {
    const playlist = await this.userPlaylistRepository.findById(playlistId);
    return playlist?.userId === userId;
  }

  public async canAccessPlaylist(
    playlistId: string,
    userId?: string
  ): Promise<boolean> {
    const playlist = await this.userPlaylistRepository.findById(playlistId);

    if (!playlist) return false;

    if (playlist.privacity === Privacity.PUBLIC) return true;

    if (playlist.privacity === Privacity.PRIVATE) {
      return playlist.userId === userId;
    }

    return false;
  }

  private async attachCoverImagesToPlaylist(
    playlist: UserPlaylistDTO
  ): Promise<UserPlaylistDTO> {
    // Get cover images directly from database (already stored in Music.albumCover)
    const coverImages =
      await this.userPlaylistRepository.findCoverTrackIdsByPlaylistId(
        playlist.id,
        4
      );

    return {
      ...playlist,
      coverImages,
    };
  }

  private async attachCoverImagesToPlaylists(
    playlists: UserPlaylistDTO[]
  ): Promise<UserPlaylistDTO[]> {
    if (playlists.length === 0) {
      return playlists;
    }

    const playlistIds = playlists.map(playlist => playlist.id);
    // Get cover images directly from database (already stored in Music.albumCover)
    const coversByPlaylist =
      await this.userPlaylistRepository.findCoverTrackIdsByPlaylistIds(
        playlistIds,
        4
      );

    return playlists.map(playlist => {
      const coverImages = coversByPlaylist[playlist.id] ?? [];

      return {
        ...playlist,
        coverImages,
      };
    });
  }
}
