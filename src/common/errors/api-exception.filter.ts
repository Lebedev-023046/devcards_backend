import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

const BAD_REQUEST_STATUS = 400;
const UNAUTHORIZED_STATUS = 401;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const CONFLICT_STATUS = 409;
const SERVER_ERROR_STATUS = 500;

type ExceptionResponse =
  | string
  | {
      error?: string;
      message?: string | string[];
      code?: string;
      details?: unknown;
    };

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status = this.getStatus(exception);
    const exceptionResponse = this.getExceptionResponse(exception);

    response.status(status).json({
      code: this.getCode(exceptionResponse, status),
      message: this.getMessage(exceptionResponse, status),
      details: this.getDetails(exceptionResponse),
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getExceptionResponse(exception: unknown): ExceptionResponse {
    if (exception instanceof HttpException) {
      return exception.getResponse() as ExceptionResponse;
    }

    return {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
    };
  }

  private getCode(
    exceptionResponse: ExceptionResponse,
    status: number,
  ): string {
    if (typeof exceptionResponse === 'object' && exceptionResponse.code) {
      return exceptionResponse.code;
    }

    switch (status) {
      case BAD_REQUEST_STATUS:
        return 'BAD_REQUEST';
      case UNAUTHORIZED_STATUS:
        return 'UNAUTHORIZED';
      case FORBIDDEN_STATUS:
        return 'FORBIDDEN';
      case NOT_FOUND_STATUS:
        return 'NOT_FOUND';
      case CONFLICT_STATUS:
        return 'CONFLICT';
      default:
        return status >= SERVER_ERROR_STATUS
          ? 'INTERNAL_SERVER_ERROR'
          : 'HTTP_ERROR';
    }
  }

  private getMessage(
    exceptionResponse: ExceptionResponse,
    status: number,
  ): string {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    if (Array.isArray(exceptionResponse.message)) {
      return status === BAD_REQUEST_STATUS
        ? 'Request validation failed'
        : exceptionResponse.message.join(', ');
    }

    if (exceptionResponse.message) {
      return exceptionResponse.message;
    }

    return status >= SERVER_ERROR_STATUS
      ? 'Internal server error'
      : 'Request failed';
  }

  private getDetails(exceptionResponse: ExceptionResponse): unknown {
    if (typeof exceptionResponse !== 'object') {
      return undefined;
    }

    if (exceptionResponse.details) {
      return exceptionResponse.details;
    }

    if (Array.isArray(exceptionResponse.message)) {
      return {
        errors: exceptionResponse.message,
      };
    }

    return undefined;
  }
}
