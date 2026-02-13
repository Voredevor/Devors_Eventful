export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: "creator" | "eventee";
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  success: true;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    userType: "creator" | "eventee";
    verified: boolean;
    profilePictureUrl?: string;
    createdAt: string;
  };
  token: string;
  refreshToken: string;
}

export interface RefreshTokenDTO {
  success: true;
  token: string;
}

export interface VerifyEmailDTO {
  token: string;
}

export interface ForgotPasswordDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}
