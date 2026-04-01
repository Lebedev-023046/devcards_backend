import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsBoolean, IsString } from 'class-validator';

export class BulkUpdateDeckVisibilityDto {
  @ApiProperty({ type: [String], example: ['deck-1', 'deck-2'] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids: string[];

  @ApiProperty({ example: false })
  @IsBoolean()
  isPublic: boolean;
}
