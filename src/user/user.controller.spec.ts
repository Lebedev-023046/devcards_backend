import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  const userServiceMock = {
    getUser: jest.fn(),
  };

  let controller: UserController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userServiceMock,
        },
      ],
    }).compile();

    controller = module.get(UserController);
  });

  it('returns private profile for current user', async () => {
    userServiceMock.getUser.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      age: 25,
      email: 'john@example.com',
      role: 'USER',
    });

    await expect(controller.getCurrentUser('user-id')).resolves.toEqual({
      id: 'user-id',
      name: 'John Doe',
      age: 25,
      email: 'john@example.com',
      role: 'USER',
    });
  });

  it('returns public profile without email and age for other users', async () => {
    userServiceMock.getUser.mockResolvedValue({
      id: 'user-id',
      name: 'John Doe',
      age: 25,
      email: 'john@example.com',
      role: 'USER',
    });

    await expect(controller.getUser('user-id')).resolves.toEqual({
      id: 'user-id',
      name: 'John Doe',
      role: 'USER',
    });
  });

  it('throws not found when user does not exist', async () => {
    userServiceMock.getUser.mockResolvedValue(null);

    await expect(controller.getUser('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
