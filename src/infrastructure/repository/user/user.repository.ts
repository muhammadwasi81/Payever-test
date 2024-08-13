import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../interfaces';
import { User as UserEntity } from 'src/domain/user/user.entity';
import { User, UserDocument } from '../../schema/schema.user';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(user: UserEntity): Promise<UserEntity> {
    const createdUser = new this.userModel(user);
    const savedUser = await createdUser.save();
    return this.mapToEntity(savedUser);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => this.mapToEntity(user));
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.mapToEntity(user) : null;
  }

  async update(
    id: string,
    userUpdate: Partial<UserEntity>,
  ): Promise<UserEntity> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, userUpdate, { new: true })
      .exec();
    return updatedUser ? this.mapToEntity(updatedUser) : null;
  }

  async delete(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  private mapToEntity(document: UserDocument): UserEntity {
    const { _id, name, email, age } = document;
    return new UserEntity(name, email, age, _id.toString());
  }
}
