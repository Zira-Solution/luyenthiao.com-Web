export interface User {
  id: number
  role: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface RegisterInput {
  username: string
  password: string
  fullName: string
  email: string
}

export interface LoginInput {
  username: string
  password: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface ForgotPasswordInput {
  email: string
}

export interface ForgotPasswordResponse {
  message: string
}

export interface ResetPasswordInput {
  token: string
  newPassword: string
}
