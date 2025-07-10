import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Request successful' })
  message: string;

  @ApiProperty({ example: 200 })
  statusCode: number;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty()
  data: T;
}
