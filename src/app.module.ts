import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import mongodbConfig from './infrastructure/config/mongodb.config';
import rabbitmqConfig from './infrastructure/config/rabbitmq.config';
import nodemailerConfig from './infrastructure/config/nodemailer.config';
import { RabbitMQModule } from './infrastructure/messaging/rabbitmq.module';
import { UserController } from './presentation/controllers/user/user.controller';
import { UserService } from './application/user/user.service';
import { UserRepository } from './infrastructure/repository/user/user.repository';
import { User, UserSchema } from './infrastructure/schema/schema.user';
import { NodemailerService } from './infrastructure/emaill/nodemailer.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [mongodbConfig, rabbitmqConfig, nodemailerConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('mongodb.uri'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    RabbitMQModule,
    HttpModule,
  ],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    NodemailerService,
  ],
})
export class AppModule {}
