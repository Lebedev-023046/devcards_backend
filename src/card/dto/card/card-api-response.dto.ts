import { ApiResponseDto } from 'src/common/response/api-response.dto';
import { ApiProperty } from '@nestjs/swagger';
import { CardDto } from './card-request.dto';

export class CardApiResponseDto extends ApiResponseDto<CardDto> {
  @ApiProperty({ type: CardDto })
  declare data: CardDto;
}
