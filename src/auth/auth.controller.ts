import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    operationId: 'signup',
  })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  signup(@Body() dto: SignUpDto): Promise<AuthResponseDto> {
    return this.authService.signup({
      name: dto.name,
      email: dto.email,
      password: dto.password,
    });
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user and return JWT',
    operationId: 'signin',
  })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  signin(@Body() dto: SignInDto): Promise<AuthResponseDto> {
    return this.authService.signin({
      email: dto.email,
      password: dto.password,
    });
  }
}
