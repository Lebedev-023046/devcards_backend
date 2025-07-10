import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, type: AuthResponseDto })
  signup(@Body() dto: AuthDto): Promise<AuthResponseDto> {
    return this.authService.signup(dto.email, dto.password);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, type: AuthResponseDto })
  signin(@Body() dto: AuthDto): Promise<AuthResponseDto> {
    return this.authService.signin(dto.email, dto.password);
  }
}
