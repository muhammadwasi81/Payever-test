import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../interfaces/user.interface';
import { User as UserEntity } from 'src/domain/user/user.entity';
import { User, UserDocument } from '../../schema/schema.user';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      const createdUser = new this.userModel(user);
      const savedUser = await createdUser.save();
      return this.mapToEntity(savedUser);
    } catch (error) {
      throw error;
    }
  }

  async findAll(): Promise<UserEntity[]> {
    try {
      const users = await this.userModel.find().exec();
      return users.map((user) => this.mapToEntity(user));
    } catch (error) {
      throw error;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.userModel.findById(id).exec();
      return user ? this.mapToEntity(user) : null;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    userUpdate: Partial<UserEntity>,
  ): Promise<UserEntity | null> {
    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, userUpdate, { new: true })
        .exec();
      return updatedUser ? this.mapToEntity(updatedUser) : null;
    } catch (error) {
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.userModel.findByIdAndDelete(id).exec();
    } catch (error) {
      throw error;
    }
  }

  private mapToEntity(document: UserDocument): UserEntity {
    const { _id, firstName, lastName, email } = document;
    return new UserEntity(firstName, lastName, email, _id.toString());
  }
}
