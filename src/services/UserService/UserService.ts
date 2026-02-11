import { PaginatedResult, PaginationParams } from '@/lib/pagination';
import { CreateUserDTO, UserResponseDTO } from '@/models/users';

export interface UserService {
  findAll(
    params: PaginationParams<UserResponseDTO>
  ): Promise<PaginatedResult<UserResponseDTO>>;
  findById(id: string): Promise<UserResponseDTO | null>;
  update(
    id: string,
    data: Partial<CreateUserDTO>
  ): Promise<UserResponseDTO | null>;
  delete(id: string): Promise<void>;
}
