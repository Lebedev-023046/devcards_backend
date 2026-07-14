import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from 'src/common/dto/error-response.dto';
import { CookieOptions, Request, Response } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { SignInDto, SignUpDto } from './dto/auth-request.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { DevSignInDto } from './dto/dev-signin.dto';
import { JwtGuard } from './guards/jwt.guard';

const REFRESH_TOKEN_COOKIE = 'refresh_token';

@ApiTags('Auth')
@ApiResponse({ status: 400, type: ErrorResponseDto })
@ApiResponse({ status: 401, type: ErrorResponseDto })
@ApiResponse({ status: 404, type: ErrorResponseDto })
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    operationId: 'signup',
  })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async signup(
    @Body() dto: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const tokens = await this.authService.signup({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      age: dto.age,
    });

    this.setRefreshTokenCookie(res, tokens.refresh_token);

    return this.authService.toAuthResponseDto(tokens);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Authenticate user and return JWT',
    operationId: 'signin',
  })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async signin(
    @Body() dto: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const tokens = await this.authService.signin({
      email: dto.email,
      password: dto.password,
    });

    this.setRefreshTokenCookie(res, tokens.refresh_token);

    return this.authService.toAuthResponseDto(tokens);
  }

  @Post('dev-signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Development-only fake auth for frontend practice flows',
    description:
      'Available only when ENABLE_DEV_AUTH=true. Intended for local demo and frontend permission scenarios.',
    operationId: 'devSignin',
  })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  @ApiResponse({
    status: 403,
    description: 'Development auth is disabled',
    type: ErrorResponseDto,
  })
  async devSignin(
    @Body() dto: DevSignInDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    if (this.configService.get<string>('ENABLE_DEV_AUTH') !== 'true') {
      throw new ForbiddenException('Development auth is disabled');
    }

    const tokens = await this.authService.devSignin(dto);

    this.setRefreshTokenCookie(res, tokens.refresh_token);

    return this.authService.toAuthResponseDto(tokens);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate refresh token and return a new access token',
    operationId: 'refresh',
  })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = this.extractRefreshToken(req);
    const tokens = await this.authService.refresh(refreshToken);

    this.setRefreshTokenCookie(res, tokens.refresh_token);

    return this.authService.toAuthResponseDto(tokens);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Revoke refresh token and clear auth cookie',
    operationId: 'logout',
  })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.authService.logout(this.extractRefreshToken(req));
    this.clearRefreshTokenCookie(res);
  }

  @Get('me')
  @UseGuards(JwtGuard)
  @ApiOperation({
    summary: 'Get current authenticated user',
    operationId: 'getAuthMe',
  })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Authenticated user profile' })
  me(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }

  private extractRefreshToken(req: Request): string {
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) {
      return '';
    }

    const refreshToken = cookieHeader
      .split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${REFRESH_TOKEN_COOKIE}=`))
      ?.slice(`${REFRESH_TOKEN_COOKIE}=`.length);

    return refreshToken ?? '';
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      ...this.getRefreshTokenCookieOptions(),
      maxAge: this.getRefreshTokenCookieMaxAge(),
    });
  }

  private clearRefreshTokenCookie(res: Response): void {
    res.cookie(REFRESH_TOKEN_COOKIE, '', {
      ...this.getRefreshTokenCookieOptions(),
      expires: new Date(0),
      maxAge: 0,
    });
  }

  private getRefreshTokenCookieMaxAge(): number {
    const ttlDays = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? '30');
    return ttlDays * 24 * 60 * 60 * 1000;
  }

  private getRefreshTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite:
        process.env.REFRESH_COOKIE_SAME_SITE === 'none' ? 'none' : 'lax',
      path: '/auth',
    };
  }
}
