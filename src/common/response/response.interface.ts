export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message: string;
  error?: string;
  statusCode: number;
}
