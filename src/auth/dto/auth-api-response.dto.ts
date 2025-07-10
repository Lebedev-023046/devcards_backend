import { ApiProperty } from '@nestjs/swagger';

import { AuthResponseDto } from './auth-response.dto';
import { ApiResponseDto } from 'src/common/dto/api-response.dto';

export class AuthApiResponseDto extends ApiResponseDto<AuthResponseDto> {
  @ApiProperty({ type: AuthResponseDto })
  declare data: AuthResponseDto;
}
