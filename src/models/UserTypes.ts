import { Privacity } from './Enums';

// export interface CreateUserDTO {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   privacity: Privacity;
// }

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  email?: string;
  privacity?: Privacity;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  privacity: Privacity;
  createdAt: Date;
  updatedAt: Date;
}
