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
});

export const createUserSchema = userSchema.omit({
  id: true,
});

export const updateUserSchema = userSchema
  .omit({
    id: true,
    password: true,
  })
  .partial();

// Types

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
