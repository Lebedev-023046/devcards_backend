import { IsBoolean, IsOptional, IsString, IsArray } from 'class-validator';

export class ReviewCardDto {
  @IsOptional()
  @IsBoolean()
  viewed?: boolean;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  answers?: string[];
}
