import {
  CreatePlaylistCommentDTO,
  UpdatePlaylistCommentDTO,
  PlaylistCommentDTO,
  PlaylistCommentWithUserDTO,
  PlaylistCommentWithUserAndPlaylistDTO,
} from '@/models/comments';

export interface PlaylistCommentService {
  createComment(data: CreatePlaylistCommentDTO): Promise<PlaylistCommentDTO>;

  updateComment(
    id: string,
    data: UpdatePlaylistCommentDTO,
    userId: string
  ): Promise<PlaylistCommentDTO | null>;

  deleteComment(id: string, userId: string): Promise<boolean>;

  getCommentById(id: string): Promise<PlaylistCommentWithUserDTO | null>;

  getCommentsByPlaylistId(
    playlistId: string
  ): Promise<PlaylistCommentWithUserDTO[]>;

  getCommentsByUserId(
    userId: string
  ): Promise<PlaylistCommentWithUserAndPlaylistDTO[]>;

  isCommentOwner(id: string, userId: string): Promise<boolean>;
}
