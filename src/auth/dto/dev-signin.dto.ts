import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';

export class DevSignInDto {
  @ApiProperty({
    example: 'admin@example.com',
    description: 'Stable identity for fake auth flows',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Admin Demo',
    description: 'Display name for the session',
  })
  @MinLength(4)
  name: string;

  @ApiPropertyOptional({
    enum: Role,
    example: Role.ADMIN,
    default: Role.USER,
    description: 'Role used for frontend permission scenarios',
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
