import z from 'zod';
import { FollowRequestProcessingAction, FollowRequestStatus } from '../Enums';
import { createPaginationParamsSchema } from '@/lib/pagination';
import { userSchema } from '../users';

// Schemas

export const followRequestSchema = z.object({
  id: z.string().nonempty(),
  followerId: z.string().nonempty('Follower ID can not be empty'),
  followedId: z.string().nonempty('Followed ID can not be empty'),
  follower: userSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
  }),
  followed: userSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
  }),
  status: z.enum(FollowRequestStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const followRequestBaseSchema = z.object({
  followedUserEmail: z.email('Followed user email bust be a valid email'),
});

export const proccessFollowRequestSchema = z.object({
  action: z.enum(FollowRequestProcessingAction),
});

export const findManyFollowRequestsSchema =
  createPaginationParamsSchema(followRequestSchema);

// Type

export type FollowRequestDto = z.infer<typeof followRequestSchema>;
export type FollowBaseRequestDto = z.infer<typeof followRequestBaseSchema>;
