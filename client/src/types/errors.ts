export interface AppError {
  message: string;
  fieldErrors?: Record<string, string>;
  statusCode?: number;
}
