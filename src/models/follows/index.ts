import { createPaginationParamsSchema } from '@/lib/pagination';
import z from 'zod';
import { userSchema } from '../users';

export const followSchema = z.object({
  id: z.string().nonempty(),
  followerId: z.string().nonempty('Follower ID can not be empty'),
  followedId: z.string().nonempty('Followed ID can not be empty'),
  createdAt: z.date(),
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
});

export const findManyFollowsRequestSchema =
  createPaginationParamsSchema(followSchema);

// Types

export type FollowDto = z.infer<typeof followSchema>;
