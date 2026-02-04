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
import { AuthContext } from 'contexts/auth-context';
import { NotFoundError } from '@/models/Errors';

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

  public async getPlaylistById(id: string): Promise<UserPlaylistDTO | null> {
    return await this.userPlaylistRepository.findById(id);
  }

  public async getPlaylistWithMusics(
    id: string
  ): Promise<PlaylistWithMusicsDTO | null> {
    return await this.userPlaylistRepository.findByIdWithMusics(id);
  }

  public async getPlaylistsByUserId(
    userId: string
  ): Promise<UserPlaylistDTO[]> {
    return await this.userPlaylistRepository.findByUserId(userId);
  }

  public async getPublicPlaylists(): Promise<UserPlaylistDTO[]> {
    return await this.userPlaylistRepository.findPublicPlaylists();
  }

  public async addMusicToPlaylist(
    playlistId: string,
    musicData: AddMusicToPlaylistDTO
  ): Promise<boolean> {
    return await this.userPlaylistRepository.addMusicToPlaylist(
      playlistId,
      musicData
    );
  }

  public async removeMusicFromPlaylist(
    playlistId: string,
    musicId: string
  ): Promise<boolean> {
    return await this.userPlaylistRepository.removeMusicFromPlaylist(
      playlistId,
      musicId
    );
  }

  public async getPlaylistMusics(playlistId: string): Promise<MusicDTO[]> {
    return await this.userPlaylistRepository.getPlaylistMusics(playlistId);
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
}
