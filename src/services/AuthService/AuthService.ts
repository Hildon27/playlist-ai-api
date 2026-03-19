import { CreateUserDTO, UserResponseDTO } from '@/models/users';

export interface AuthResult {
  user: UserResponseDTO;
  token: string;
}

export interface AuthService {
  register(data: CreateUserDTO): Promise<UserResponseDTO>;
  authenticate(email: string, password: string): Promise<AuthResult>;
}
