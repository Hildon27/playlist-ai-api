import { PaginatedResult, PaginationParams } from '@/lib/pagination';
import {
  CreatePlaylistCommentDTO,
  UpdatePlaylistCommentDTO,
  PlaylistCommentDTO,
  PlaylistCommentWithUserDTO,
  PlaylistCommentWithUserAndPlaylistDTO,
} from '@/models/comments';

export interface PlaylistCommentService {
  createComment(
    userId: string,
    playlistId: string,
    data: CreatePlaylistCommentDTO
  ): Promise<PlaylistCommentDTO>;

  updateComment(
    userId: string,
    id: string,
    data: UpdatePlaylistCommentDTO
  ): Promise<PlaylistCommentDTO | null>;

  deleteComment(userId: string, id: string): Promise<boolean>;

  getCommentById(id: string): Promise<PlaylistCommentWithUserDTO | null>;

  getCommentsByPlaylistId(
    playlistId: string,
    params: PaginationParams<PlaylistCommentWithUserDTO>
  ): Promise<PaginatedResult<PlaylistCommentWithUserDTO>>;

  getCommentsByUserId(
    userId: string,
    params: PaginationParams<PlaylistCommentWithUserAndPlaylistDTO>
  ): Promise<PaginatedResult<PlaylistCommentWithUserAndPlaylistDTO>>;

  isCommentOwner(id: string, userId: string): Promise<boolean>;
}
