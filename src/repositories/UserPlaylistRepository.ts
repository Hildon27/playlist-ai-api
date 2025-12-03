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

export class UserPlaylistRepository {
  private readonly prisma = prisma;

  public async create(data: CreateUserPlaylistDTO): Promise<UserPlaylistDTO> {
    const playlist = await this.prisma.userPlaylist.create({
      data: this.toModel(data),
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

  public async findByUserId(userId: string): Promise<UserPlaylistDTO[]> {
    const playlists = await this.prisma.userPlaylist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return playlists.map(p => this.toResponse(p));
  }

  public async findPublicPlaylists(): Promise<UserPlaylistDTO[]> {
    const playlists = await this.prisma.userPlaylist.findMany({
      where: { privacity: 'public' },
      orderBy: { createdAt: 'desc' },
    });

    return playlists.map(p => this.toResponse(p));
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

  public async getPlaylistMusics(playlistId: string): Promise<MusicDTO[]> {
    const musicPlaylists = await this.prisma.musicPlaylist.findMany({
      where: { playlistId },
      include: { music: true },
      orderBy: { createdAt: 'asc' },
    });

    return musicPlaylists.map(mp => this.toMusicResponse(mp.music));
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
