import { Request, Response } from 'express';
import { UserPlaylistServiceImpl } from '@/services/UserPlaylistService/UserPlaylistServiceImpl';
import { UserPlaylistRepository } from '@/repositories/UserPlaylistRepository';
import {
  createUserPlaylistSchema,
  updateUserPlaylistSchema,
  addMusicToPlaylistSchema,
  removeMusicFromPlaylistSchema,
  findManyUserPlaylistsRequestSchema,
  findManyPlaylistMusicsRequestSchema,
} from '@/models/playlists';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from '@/models/Errors';
import { createLogger } from '@/lib/logger';
import { AuthContext } from 'contexts/auth-context';

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

      const user = AuthContext.getLoggedUser();

      const playlist = await this.userPlaylistService.createPlaylist(
        user.id,
        validatedData
      );

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

      const user = AuthContext.getLoggedUser();

      const playlist = await this.userPlaylistService.updatePlaylist(
        user.id,
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

      const user = AuthContext.getLoggedUser();

      const deleted = await this.userPlaylistService.deletePlaylist(
        user.id,
        id
      );

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

      const user = AuthContext.getLoggedUser();

      let playlist;
      if (includeMusics === 'true') {
        playlist = await this.userPlaylistService.getPlaylistWithMusics(
          user.id,
          id
        );
      } else {
        playlist = await this.userPlaylistService.getPlaylistById(user.id, id);
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
  public getLoggedUserPlaylists = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const user = AuthContext.getLoggedUser();

    const params = findManyUserPlaylistsRequestSchema.parse(req.query);

    const playlists = await this.userPlaylistService.getPlaylistsByUserId(
      user.id,
      params
    );

    res.status(200).json({
      success: true,
      ...playlists,
    });
  };

  /**
   * Get all public playlists
   */
  public getPublicPlaylists = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const params = findManyUserPlaylistsRequestSchema.parse(req.query);

    const playlists = await this.userPlaylistService.getPublicPlaylists(params);

    res.status(200).json({
      success: true,
      ...playlists,
    });
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

      const user = AuthContext.getLoggedUser();

      await this.userPlaylistService.addMusicToPlaylist(
        user.id,
        id,
        validatedData
      );

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

      const user = AuthContext.getLoggedUser();

      await this.userPlaylistService.removeMusicFromPlaylist(
        user.id,
        id,
        validatedData.musicId
      );

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

      const params = findManyPlaylistMusicsRequestSchema.parse(req.query);

      const user = AuthContext.getLoggedUser();

      const musics = await this.userPlaylistService.getPlaylistMusics(
        user.id,
        id,
        params
      );

      res.status(200).json({
        success: true,
        ...musics,
      });
    } catch (error) {
      if (error instanceof ForbiddenError) {
        throw error;
      }
      throw new BadRequestError('Erro ao buscar músicas da playlist');
    }
  };
}
