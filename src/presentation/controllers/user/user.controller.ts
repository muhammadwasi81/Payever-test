import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserService } from '@/application/user/user.service';
import { User } from '@/domain/user/user.entity';
import {
  CreateUserDto,
  UpdateUserDto,
} from '@/presentation/dtos/create-user.dto';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    const user = new User(
      null,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.email,
      createUserDto.avatar,
    );
    return this.userService.create(user);
  }

  @Get()
  async getAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async getUserById(
    @Param('id') id: string,
    @Query('source') source?: string,
  ): Promise<User> {
    if (source === 'external') {
      return this.userService.findByIdExternal(id);
    }
    return this.userService.findById(id);
  }

  @Get(':userId/avatar')
  async getUserAvatar(
    @Param('userId') userId: string,
    @Query('source') source?: string,
  ): Promise<{ avatar: string }> {
    try {
      const base64Avatar = await this.userService.getUserAvatar(userId, source);
      return { avatar: base64Avatar };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching user avatar');
    }
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':userId/avatar')
  async deleteUserAvatar(@Param('userId') userId: string): Promise<void> {
    await this.userService.deleteUserAvatar(userId);
  }
}
