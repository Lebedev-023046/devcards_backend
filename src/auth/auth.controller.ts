import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignInDto, SignUpDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { DevSignInDto } from './dto/dev-signin.dto';
import { JwtGuard } from './guards/jwt.guard';

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

  @Post('dev-signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fake auth for frontend practice flows',
    operationId: 'devSignin',
  })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  devSignin(@Body() dto: DevSignInDto): Promise<AuthResponseDto> {
    return this.authService.devSignin(dto);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Get current authenticated user',
    operationId: 'getAuthMe',
  })
  @ApiResponse({ status: 200, description: 'Authenticated user profile' })
  me(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
