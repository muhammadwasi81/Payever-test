import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { User } from 'src/domain/user/user.entity';
import { IUserRepository } from 'src/infrastructure/repository/interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @Inject('IUserRepository')
    private userRepository: IUserRepository,
  ) {}

  async create(user: User): Promise<User> {
    try {
      return await this.userRepository.create(user);
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

    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof Error && error.name === 'ValidationError') {
      throw new BadRequestException(this.formatValidationError(error as any));
    }

    if (error instanceof Error && error.name === 'CastError') {
      throw new BadRequestException('Invalid ID format');
    }

    if (error.code === 11000) {
      throw new BadRequestException('A user with this email already exists');
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
