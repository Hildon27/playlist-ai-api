import { z } from 'zod';
import { Privacity } from '../Enums';
import {
  createPaginatedResultSchema,
  createPaginationParamsSchema,
} from '@/lib/pagination';

// Schemas

export const userSchema = z.object({
  id: z.string().nonempty(),
  firstName: z.string().nonempty('First name can not be empty'),
  lastName: z.string().nonempty('Last name can not be empty'),
  email: z.email('Email must be a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
  privacity: z.enum(Privacity),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const readUserSchema = userSchema.omit({
  password: true,
});

export const createUserSchema = userSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
  privacity: true,
});

export const updateUserSchema = createUserSchema
  .omit({
    password: true,
  })
  .partial();

export const findManyUsersRequestSchema =
  createPaginationParamsSchema(readUserSchema);

// Types

export type UserResponseDTO = z.infer<typeof readUserSchema>;
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
