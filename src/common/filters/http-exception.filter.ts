import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

type ErrorResponseBody = {
  message?: string | string[];
  error?: string;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const res = isHttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    const body: ErrorResponseBody =
      typeof res === 'string' ? { message: res } : (res as ErrorResponseBody);
    const message = body.message ?? 'Internal server error';
    const error = body.error ?? HttpStatus[status];

    response.status(status).json({
      success: false,
      data: null,
      message,
      error,
      statusCode: status,
    });
  }
}
