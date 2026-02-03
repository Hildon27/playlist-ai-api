import { PlaylistCommentService } from './PlaylistCommentService';
import { PlaylistCommentRepository } from '@/repositories/PlaylistCommentRepository';
import { UserPlaylistRepository } from '@/repositories/UserPlaylistRepository';
import {
  CreatePlaylistCommentDTO,
  UpdatePlaylistCommentDTO,
  PlaylistCommentDTO,
  PlaylistCommentWithUserDTO,
  PlaylistCommentWithUserAndPlaylistDTO,
} from '@/models/comments';
import { NotFoundError, ForbiddenError } from '@/models/Errors';
import { createLogger } from '@/lib/logger';

const logger = createLogger('CommentService');

export class PlaylistCommentServiceImpl implements PlaylistCommentService {
  constructor(
    private readonly playlistCommentRepository: PlaylistCommentRepository,
    private readonly userPlaylistRepository: UserPlaylistRepository
  ) {}

  public async createComment(
    data: CreatePlaylistCommentDTO
  ): Promise<PlaylistCommentDTO> {
    logger.debug(
      { playlistId: data.playlistId, userId: data.userId },
      'Creating comment'
    );
    const playlist = await this.userPlaylistRepository.findById(
      data.playlistId
    );
    if (!playlist) {
      logger.warn(
        { playlistId: data.playlistId },
        'Playlist not found for comment'
      );
      throw new NotFoundError('Playlist não encontrada');
    }

    const result = await this.playlistCommentRepository.create(data);
    logger.info({ commentId: result.id }, 'Comment created');
    return result;
  }

  public async updateComment(
    id: string,
    data: UpdatePlaylistCommentDTO,
    userId: string
  ): Promise<PlaylistCommentDTO | null> {
    const commentExists = await this.playlistCommentRepository.exists(id);
    if (!commentExists) {
      throw new NotFoundError('Comentário não encontrado');
    }

    const isOwner = await this.playlistCommentRepository.isCommentOwner(
      id,
      userId
    );
    if (!isOwner) {
      throw new ForbiddenError(
        'Você não tem permissão para editar este comentário'
      );
    }

    return await this.playlistCommentRepository.update(id, data);
  }

  public async deleteComment(id: string, userId: string): Promise<boolean> {
    const commentExists = await this.playlistCommentRepository.exists(id);
    if (!commentExists) {
      throw new NotFoundError('Comentário não encontrado');
    }

    const isOwner = await this.playlistCommentRepository.isCommentOwner(
      id,
      userId
    );
    if (!isOwner) {
      throw new ForbiddenError(
        'Você não tem permissão para excluir este comentário'
      );
    }

    return await this.playlistCommentRepository.delete(id);
  }

  public async getCommentById(
    id: string
  ): Promise<PlaylistCommentWithUserDTO | null> {
    return await this.playlistCommentRepository.findByIdWithUser(id);
  }

  public async getCommentsByPlaylistId(
    playlistId: string
  ): Promise<PlaylistCommentWithUserDTO[]> {
    const playlist = await this.userPlaylistRepository.findById(playlistId);
    if (!playlist) {
      throw new NotFoundError('Playlist não encontrada');
    }

    return await this.playlistCommentRepository.findByPlaylistId(playlistId);
  }

  public async getCommentsByUserId(
    userId: string
  ): Promise<PlaylistCommentWithUserAndPlaylistDTO[]> {
    return await this.playlistCommentRepository.findByUserId(userId);
  }

  public async isCommentOwner(id: string, userId: string): Promise<boolean> {
    return await this.playlistCommentRepository.isCommentOwner(id, userId);
  }
}
