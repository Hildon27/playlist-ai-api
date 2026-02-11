import { z } from 'zod';
import { Privacity } from '../Enums';
import { createPaginationParamsSchema } from '@/lib/pagination';

// Schemas

export const musicSchema = z.object({
  id: z.string().nonempty(),
  externalId: z.string().min(1, 'ID externo da música é obrigatório'),
  createdAt: z.date(),
});

export const musicPlaylistSchema = z.object({
  id: z.string().nonempty(),
  musicId: z.string().min(1),
  playlistId: z.string().min(1),
  createdAt: z.date(),
});

export const userPlaylistSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().min(1, 'Nome da playlist é obrigatório'),
  privacity: z.enum(Privacity),
  aiMessage: z.string().nullable().optional(),
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const playlistWithMusicsSchema = userPlaylistSchema.extend({
  musics: z.array(musicSchema),
});

export const createUserPlaylistSchema = userPlaylistSchema.pick({
  name: true,
  privacity: true,
  aiMessage: true,
});

export const updateUserPlaylistSchema = userPlaylistSchema
  .pick({
    name: true,
    privacity: true,
  })
  .partial();

export const addMusicToPlaylistSchema = z.object({
  externalId: z.string().min(1, 'ID externo da música é obrigatório'),
});

export const removeMusicFromPlaylistSchema = z.object({
  musicId: z.string().min(1, 'ID da música é obrigatório'),
});

export const findManyUserPlaylistsRequestSchema =
  createPaginationParamsSchema(userPlaylistSchema);

// Types

export type MusicDTO = z.infer<typeof musicSchema>;
export type MusicPlaylistDTO = z.infer<typeof musicPlaylistSchema>;
export type UserPlaylistDTO = z.infer<typeof userPlaylistSchema>;
export type PlaylistWithMusicsDTO = z.infer<typeof playlistWithMusicsSchema>;
export type CreateUserPlaylistDTO = z.infer<typeof createUserPlaylistSchema>;
export type UpdateUserPlaylistDTO = z.infer<typeof updateUserPlaylistSchema>;
export type AddMusicToPlaylistDTO = z.infer<typeof addMusicToPlaylistSchema>;
export type RemoveMusicFromPlaylistDTO = z.infer<
  typeof removeMusicFromPlaylistSchema
>;
