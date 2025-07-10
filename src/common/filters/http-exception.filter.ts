import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const res = isHttpException
      ? exception.getResponse()
      : { message: 'Internal server error' };

    const message = typeof res === 'string' ? res : (res as any).message;
    const error = typeof res === 'string' ? 'Error' : (res as any).error;

    response.status(status).json({
      success: false,
      data: null,
      message,
      error: error || HttpStatus[status],
      statusCode: status,
    });
  }
}
