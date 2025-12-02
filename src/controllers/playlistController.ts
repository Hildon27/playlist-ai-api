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

export class UserPlaylistController {
  private readonly userPlaylistService: UserPlaylistServiceImpl;

  constructor() {
    this.userPlaylistService = new UserPlaylistServiceImpl(
      new UserPlaylistRepository()
    );
  }

  public createPlaylist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const validatedData = createUserPlaylistSchema.parse(req.body);
      const playlist =
        await this.userPlaylistService.createPlaylist(validatedData);

      res.status(201).json({
        success: true,
        data: playlist,
        message: 'Playlist criada com sucesso',
      });
    } catch {
      throw new BadRequestError('Dados inválidos para criação da playlist');
    }
  };

  public updatePlaylist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }

      const validatedData = updateUserPlaylistSchema.parse(req.body);

      // Verificar se a playlist existe
      const existingPlaylist =
        await this.userPlaylistService.getPlaylistById(id);
      if (!existingPlaylist) {
        throw new NotFoundError('Playlist não encontrada');
      }

      // Verificar se o usuário é o dono da playlist
      // Note: Aqui você precisaria implementar autenticação para pegar o userId
      // const userId = req.user?.id; // Assumindo que você tem middleware de auth
      // const isOwner = await this.userPlaylistService.validatePlaylistOwnership(id, userId);
      // if (!isOwner) {
      //   throw new ForbiddenError('Você não tem permissão para atualizar esta playlist');
      // }

      const playlist = await this.userPlaylistService.updatePlaylist(
        id,
        validatedData
      );

      res.status(200).json({
        success: true,
        data: playlist,
        message: 'Playlist atualizada com sucesso',
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new BadRequestError('Dados inválidos para atualização da playlist');
    }
  };

  public deletePlaylist = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }

      // Verificar se a playlist existe
      const existingPlaylist =
        await this.userPlaylistService.getPlaylistById(id);
      if (!existingPlaylist) {
        throw new NotFoundError('Playlist não encontrada');
      }

      // Verificar se o usuário é o dono da playlist
      // const userId = req.user?.id;
      // const isOwner = await this.userPlaylistService.validatePlaylistOwnership(id, userId);
      // if (!isOwner) {
      //   throw new ForbiddenError('Você não tem permissão para excluir esta playlist');
      // }

      const deleted = await this.userPlaylistService.deletePlaylist(id);

      if (!deleted) {
        throw new BadRequestError('Não foi possível excluir a playlist');
      }

      res.status(200).json({
        success: true,
        message: 'Playlist excluída com sucesso',
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ForbiddenError) {
        throw error;
      }
      throw new BadRequestError('Erro ao excluir playlist');
    }
  };

  public getPlaylistById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }
      const { includeMusics } = req.query;

      // const userId = req.user?.id; // Para verificar permissões

      // Verificar se o usuário pode acessar a playlist
      // const canAccess = await this.userPlaylistService.canAccessPlaylist(id, userId);
      // if (!canAccess) {
      //   throw new ForbiddenError('Você não tem permissão para acessar esta playlist');
      // }

      let playlist;
      if (includeMusics === 'true') {
        playlist = await this.userPlaylistService.getPlaylistWithMusics(id);
      } else {
        playlist = await this.userPlaylistService.getPlaylistById(id);
      }

      if (!playlist) {
        throw new NotFoundError('Playlist não encontrada');
      }

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

      // Verificar se a playlist existe
      const existingPlaylist =
        await this.userPlaylistService.getPlaylistById(id);
      if (!existingPlaylist) {
        throw new NotFoundError('Playlist não encontrada');
      }

      // Verificar se o usuário é o dono da playlist
      // const userId = req.user?.id;
      // const isOwner = await this.userPlaylistService.validatePlaylistOwnership(id, userId);
      // if (!isOwner) {
      //   throw new ForbiddenError('Você não tem permissão para adicionar músicas a esta playlist');
      // }

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

      // Verificar se a playlist existe
      const existingPlaylist =
        await this.userPlaylistService.getPlaylistById(id);
      if (!existingPlaylist) {
        throw new NotFoundError('Playlist não encontrada');
      }

      // Verificar se o usuário é o dono da playlist
      // const userId = req.user?.id;
      // const isOwner = await this.userPlaylistService.validatePlaylistOwnership(id, userId);
      // if (!isOwner) {
      //   throw new ForbiddenError('Você não tem permissão para remover músicas desta playlist');
      // }

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

  public getPlaylistMusics = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new BadRequestError('ID da playlist é obrigatório');
      }

      // Verificar se a playlist existe e se o usuário pode acessá-la
      // const userId = req.user?.id;
      // const canAccess = await this.userPlaylistService.canAccessPlaylist(id, userId);
      // if (!canAccess) {
      //   throw new ForbiddenError('Você não tem permissão para acessar as músicas desta playlist');
      // }

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
