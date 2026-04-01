import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString } from 'class-validator';

export class BulkDeleteCardsDto {
  @ApiProperty({ type: [String], example: ['card-1', 'card-2'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[];
}
