import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    signup: jest.fn(),
    signin: jest.fn(),
    devSignin: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
    toAuthResponseDto: jest.fn(),
    getMe: jest.fn(),
  };

  const createResponseMock = (): Pick<Response, 'cookie' | 'clearCookie'> => ({
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('sets refresh token in HttpOnly cookie and returns token with user on signin', async () => {
    authServiceMock.signin.mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: {
        id: 'user-id',
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    authServiceMock.toAuthResponseDto.mockReturnValue({
      token: 'access-token',
      user: {
        id: 'user-id',
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        role: 'USER',
      },
    });

    const res = createResponseMock();
    const result = await controller.signin(
      {
        email: 'user@example.com',
        password: 'P@ssw0rd!',
      },
      res as Response,
    );

    expect(result).toEqual({
      token: 'access-token',
      user: {
        id: 'user-id',
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    expect(result).not.toHaveProperty('refresh_token');
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/auth',
      }),
    );
  });

  it('forwards age to signup service and sets refresh token cookie', async () => {
    authServiceMock.signup.mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: {
        id: 'user-id',
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    authServiceMock.toAuthResponseDto.mockReturnValue({
      token: 'access-token',
      user: {
        id: 'user-id',
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        role: 'USER',
      },
    });

    const res = createResponseMock();
    const result = await controller.signup(
      {
        name: 'John Doe',
        email: 'user@example.com',
        password: 'P@ssw0rd!',
        age: 25,
      },
      res as Response,
    );

    expect(authServiceMock.signup).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'user@example.com',
      password: 'P@ssw0rd!',
      age: 25,
    });
    expect(result).toEqual({
      token: 'access-token',
      user: {
        id: 'user-id',
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/auth',
      }),
    );
  });

  it('reads refresh token from cookie header and rotates it on refresh', async () => {
    authServiceMock.refresh.mockResolvedValue({
      access_token: 'rotated-access-token',
      refresh_token: 'rotated-refresh-token',
      user: {
        id: 'user-id',
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    authServiceMock.toAuthResponseDto.mockReturnValue({
      token: 'rotated-access-token',
      user: {
        id: 'user-id',
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        role: 'USER',
      },
    });

    const req = {
      headers: {
        cookie: 'refresh_token=current-refresh-token; other_cookie=value',
      },
    } as Request;
    const res = createResponseMock();

    const result = await controller.refresh(req, res as Response);

    expect(authServiceMock.refresh).toHaveBeenCalledWith(
      'current-refresh-token',
    );
    expect(result).toEqual({
      token: 'rotated-access-token',
      user: {
        id: 'user-id',
        name: 'John Doe',
        age: 25,
        email: 'user@example.com',
        role: 'USER',
      },
    });
    expect(result).not.toHaveProperty('refresh_token');
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'rotated-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/auth',
      }),
    );
  });
});
