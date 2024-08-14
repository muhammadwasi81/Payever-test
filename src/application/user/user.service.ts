import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import mongoose from 'mongoose';
import * as path from 'path';
import { firstValueFrom } from 'rxjs';
import { User } from 'src/domain/user/user.entity';
import { NodemailerService } from 'src/infrastructure/emaill/nodemailer.service';
import { RabbitMQService } from 'src/infrastructure/messaging/rabbitmq.service';
import { IUserRepository } from 'src/infrastructure/repository/interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly avatarDir = path.join(__dirname, '..', '..', 'avatars');

  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
    private readonly rabbitMQService: RabbitMQService,
    private readonly nodemailerService: NodemailerService,
    private readonly httpService: HttpService,
  ) {
    fs.mkdir(this.avatarDir, { recursive: true }).catch((err) => {
      this.logger.error(`Failed to create avatar directory: ${err.message}`);
    });
  }

  async create(user: User): Promise<User> {
    try {
      const createdUser = await this.userRepository.create(user);

      await this.nodemailerService.sendDummyMail(
        createdUser.email,
        'Welcome to Our Platform',
        `Hello ${createdUser.firstName} ${createdUser.lastName},\n\nWelcome to our platform! We're excited to have you on board.`,
        `<h1>Welcome, ${createdUser.firstName} ${createdUser.lastName}!</h1><p>We're excited to have you on board.</p>`,
      );

      await this.rabbitMQService.sendMessage('user.created', {
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        email: createdUser.email,
        avatar: createdUser.avatar,
      });

      return createdUser;
    } catch (error) {
      this.handleError(error, 'Error creating user');
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.findAll();
    } catch (error) {
      this.handleError(error, 'Error fetching users');
    }
  }

  async findById(id: string): Promise<User> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return user;
    } catch (error) {
      this.handleError(error, `Error fetching user with id ${id}`);
    }
  }

  async findByIdExternal(id: string): Promise<User> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`https://reqres.in/api/users/${id}`),
      );

      if (response.data && response.data.data) {
        const userData = response.data.data;

        return new User(
          id,
          userData.first_name,
          userData.last_name,
          userData.email,
          userData.avatar,
        );
      } else {
        throw new NotFoundException(
          `User with id ${id} not found in external API`,
        );
      }
    } catch (error) {
      this.handleError(
        error,
        `Error fetching user with id ${id} from external API`,
      );
    }
  }

  async getUserAvatar(userId: string, source?: string): Promise<string> {
    try {
      let user: User;

      if (source === 'external') {
        user = await this.userRepository.findByExternalId(userId);
      } else {
        user = await this.userRepository.findById(userId);
      }

      if (user && user.avatarBase64) {
        return user.avatarBase64;
      }

      if (!user && source === 'external') {
        const externalUser = await this.findByIdExternal(userId);

        const existingUser = await this.userRepository.findByEmail(
          externalUser.email,
        );

        if (existingUser) {
          user = await this.userRepository.update(existingUser.id, {
            externalId: userId,
            avatar: externalUser.avatar,
          });
        } else {
          user = await this.userRepository.create(externalUser);
        }
      }

      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }

      if (!user.avatarBase64) {
        if (!user.avatar) {
          throw new NotFoundException(
            `Avatar URL not found for user with id ${userId}`,
          );
        }

        const response = await firstValueFrom(
          this.httpService.get(user.avatar, { responseType: 'arraybuffer' }),
        );

        const buffer = Buffer.from(response.data, 'binary');
        const base64 = buffer.toString('base64');
        const hash = crypto.createHash('md5').update(buffer).digest('hex');
        const filePath = path.join(this.avatarDir, `${hash}.jpg`);

        await fs.writeFile(filePath, buffer);

        user = await this.userRepository.updateAvatar(user.id, hash, base64);
      }

      return user.avatarBase64;
    } catch (error) {
      this.handleError(
        error,
        `Error fetching avatar for user with id ${userId}`,
      );
    }
  }

  async update(id: string, userUpdate: Partial<User>): Promise<User> {
    try {
      const updatedUser = await this.userRepository.update(id, userUpdate);
      if (!updatedUser) {
        throw new NotFoundException(`User with id ${id} not found`);
      }
      return updatedUser;
    } catch (error) {
      this.handleError(error, `Error updating user with id ${id}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.userRepository.delete(id);
    } catch (error) {
      this.handleError(error, `Error deleting user with id ${id}`);
    }
  }

  private handleError(error: any, message: string): never {
    this.logger.error(`${message}: ${error.message}`, error.stack);

    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException ||
      error instanceof InternalServerErrorException
    ) {
      throw error;
    }

    if (error.response && error.response.status === 404) {
      throw new NotFoundException('User not found');
    }

    throw new InternalServerErrorException('An unexpected error occurred');
  }

  private formatValidationError(error: mongoose.Error.ValidationError): string {
    const errors = Object.values(error.errors).map(
      (err) => err.message as string,
    );
    return `Validation failed: ${errors.join(', ')}`;
  }
}
