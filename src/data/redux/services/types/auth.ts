// types/auth.ts

// Request types
export interface RegisterUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// Response types
export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      _id: string;
      name: string;
      email: string;
      role: string;
    };
  };
}

export interface GenericResponse {
  message: string;
}
