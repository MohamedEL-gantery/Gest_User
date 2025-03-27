import { IBadRequestAppException } from "./interfaces/index";

export class BadRequestAppException
  extends Error
  implements IBadRequestAppException
{
  public status: string;
  public isOperational: boolean;
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.stack = new Error().stack;
    Error.captureStackTrace(this, this.constructor);
  }

  static handle(error: unknown): BadRequestAppException {
    if (error instanceof BadRequestAppException) {
      return error;
    }
    return new BadRequestAppException("Something went wrong", 500);
  }
}
