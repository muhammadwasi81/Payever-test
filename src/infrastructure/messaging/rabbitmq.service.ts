import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
  ) {}

  async sendMessage(pattern: string, data: any) {
    try {
      this.logger.log(
        `[RabbitMQ Simulation] Sending message to queue: ${pattern}`,
      );
      this.logger.log(
        `[RabbitMQ Simulation] Message content: ${JSON.stringify(data, null, 2)}`,
      );
      return this.client.emit(pattern, data);
    } catch (error) {
      this.logger.error(
        `[RabbitMQ Simulation] Error sending message to queue: ${pattern}`,
        error,
      );
      throw error;
    }
  }
}
