import { PlaylistComment } from '../../generated/prisma';
import prisma from '../lib/prisma';
import {
  CreatePlaylistCommentDTO,
  UpdatePlaylistCommentDTO,
  PlaylistCommentDTO,
  PlaylistCommentWithUserDTO,
  PlaylistCommentWithUserAndPlaylistDTO,
} from '@/models/comments';

export class PlaylistCommentRepository {
  private readonly prisma = prisma;

  public async create(
    data: CreatePlaylistCommentDTO
  ): Promise<PlaylistCommentDTO> {
    const comment = await this.prisma.playlistComment.create({
      data,
    });

    return this.mapToDTO(comment);
  }

  public async findById(id: number): Promise<PlaylistCommentDTO | null> {
    const comment = await this.prisma.playlistComment.findUnique({
      where: { id },
    });

    if (!comment) {
      return null;
    }

    return this.mapToDTO(comment);
  }

  public async findByIdWithUser(
    id: number
  ): Promise<PlaylistCommentWithUserDTO | null> {
    const comment = await this.prisma.playlistComment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!comment) {
      return null;
    }

    return this.mapToDTOWithUser(comment);
  }

  public async findByIdWithUserAndPlaylist(
    id: number
  ): Promise<PlaylistCommentWithUserAndPlaylistDTO | null> {
    const comment = await this.prisma.playlistComment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        playlist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!comment) {
      return null;
    }

    return this.mapToDTOWithUserAndPlaylist(comment);
  }

  public async findByPlaylistId(
    playlistId: string
  ): Promise<PlaylistCommentWithUserDTO[]> {
    const comments = await this.prisma.playlistComment.findMany({
      where: { playlistId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments.map(comment => this.mapToDTOWithUser(comment));
  }

  public async findByUserId(
    userId: string
  ): Promise<PlaylistCommentWithUserAndPlaylistDTO[]> {
    const comments = await this.prisma.playlistComment.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        playlist: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return comments.map(comment => this.mapToDTOWithUserAndPlaylist(comment));
  }

  public async update(
    id: number,
    data: UpdatePlaylistCommentDTO
  ): Promise<PlaylistCommentDTO | null> {
    try {
      const comment = await this.prisma.playlistComment.update({
        where: { id },
        data,
      });

      return this.mapToDTO(comment);
    } catch {
      // If comment doesn't exist, return null
      return null;
    }
  }

  public async delete(id: number): Promise<boolean> {
    try {
      await this.prisma.playlistComment.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async exists(id: number): Promise<boolean> {
    const comment = await this.prisma.playlistComment.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!comment;
  }

  public async isCommentOwner(id: number, userId: string): Promise<boolean> {
    const comment = await this.prisma.playlistComment.findUnique({
      where: { id },
      select: { userId: true },
    });

    return comment?.userId === userId;
  }

  private mapToDTO(comment: PlaylistComment): PlaylistCommentDTO {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      playlistId: comment.playlistId,
      userId: comment.userId,
    };
  }

  private mapToDTOWithUser(
    comment: PlaylistComment & {
      user: {
        id: string;
        firstName: string;
        lastName: string;
      };
    }
  ): PlaylistCommentWithUserDTO {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      playlistId: comment.playlistId,
      userId: comment.userId,
      user: {
        id: comment.user.id,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
      },
    };
  }

  private mapToDTOWithUserAndPlaylist(
    comment: PlaylistComment & {
      user: {
        id: string;
        firstName: string;
        lastName: string;
      };
      playlist: {
        id: string;
        name: string;
      };
    }
  ): PlaylistCommentWithUserAndPlaylistDTO {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      playlistId: comment.playlistId,
      userId: comment.userId,
      user: {
        id: comment.user.id,
        firstName: comment.user.firstName,
        lastName: comment.user.lastName,
      },
      playlist: {
        id: comment.playlist.id,
        name: comment.playlist.name,
      },
    };
  }
}
