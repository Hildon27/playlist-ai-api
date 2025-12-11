import { CreateUserDTO, UserResponseDTO } from '@/models/users';

export interface UserService {
  create(data: CreateUserDTO): Promise<UserResponseDTO>;
  findById(id: string): Promise<UserResponseDTO | null>;
  findAll(): Promise<UserResponseDTO[]>;
  update(
    id: string,
    data: Partial<CreateUserDTO>
  ): Promise<UserResponseDTO | null>;
  delete(id: string): Promise<void>;
}
