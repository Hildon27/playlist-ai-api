import { Request, Response } from 'express';
import { UserPlaylistServiceImpl } from '@/services/UserPlaylistService/UserPlaylistServiceImpl';
import { UserPlaylistRepository } from '@/repositories/UserPlaylistRepository';
import {
  createUserPlaylistSchema,
  updateUserPlaylistSchema,
  addMusicToPlaylistSchema,
  removeMusicFromPlaylistSchema,
} from '@/models/playlists';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '@/models/Errors';
import { createLogger } from '@/lib/logger';

const logger = createLogger('PlaylistController');

export class UserPlaylistController {
  private readonly userPlaylistService: UserPlaylistServiceImpl;

  constructor() {
    this.userPlaylistService = new UserPlaylistServiceImpl(
      new UserPlaylistRepository()
    );
  }

  /**
   * Create a new playlist
   */
  public createPlaylist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      logger.info({ userId: req.body.userId }, 'Creating new playlist');
      const validatedData = createUserPlaylistSchema.parse(req.body);
      const playlist =
        await this.userPlaylistService.createPlaylist(validatedData);

      logger.info({ playlistId: playlist.id }, 'Playlist created successfully');
      res.status(201).json({
        success: true,
        data: playlist,
        message: 'Playlist criada com sucesso',
      });
    } catch {
      logger.error('Error creating playlist');
      throw new BadRequestError('Dados inválidos para criação da playlist');
    }
  };

  /**
   * Update an existing playlist
   */
  public updatePlaylist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      logger.info({ playlistId: id }, 'Updating playlist');
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }

      const validatedData = updateUserPlaylistSchema.parse(req.body);

      const existingPlaylist =
        await this.userPlaylistService.getPlaylistById(id);
      if (!existingPlaylist) {
        logger.warn({ playlistId: id }, 'Playlist not found for update');
        throw new NotFoundError('Playlist não encontrada');
      }

      const playlist = await this.userPlaylistService.updatePlaylist(
        id,
        validatedData
      );

      logger.info({ playlistId: id }, 'Playlist updated successfully');
      res.status(200).json({
        success: true,
        data: playlist,
        message: 'Playlist atualizada com sucesso',
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      logger.error({ error }, 'Error updating playlist');
      throw new BadRequestError('Dados inválidos para atualização da playlist');
    }
  };

  /**
   * Delete a playlist by its ID
   */
  public deletePlaylist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      logger.info({ playlistId: id }, 'Deleting playlist');
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }

      const existingPlaylist =
        await this.userPlaylistService.getPlaylistById(id);
      if (!existingPlaylist) {
        logger.warn({ playlistId: id }, 'Playlist not found for deletion');
        throw new NotFoundError('Playlist não encontrada');
      }

      const deleted = await this.userPlaylistService.deletePlaylist(id);

      if (!deleted) {
        throw new BadRequestError('Não foi possível excluir a playlist');
      }

      logger.info({ playlistId: id }, 'Playlist deleted successfully');
      res.status(200).json({
        success: true,
        message: 'Playlist excluída com sucesso',
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      logger.error({ error }, 'Error deleting playlist');
      throw new BadRequestError('Erro ao excluir playlist');
    }
  };

  /**
   * Get a playlist by its ID
   */
  public getPlaylistById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      logger.info({ playlistId: id }, 'Getting playlist by ID');
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }
      const { includeMusics } = req.query;

      let playlist;
      if (includeMusics === 'true') {
        playlist = await this.userPlaylistService.getPlaylistWithMusics(id);
      } else {
        playlist = await this.userPlaylistService.getPlaylistById(id);
      }

      if (!playlist) {
        logger.warn({ playlistId: id }, 'Playlist not found');
        throw new NotFoundError('Playlist não encontrada');
      }

      logger.info({ playlistId: id }, 'Playlist retrieved successfully');
      res.status(200).json({
        success: true,
        data: playlist,
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new BadRequestError('Erro ao buscar playlist');
    }
  };

  /**
   * Get all playlists from a specific user
   */
  public getPlaylistsByUserId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;
      if (!userId) {
        throw new BadRequestError('ID do usuário é obrigatório');
      }
      const playlists =
        await this.userPlaylistService.getPlaylistsByUserId(userId);

      res.status(200).json({
        success: true,
        data: playlists,
      });
    } catch {
      throw new BadRequestError('Erro ao buscar playlists do usuário');
    }
  };

  /**
   * Get all public playlists
   */
  public getPublicPlaylists = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const playlists = await this.userPlaylistService.getPublicPlaylists();

      res.status(200).json({
        success: true,
        data: playlists,
      });
    } catch {
      throw new BadRequestError('Erro ao buscar playlists públicas');
    }
  };

  /**
   * Add a music to a playlist
   */
  public addMusicToPlaylist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }
      const validatedData = addMusicToPlaylistSchema.parse(req.body);

      const existingPlaylist =
        await this.userPlaylistService.getPlaylistById(id);
      if (!existingPlaylist) {
        throw new NotFoundError('Playlist não encontrada');
      }

      const added = await this.userPlaylistService.addMusicToPlaylist(
        id,
        validatedData
      );

      if (!added) {
        throw new BadRequestError(
          'Música já existe na playlist ou erro ao adicionar'
        );
      }

      res.status(200).json({
        success: true,
        message: 'Música adicionada à playlist com sucesso',
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new BadRequestError('Dados inválidos ou erro ao adicionar música');
    }
  };

  /**
   * Remove a music from a playlist
   */
  public removeMusicFromPlaylist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }
      const validatedData = removeMusicFromPlaylistSchema.parse(req.body);

      const existingPlaylist =
        await this.userPlaylistService.getPlaylistById(id);
      if (!existingPlaylist) {
        throw new NotFoundError('Playlist não encontrada');
      }

      const removed = await this.userPlaylistService.removeMusicFromPlaylist(
        id,
        validatedData.musicId
      );

      if (!removed) {
        throw new BadRequestError('Erro ao remover música da playlist');
      }

      res.status(200).json({
        success: true,
        message: 'Música removida da playlist com sucesso',
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new BadRequestError('Dados inválidos ou erro ao remover música');
    }
  };

  /**
   * Get all musics from a playlist
   */
  public getPlaylistMusics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }

      const musics = await this.userPlaylistService.getPlaylistMusics(id);

      res.status(200).json({
        success: true,
        data: musics,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw error;
      }
      throw new BadRequestError('Erro ao buscar músicas da playlist');
    }
  };
}
