import z from 'zod';
import { FollowRequestStatus } from '../Enums';

// Schemas

export const followRequestSchema = z.object({
  id: z.string().nonempty(),
  followerId: z.string().nonempty('Id de quem segue não pode ser vazio'),
  followedId: z
    .string()
    .nonempty('Id de usuário a ser seguido não pode ser vazio'),
  status: z.enum(FollowRequestStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const followRequestBaseSchema = z.object({
  followerId: z.string().nonempty('Id de quem está seguindo não pode ser nulo'),
  followedUserEmail: z.email(
    'Email do usuário a ser seguido deve ser um email válido'
  ),
});

// Type

export type FollowRequestDto = z.infer<typeof followRequestSchema>;
export type FollowBaseRequestDto = z.infer<typeof followRequestBaseSchema>;
