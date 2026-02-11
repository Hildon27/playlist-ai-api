import {
  buildPaginatedResult,
  getPaginationOffset,
  PaginatedResult,
  PaginationParams,
} from '@/lib/pagination';
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
    userId: string,
    playlistId: string,
    data: CreatePlaylistCommentDTO
  ): Promise<PlaylistCommentDTO> {
    const comment = await this.prisma.playlistComment.create({
      data: {
        ...data,
        playlistId,
        userId,
      },
    });

    return this.mapToDTO(comment);
  }

  public async findById(id: string): Promise<PlaylistCommentDTO | null> {
    const comment = await this.prisma.playlistComment.findUnique({
      where: { id },
    });

    if (!comment) {
      return null;
    }

    return this.mapToDTO(comment);
  }

  public async findByIdWithUser(
    id: string
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
    id: string
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
    playlistId: string,
    params: PaginationParams<PlaylistCommentWithUserDTO>
  ): Promise<PaginatedResult<PlaylistCommentWithUserDTO>> {
    const { page, size, sortBy = 'createdAt', sortOrder = 'asc' } = params;

    const offset = getPaginationOffset(page, size);

    const where = { playlistId } as const;

    const [comments, total] = await this.prisma.$transaction([
      this.prisma.playlistComment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        skip: offset,
        take: size,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.playlistComment.count({ where }),
    ]);

    const mappedComments = comments.map(comment =>
      this.mapToDTOWithUser(comment)
    );

    return buildPaginatedResult(mappedComments, total, page, size);
  }

  public async findByUserId(
    userId: string,
    params: PaginationParams<PlaylistCommentWithUserAndPlaylistDTO>
  ): Promise<PaginatedResult<PlaylistCommentWithUserAndPlaylistDTO>> {
    const { page, size, sortBy = 'createdAt', sortOrder = 'asc' } = params;

    const offset = getPaginationOffset(page, size);

    const where = { userId } as const;

    const [comments, total] = await this.prisma.$transaction([
      this.prisma.playlistComment.findMany({
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
        skip: offset,
        take: size,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.playlistComment.count({ where }),
    ]);

    const mappedComments = comments.map(comment =>
      this.mapToDTOWithUserAndPlaylist(comment)
    );

    return buildPaginatedResult(mappedComments, total, page, size);
  }

  public async update(
    id: string,
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

  public async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.playlistComment.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  public async exists(id: string): Promise<boolean> {
    const comment = await this.prisma.playlistComment.findUnique({
      where: { id },
      select: { id: true },
    });

    return !!comment;
  }

  public async isCommentOwner(id: string, userId: string): Promise<boolean> {
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
