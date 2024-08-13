import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
      meta: {
        timestamp: new Date().toISOString(),
        path: ctx.getRequest().url,
      },
    };

    response.status(status).json(errorResponse);
  }
}
