import { BadRequestException, HttpStatus } from '@nestjs/common';
import { ApiExceptionFilter } from './api-exception.filter';

type ResponseBody = {
  code: string;
  message: string;
  details?: unknown;
  path: string;
  timestamp: string;
};

describe('ApiExceptionFilter', () => {
  it('returns stable error response shape for HTTP exceptions', () => {
    const json = jest.fn<void, [ResponseBody]>();
    const status = jest.fn<{ json: typeof json }, [number]>().mockReturnValue({
      json,
    });
    const host = {
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url: '/cards' }),
      }),
    };

    new ApiExceptionFilter().catch(
      new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: {
          fieldErrors: { question: ['question should not be empty'] },
        },
      }),
      host as never,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    const [body] = json.mock.calls[0];

    expect(body.code).toBe('VALIDATION_ERROR');
    expect(body.message).toBe('Request validation failed');
    expect(body.details).toEqual({
      fieldErrors: { question: ['question should not be empty'] },
    });
    expect(body.path).toBe('/cards');
    expect(typeof body.timestamp).toBe('string');
  });
});
