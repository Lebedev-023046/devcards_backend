import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 'VALIDATION_ERROR' })
  code: string;

  @ApiProperty({ example: 'Request validation failed' })
  message: string;

  @ApiPropertyOptional({
    example: {
      fieldErrors: { title: ['title must be shorter than 120 characters'] },
    },
  })
  details?: unknown;

  @ApiProperty({ example: '/decks' })
  path: string;

  @ApiProperty({ example: '2026-07-14T12:00:00.000Z' })
  timestamp: string;
}
