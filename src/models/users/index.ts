import { z } from 'zod';
import { Privacity } from '../Enums';

// Schemas

export const userSchema = z.object({
  id: z.string().nonempty(),
  firstName: z.string().nonempty('Primeiro nome não pode ser vazio'),
  lastName: z.string().nonempty('Segundo nome não pode ser vazio'),
  email: z.email('Email deve ser um email válido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
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

// Types

export type UserResponseDTO = z.infer<typeof readUserSchema>;
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
