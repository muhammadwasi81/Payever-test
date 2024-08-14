import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { UserService } from './user.service';
import { IUserRepository } from '@/infrastructure/repository/interfaces/user.interface';
import { RabbitMQService } from '@/infrastructure/messaging/rabbitmq.service';
import { NodemailerService } from '@/infrastructure/emaill/nodemailer.service';
import { User } from '@/domain/user/user.entity';
import { NotFoundException } from '@nestjs/common';
import { AxiosResponse } from 'axios';

describe('UserService', () => {
  let userService: UserService;
  let userRepository: jest.Mocked<IUserRepository>;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: 'IUserRepository',
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findByEmail: jest.fn(),
            findByExternalId: jest.fn(),
            updateAvatar: jest.fn(),
          },
        },
        {
          provide: RabbitMQService,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: NodemailerService,
          useValue: {
            sendDummyMail: jest.fn(),
          },
        },
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get(
      'IUserRepository',
    ) as jest.Mocked<IUserRepository>;
    httpService = module.get(HttpService) as jest.Mocked<HttpService>;
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const user = new User(undefined, 'John', 'Doe', 'john@example.com');
      const createdUser = new User('1', 'John', 'Doe', 'john@example.com');
      userRepository.create.mockResolvedValue(createdUser);

      const result = await userService.create(user);

      expect(result).toEqual(createdUser);
      expect(userRepository.create).toHaveBeenCalledWith(user);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [
        new User('1', 'John', 'Doe', 'john@example.com'),
        new User('2', 'Jane', 'Doe', 'jane@example.com'),
      ];
      userRepository.findAll.mockResolvedValue(users);

      const result = await userService.findAll();

      expect(result).toEqual(users);
      expect(userRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const user = new User('1', 'John', 'Doe', 'john@example.com');
      userRepository.findById.mockResolvedValue(user);

      const result = await userService.findById('1');

      expect(result).toEqual(user);
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.findById('1')).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('findByIdExternal', () => {
    it('should return a user from external API', async () => {
      const externalUser = {
        id: '1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        avatar: 'http://example.com/avatar.jpg',
      };

      const mockResponse: AxiosResponse = {
        data: { data: externalUser },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await userService.findByIdExternal('1');

      expect(result).toBeInstanceOf(User);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.avatar).toBe('http://example.com/avatar.jpg');
      expect(httpService.get).toHaveBeenCalledWith(
        'https://reqres.in/api/users/1',
      );
    });

    it('should throw NotFoundException if user not found in external API', async () => {
      const mockResponse: AxiosResponse = {
        data: {},
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: {} as any,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      await expect(userService.findByIdExternal('1')).rejects.toThrow(
        NotFoundException,
      );
      expect(httpService.get).toHaveBeenCalledWith(
        'https://reqres.in/api/users/1',
      );
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const userId = '1';
      userRepository.delete.mockResolvedValue(undefined);

      await userService.delete(userId);

      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });

    it('should throw an error if deletion fails', async () => {
      const userId = '1';
      const error = new Error('Deletion failed');
      userRepository.delete.mockRejectedValue(error);

      await expect(userService.delete(userId)).rejects.toThrow(
        'An unexpected error occurred',
      );
      expect(userRepository.delete).toHaveBeenCalledWith(userId);
    });
  });
});
