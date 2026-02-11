import {
  UserPlaylist,
  Music,
  Privacity as PrismaPrivacity,
} from '../../generated/prisma';
import { Privacity } from '@/models/Enums';
import prisma from '../lib/prisma';
import {
  CreateUserPlaylistDTO,
  UpdateUserPlaylistDTO,
  UserPlaylistDTO,
  PlaylistWithMusicsDTO,
  AddMusicToPlaylistDTO,
  MusicDTO,
} from '@/models/playlists';
import {
  buildPaginatedResult,
  getPaginationOffset,
  PaginatedResult,
  PaginationParams,
} from '@/lib/pagination';

export class UserPlaylistRepository {
  private readonly prisma = prisma;

  public async create(
    userId: string,
    data: CreateUserPlaylistDTO
  ): Promise<UserPlaylistDTO> {
    const playlistModel = this.toModel(data);

    const playlist = await this.prisma.userPlaylist.create({
      data: { ...playlistModel, userId },
    });

    return this.toResponse(playlist);
  }

  public async update(
    id: string,
    data: UpdateUserPlaylistDTO
  ): Promise<UserPlaylistDTO | null> {
    try {
      const playlist = await this.prisma.userPlaylist.update({
        where: { id },
        data: this.toModel(data),
      });

      return this.toResponse(playlist);
    } catch {
      return null;
    }
  }

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.musicPlaylist.deleteMany({
        where: { playlistId: id },
      });

      await this.prisma.userPlaylist.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  public async findById(id: string): Promise<UserPlaylistDTO | null> {
    const playlist = await this.prisma.userPlaylist.findUnique({
      where: { id },
    });

    return playlist ? this.toResponse(playlist) : null;
  }

  public async findByIdAndUserId(
    id: string,
    userId: string
  ): Promise<UserPlaylistDTO | null> {
    const playlist = await this.prisma.userPlaylist.findUnique({
      where: { id, userId },
    });

    return playlist ? this.toResponse(playlist) : null;
  }

  public async findByIdAndUserIdWithMusics(
    id: string,
    userId: string
  ): Promise<PlaylistWithMusicsDTO | null> {
    const playlist = await this.prisma.userPlaylist.findUnique({
      where: { id, userId },
      include: {
        musics: {
          include: {
            music: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!playlist) return null;

    return {
      ...this.toResponse(playlist),
      musics: playlist.musics.map(mp => this.toMusicResponse(mp.music)),
    };
  }

  public async findByUserId(
    userId: string,
    params: PaginationParams<UserPlaylistDTO>
  ): Promise<PaginatedResult<UserPlaylistDTO>> {
    const { page, size, sortBy = 'createdAt', sortOrder = 'asc' } = params;

    const offset = getPaginationOffset(page, size);

    const where = { userId } as const;

    const [playlists, total] = await this.prisma.$transaction([
      this.prisma.userPlaylist.findMany({
        where,
        skip: offset,
        take: size,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.userPlaylist.count({ where }),
    ]);

    const mappedPlaylists = playlists.map((p: UserPlaylist) =>
      this.toResponse(p)
    );

    return buildPaginatedResult(mappedPlaylists, total, page, size);
  }

  public async findPublicPlaylists(
    params: PaginationParams<UserPlaylistDTO>
  ): Promise<PaginatedResult<UserPlaylistDTO>> {
    const { page, size, sortBy = 'createdAt', sortOrder = 'asc' } = params;

    const offset = getPaginationOffset(page, size);

    const where = { privacity: 'public' } as const;

    const [playlists, total] = await this.prisma.$transaction([
      this.prisma.userPlaylist.findMany({
        where,
        skip: offset,
        take: size,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.userPlaylist.count({ where }),
    ]);

    const mappedPlaylists = playlists.map((p: UserPlaylist) =>
      this.toResponse(p)
    );

    return buildPaginatedResult(mappedPlaylists, total, page, size);
  }

  public async addMusicToPlaylist(
    playlistId: string,
    musicData: AddMusicToPlaylistDTO
  ): Promise<boolean> {
    try {
      let music = await this.prisma.music.findFirst({
        where: { externalId: musicData.externalId },
      });

      music ??= await this.prisma.music.create({
        data: { externalId: musicData.externalId },
      });

      const existingMusicPlaylist = await this.prisma.musicPlaylist.findFirst({
        where: {
          musicId: music.id,
          playlistId: playlistId,
        },
      });

      if (existingMusicPlaylist) {
        return false;
      }

      await this.prisma.musicPlaylist.create({
        data: {
          musicId: music.id,
          playlistId: playlistId,
        },
      });

      return true;
    } catch {
      return false;
    }
  }

  public async removeMusicFromPlaylist(
    playlistId: string,
    musicId: string
  ): Promise<boolean> {
    try {
      await this.prisma.musicPlaylist.deleteMany({
        where: {
          musicId: musicId,
          playlistId: playlistId,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async getPlaylistMusics(
    playlistId: string,
    params: PaginationParams<MusicDTO>
  ): Promise<PaginatedResult<MusicDTO>> {
    const { page, size, sortBy = 'createdAt', sortOrder = 'asc' } = params;

    const offset = getPaginationOffset(page, size);

    const where = { playlistId } as const;

    const [musicPlaylists, total] = await this.prisma.$transaction([
      this.prisma.musicPlaylist.findMany({
        where,
        include: { music: true },
        skip: offset,
        take: size,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.musicPlaylist.count({ where }),
    ]);

    const mappedMusics = musicPlaylists.map(mp =>
      this.toMusicResponse(mp.music)
    );

    return buildPaginatedResult(mappedMusics, total, page, size);
  }

  private toModel(data: CreateUserPlaylistDTO | UpdateUserPlaylistDTO) {
    const model: any = { ...data };

    Object.keys(model).forEach(key => {
      if (model[key] === undefined) delete model[key];
    });

    if (model.privacity) {
      model.privacity = model.privacity as PrismaPrivacity;
    }

    return model;
  }

  private toResponse(playlist: UserPlaylist): UserPlaylistDTO {
    return {
      id: playlist.id,
      name: playlist.name,
      privacity: playlist.privacity as Privacity,
      aiMessage: playlist.aiMessage,
      userId: playlist.userId,
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
    };
  }

  private toMusicResponse(music: Music): MusicDTO {
    return {
      id: music.id,
      externalId: music.externalId,
      createdAt: music.createdAt,
    };
  }
}
