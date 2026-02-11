import { PaginatedResult, PaginationParams } from '@/lib/pagination';
import {
  CreateUserPlaylistDTO,
  UpdateUserPlaylistDTO,
  UserPlaylistDTO,
  PlaylistWithMusicsDTO,
  AddMusicToPlaylistDTO,
  MusicDTO,
} from '@/models/playlists';

export interface UserPlaylistService {
  createPlaylist(
    userId: string,
    data: CreateUserPlaylistDTO
  ): Promise<UserPlaylistDTO>;

  updatePlaylist(
    userId: string,
    id: string,
    data: UpdateUserPlaylistDTO
  ): Promise<UserPlaylistDTO | null>;

  deletePlaylist(userId: string, id: string): Promise<boolean>;

  getPlaylistById(userId: string, id: string): Promise<UserPlaylistDTO | null>;

  getPlaylistWithMusics(
    userId: string,
    id: string
  ): Promise<PlaylistWithMusicsDTO | null>;

  getPlaylistsByUserId(
    userId: string,
    params: PaginationParams<UserPlaylistDTO>
  ): Promise<PaginatedResult<UserPlaylistDTO>>;

  getPublicPlaylists(
    params: PaginationParams<UserPlaylistDTO>
  ): Promise<PaginatedResult<UserPlaylistDTO>>;

  addMusicToPlaylist(
    userId: string,
    playlistId: string,
    musicData: AddMusicToPlaylistDTO
  ): Promise<boolean>;

  removeMusicFromPlaylist(
    userId: string,
    playlistId: string,
    musicId: string
  ): Promise<boolean>;

  getPlaylistMusics(
    userId: string,
    playlistId: string,
    params: PaginationParams<MusicDTO>
  ): Promise<PaginatedResult<MusicDTO>>;

  validatePlaylistOwnership(
    playlistId: string,
    userId: string
  ): Promise<boolean>;

  canAccessPlaylist(playlistId: string, userId?: string): Promise<boolean>;
}
