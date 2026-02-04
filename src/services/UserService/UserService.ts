import { CreateUserDTO, UserResponseDTO } from '@/models/users';

export interface UserService {
  findAll(): Promise<UserResponseDTO[]>;
  findById(id: string): Promise<UserResponseDTO | null>;
  getLoggedUserData(): Promise<UserResponseDTO | null>;
  update(data: Partial<CreateUserDTO>): Promise<UserResponseDTO | null>;
  delete(): Promise<void>;
}
