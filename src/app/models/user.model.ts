export interface UserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
}
