export interface IBadRequestAppException {
  status: string;
  isOperational: boolean;
  statusCode: number;
  message: string;
}
