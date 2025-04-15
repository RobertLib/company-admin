export interface AppError {
  message: string;
  fieldErrors?: Record<string, string>;
  statusCode?: number;
}

export type Role = "ADMIN" | "USER";

export interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  email: string;
  name: string | null;
  role: Role;
  resetPasswordToken?: string | null;
  resetPasswordTokenExpiry?: string | null;
}
