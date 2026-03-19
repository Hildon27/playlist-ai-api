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
import { paginate, PaginatedResult, PaginationParams } from '@/lib/pagination';

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

  public async findByIdWithMusics(
    id: string
  ): Promise<PlaylistWithMusicsDTO | null> {
    const playlist = await this.prisma.userPlaylist.findUnique({
      where: { id },
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
    return paginate(
      this.prisma.userPlaylist,
      { where: { userId } },
      params,
      this.toResponse
    );
  }

  public async findPublicPlaylists(
    params: PaginationParams<UserPlaylistDTO>
  ): Promise<PaginatedResult<UserPlaylistDTO>> {
    return paginate(
      this.prisma.userPlaylist,
      { where: { privacity: 'public' } },
      params,
      this.toResponse
    );
  }

  public async addMusicToPlaylist(
    playlistId: string,
    musicData: AddMusicToPlaylistDTO
  ): Promise<boolean> {
    try {
      let music = await this.prisma.music.findFirst({
        where: { externalId: musicData.externalId },
      });

      if (music) {
        // Update albumCover if provided and not already set
        if (musicData.albumCover && !music.albumCover) {
          music = await this.prisma.music.update({
            where: { id: music.id },
            data: { albumCover: musicData.albumCover },
          });
        }
      } else {
        music = await this.prisma.music.create({
          data: {
            externalId: musicData.externalId,
            albumCover: musicData.albumCover ?? null,
          },
        });
      }

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
    return await paginate(
      this.prisma.musicPlaylist,
      { where: { playlistId }, include: { music: true } },
      params,
      item => this.toMusicResponse(item.music)
    );
  }

  public async findCoverTrackIdsByPlaylistId(
    playlistId: string,
    limit = 4
  ): Promise<string[]> {
    const musicRelations = await this.prisma.musicPlaylist.findMany({
      where: { playlistId },
      include: { music: true },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });

    return musicRelations
      .map(relation => relation.music.albumCover)
      .filter((cover): cover is string => !!cover);
  }

  public async findCoverTrackIdsByPlaylistIds(
    playlistIds: string[],
    limit = 4
  ): Promise<Record<string, string[]>> {
    if (playlistIds.length === 0) {
      return {};
    }

    const musicRelations = await this.prisma.musicPlaylist.findMany({
      where: { playlistId: { in: playlistIds } },
      include: { music: true },
      orderBy: [{ playlistId: 'asc' }, { createdAt: 'asc' }],
    });

    const coversByPlaylist: Record<string, string[]> = {};

    for (const relation of musicRelations) {
      const covers = coversByPlaylist[relation.playlistId] ?? [];

      if (covers.length >= limit) {
        continue;
      }

      if (relation.music.albumCover) {
        covers.push(relation.music.albumCover);
        coversByPlaylist[relation.playlistId] = covers;
      }
    }

    return coversByPlaylist;
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
      albumCover: music.albumCover,
      createdAt: music.createdAt,
    };
  }
}
