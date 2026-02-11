import { Request, Response } from 'express';
import { PlaylistCommentServiceImpl } from '@/services/PlaylistCommentService/PlaylistCommentServiceImpl';
import { PlaylistCommentRepository } from '@/repositories/PlaylistCommentRepository';
import { UserPlaylistRepository } from '@/repositories/UserPlaylistRepository';
import {
  createPlaylistCommentSchema,
  updatePlaylistCommentSchema,
  getCommentByIdSchema,
  getCommentsByPlaylistIdSchema,
  getCommentsByUserIdSchema,
  findManyPlaylistCommentsRequestSchema,
  findManyCommentsWithUserAndPlaylistRequestSchema,
} from '@/models/comments';
import { BadRequestError, NotFoundError } from '@/models/Errors';
import { createLogger } from '@/lib/logger';
import { AuthContext } from 'contexts/auth-context';

const logger = createLogger('CommentController');

export class PlaylistCommentController {
  private readonly playlistCommentService: PlaylistCommentServiceImpl;

  constructor() {
    this.playlistCommentService = new PlaylistCommentServiceImpl(
      new PlaylistCommentRepository(),
      new UserPlaylistRepository()
    );
  }

  /**
   * Create a new comment on a playlist
   */
  public createComment = async (req: Request, res: Response): Promise<void> => {
    const { playlistId } = req.params;
    if (!playlistId) {
      throw new BadRequestError('ID da playlist é obrigatório');
    }

    const validatedData = createPlaylistCommentSchema.parse(req.body);

    const user = AuthContext.getLoggedUser();

    logger.info(
      { playlistId: playlistId, userId: user.id },
      'Creating comment'
    );

    const comment = await this.playlistCommentService.createComment(
      user.id,
      playlistId,
      validatedData
    );

    logger.info({ commentId: comment.id }, 'Comment created successfully');
    res.status(201).json({
      message: 'Comentário criado com sucesso',
      data: comment,
    });
  };

  /**
   * Get a comment by its ID
   */
  public getCommentById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = getCommentByIdSchema.parse(req.params);

    const comment = await this.playlistCommentService.getCommentById(id);

    if (!comment) {
      throw new NotFoundError('Comentário não encontrado');
    }

    res.status(200).json({
      message: 'Comentário encontrado',
      data: comment,
    });
  };

  /**
   * Get all comments from a specific playlist
   */
  public getCommentsByPlaylistId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { playlistId } = getCommentsByPlaylistIdSchema.parse(req.params);

    const params = findManyPlaylistCommentsRequestSchema.parse(req.query);

    const comments = await this.playlistCommentService.getCommentsByPlaylistId(
      playlistId,
      params
    );

    res.status(200).json({
      message: 'Comentários encontrados',
      ...comments,
    });
  };

  /**
   * Get all comments made by the logged user
   */
  public getLoggedUserComments = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const user = AuthContext.getLoggedUser();

    const params = findManyCommentsWithUserAndPlaylistRequestSchema.parse(
      req.query
    );

    const comments = await this.playlistCommentService.getCommentsByUserId(
      user.id,
      params
    );

    res.status(200).json({
      message: 'Comentários encontrados',
      ...comments,
    });
  };

  /**
   * Update an existing comment
   */
  public updateComment = async (req: Request, res: Response): Promise<void> => {
    const { id } = getCommentByIdSchema.parse(req.params);
    const validatedData = updatePlaylistCommentSchema.parse(req.body);

    const user = AuthContext.getLoggedUser();

    const comment = await this.playlistCommentService.updateComment(
      user.id,
      id,
      validatedData
    );

    if (!comment) {
      throw new NotFoundError('Comentário não encontrado');
    }

    res.status(200).json({
      message: 'Comentário atualizado com sucesso',
      data: comment,
    });
  };

  /**
   * Delete a comment by its ID
   */
  public deleteComment = async (req: Request, res: Response): Promise<void> => {
    const { id } = getCommentByIdSchema.parse(req.params);

    const user = AuthContext.getLoggedUser();

    const deleted = await this.playlistCommentService.deleteComment(
      user.id,
      id
    );

    if (!deleted) {
      throw new NotFoundError('Comentário não encontrado');
    }

    res.status(200).json({
      message: 'Comentário excluído com sucesso',
    });
  };
}
