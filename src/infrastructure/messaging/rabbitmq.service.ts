import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async sendMessage(pattern: string, data: any) {
    try {
      return this.client.emit(pattern, data);
    } catch (error) {
      console.error('Error sending message to RabbitMQ:', error);
      throw error;
    }
  }
}
