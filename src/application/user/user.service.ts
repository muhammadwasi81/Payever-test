import { Injectable } from '@nestjs/common';
import { IUserRepository } from 'src/infrastructure/repository/interfaces';
import { User } from 'src/domain/user/user.entity';

@Injectable()
export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async createUser(user: User): Promise<User> {
    return this.userRepository.create(user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  async updateUser(id: string, user: Partial<User>): Promise<User> {
    return this.userRepository.update(id, user);
  }

  async deleteUser(id: string): Promise<void> {
    return this.userRepository.delete(id);
  }
}
