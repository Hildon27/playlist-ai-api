import { UserResponse, CreateUserDTO } from '../../models/UserTypes';

export interface UserService {
  create(data: CreateUserDTO): Promise<UserResponse>;
  findById(id: string): Promise<UserResponse | null>;
  findAll(): Promise<UserResponse[]>;
  update(
    id: string,
    data: Partial<CreateUserDTO>
  ): Promise<UserResponse | null>;
  delete(id: string): Promise<void>;
}
