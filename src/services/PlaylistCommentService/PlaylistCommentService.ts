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
    id: number,
    data: UpdatePlaylistCommentDTO,
    userId: string
  ): Promise<PlaylistCommentDTO | null>;

  deleteComment(id: number, userId: string): Promise<boolean>;

  getCommentById(id: number): Promise<PlaylistCommentWithUserDTO | null>;

  getCommentsByPlaylistId(
    playlistId: string
  ): Promise<PlaylistCommentWithUserDTO[]>;

  getCommentsByUserId(
    userId: string
  ): Promise<PlaylistCommentWithUserAndPlaylistDTO[]>;

  isCommentOwner(id: number, userId: string): Promise<boolean>;
}
