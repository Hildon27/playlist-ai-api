import { z } from 'zod';

// Schemas

export const playlistCommentSchema = z.object({
  id: z.number().int().positive(),
  content: z.string().min(1, 'Conteúdo do comentário é obrigatório'),
  createdAt: z.date(),
  updatedAt: z.date(),
  playlistId: z.string().min(1),
  userId: z.string().min(1),
});

export const createPlaylistCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Conteúdo do comentário é obrigatório')
    .max(500, 'Comentário deve ter no máximo 500 caracteres'),
  playlistId: z.string().min(1, 'ID da playlist é obrigatório'),
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
});

export const updatePlaylistCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Conteúdo do comentário é obrigatório')
    .max(500, 'Comentário deve ter no máximo 500 caracteres'),
});

export const playlistCommentWithUserSchema = playlistCommentSchema.extend({
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
});

export const playlistCommentWithUserAndPlaylistSchema =
  playlistCommentWithUserSchema.extend({
    playlist: z.object({
      id: z.string(),
      name: z.string(),
    }),
  });

// Types

export type PlaylistCommentDTO = z.infer<typeof playlistCommentSchema>;
export type CreatePlaylistCommentDTO = z.infer<
  typeof createPlaylistCommentSchema
>;
export type UpdatePlaylistCommentDTO = z.infer<
  typeof updatePlaylistCommentSchema
>;
export type PlaylistCommentWithUserDTO = z.infer<
  typeof playlistCommentWithUserSchema
>;
export type PlaylistCommentWithUserAndPlaylistDTO = z.infer<
  typeof playlistCommentWithUserAndPlaylistSchema
>;

// Query schemas for validation
export const getCommentByIdSchema = z.object({
  id: z
    .string()
    .transform(val => parseInt(val))
    .refine(val => !isNaN(val) && val > 0, {
      message: 'ID deve ser um número inteiro positivo',
    }),
});

export const getCommentsByPlaylistIdSchema = z.object({
  playlistId: z.string().min(1, 'ID da playlist é obrigatório'),
});

export const getCommentsByUserIdSchema = z.object({
  userId: z.string().min(1, 'ID do usuário é obrigatório'),
});

export type GetCommentByIdParams = z.infer<typeof getCommentByIdSchema>;
export type GetCommentsByPlaylistIdParams = z.infer<
  typeof getCommentsByPlaylistIdSchema
>;
export type GetCommentsByUserIdParams = z.infer<
  typeof getCommentsByUserIdSchema
>;
