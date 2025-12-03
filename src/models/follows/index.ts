import z from "zod";

// Schemas

export const followSchema = z.object({
  id: z.string().nonempty(),
  followerId: z.string().nonempty('Follower ID can not be empty'),
  followedId: z
    .string()
    .nonempty('Followed ID can not be empty'),
  createdAt: z.date(),
});

// Types

export type Follow = z.infer<typeof followSchema>;