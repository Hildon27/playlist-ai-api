import z from 'zod';
import { FollowRequestProcessingAction, FollowRequestStatus } from '../Enums';

// Schemas

export const followRequestSchema = z.object({
  id: z.string().nonempty(),
  followerId: z.string().nonempty('Follower ID can not be empty'),
  followedId: z
    .string()
    .nonempty('Followed ID can not be empty'),
  status: z.enum(FollowRequestStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const followRequestBaseSchema = z.object({
  followerId: z.string().nonempty('Follower ID can not be empty'),
  followedUserEmail: z.email(
    'Followed user email bust be a valid email'
  ),
});

export const cancelFollowRequestSchema = followRequestSchema.pick({
  followerId: true,
});

export const proccessFollowRequestSchema = followRequestSchema
  .pick({
    followedId: true,
  })
  .extend({
    action: z.enum(FollowRequestProcessingAction),
  });

// Type

export type FollowRequestDto = z.infer<typeof followRequestSchema>;
export type FollowBaseRequestDto = z.infer<typeof followRequestBaseSchema>;
