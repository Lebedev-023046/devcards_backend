import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto/auth-request.dto';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import { DevSignInDto } from './dto/dev-signin.dto';

type AuthTokens = {
  access_token: string;
  refresh_token: string;
};

type AuthPayload = AuthTokens & {
  user: AuthUserDto;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup({
    name,
    email,
    password,
    age,
  }: SignUpDto): Promise<AuthPayload> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    const userName = name?.trim() || `user${randomUUID().split('-').pop()}`;
    const hashed = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: userName,
        email,
        password: hashed,
        age,
      },
    });

    return this.issueTokens(user);
  }

  async signin({ email, password }: SignInDto): Promise<AuthPayload> {
    const user = await this.prisma.user.findUnique({ where: { email } });

    const isPasswordMatch = await bcrypt.compare(
      password,
      user?.password ?? '',
    );

    if (!user || !isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async devSignin({
    email,
    name,
    role = Role.USER,
  }: DevSignInDto): Promise<AuthPayload> {
    const password = await bcrypt.hash(`dev-${email}`, 10);

    const user = await this.prisma.user.upsert({
      where: { email },
      update: {
        name,
        role,
      },
      create: {
        email,
        name,
        age: 18,
        role,
        password,
      },
    });

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthPayload> {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: this.hashRefreshToken(refreshToken) },
      include: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.revokedAt ||
      tokenRecord.expiresAt <= new Date()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens(tokenRecord.user);
  }

  async logout(refreshToken?: string): Promise<void> {
    if (!refreshToken) {
      return;
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        tokenHash: this.hashRefreshToken(refreshToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        age: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  toAuthResponseDto(payload: AuthPayload): AuthResponseDto {
    return {
      token: payload.access_token,
      user: payload.user,
    };
  }

  private async issueTokens(
    user: Pick<User, 'id' | 'email' | 'role' | 'name'> & {
      age?: number | null;
    },
  ): Promise<AuthPayload> {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: user.id,
        OR: [{ revokedAt: { not: null } }, { expiresAt: { lte: new Date() } }],
      },
    });

    const refresh_token = randomBytes(48).toString('hex');

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashRefreshToken(refresh_token),
        expiresAt: this.getRefreshTokenExpiryDate(),
        userId: user.id,
      },
    });

    return {
      access_token: this.signToken(user),
      refresh_token,
      user: this.toAuthUserDto(user),
    };
  }

  private signToken(
    user: Pick<User, 'id' | 'email' | 'role' | 'name'>,
  ): string {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };
    return this.jwt.sign(payload);
  }

  private hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private getRefreshTokenExpiryDate(): Date {
    const ttlDays = Number(process.env.REFRESH_TOKEN_EXPIRES_IN_DAYS ?? '30');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + ttlDays);
    return expiresAt;
  }

  private toAuthUserDto(
    user: Pick<User, 'id' | 'email' | 'role' | 'name'> & {
      age?: number | null;
    },
  ): AuthUserDto {
    return {
      id: user.id,
      name: user.name,
      age: user.age ?? 18,
      email: user.email,
      role: user.role,
    };
  }
}
