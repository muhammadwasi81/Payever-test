import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@/common/interfaces/api-response.interface';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (
        exception instanceof BadRequestException &&
        typeof exceptionResponse === 'object'
      ) {
        const validationErrors = this.formatValidationErrors(exceptionResponse);
        errorMessage = validationErrors || 'Bad Request';
      } else {
        errorMessage = exception.message;
      }
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: errorMessage,
      meta: {
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    };

    response.status(status).json(errorResponse);
  }

  private formatValidationErrors(exceptionResponse: any): string {
    if (Array.isArray(exceptionResponse.message)) {
      return exceptionResponse.message.join(', ');
    }
    if (typeof exceptionResponse.message === 'object') {
      return Object.values(exceptionResponse.message).join(', ');
    }
    return exceptionResponse.message;
  }
}
