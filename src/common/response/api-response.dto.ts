import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty({ required: false })
  message?: string;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty()
  statusCode: number;

  data: T;
}
