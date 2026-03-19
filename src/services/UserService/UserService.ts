import { PaginatedResult, PaginationParams } from '@/lib/pagination';
import { CreateUserDTO, UserResponseDTO } from '@/models/users';

export interface UserService {
  findAllPublicWithFollowInfo(
    params: PaginationParams<UserResponseDTO>,
    loggedUserId: string
  ): Promise<PaginatedResult<UserResponseDTO>>;
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
