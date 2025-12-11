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
} from '@/models/comments';
import { BadRequestError, NotFoundError } from '@/models/Errors';

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
    const validatedData = createPlaylistCommentSchema.parse(req.body);

    const comment =
      await this.playlistCommentService.createComment(validatedData);

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

    const comments =
      await this.playlistCommentService.getCommentsByPlaylistId(playlistId);

    res.status(200).json({
      message: 'Comentários encontrados',
      data: comments,
    });
  };

  /**
   * Get all comments made by a specific user
   */
  public getCommentsByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { userId } = getCommentsByUserIdSchema.parse(req.params);

    const comments =
      await this.playlistCommentService.getCommentsByUserId(userId);

    res.status(200).json({
      message: 'Comentários encontrados',
      data: comments,
    });
  };

  /**
   * Update an existing comment
   */
  public updateComment = async (req: Request, res: Response): Promise<void> => {
    const { id } = getCommentByIdSchema.parse(req.params);
    const validatedData = updatePlaylistCommentSchema.parse(req.body);

    const userId = req.body.userId ?? req.headers['user-id'];
    if (!userId) {
      throw new BadRequestError(
        'ID do usuário é obrigatório para atualizar comentário'
      );
    }

    const comment = await this.playlistCommentService.updateComment(
      id,
      validatedData,
      userId as string
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

    const userId = req.body.userId ?? req.headers['user-id'];
    if (!userId) {
      throw new BadRequestError(
        'ID do usuário é obrigatório para excluir comentário'
      );
    }

    const deleted = await this.playlistCommentService.deleteComment(
      id,
      userId as string
    );

    if (!deleted) {
      throw new NotFoundError('Comentário não encontrado');
    }

    res.status(200).json({
      message: 'Comentário excluído com sucesso',
    });
  };
}
