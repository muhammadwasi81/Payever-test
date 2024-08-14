import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.use(helmet());

    app.enableCors();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    app.useGlobalInterceptors(new TransformInterceptor());

    app.useGlobalFilters(new HttpExceptionFilter());

    const port = process.env.PORT || 9000;
    await app.listen(port);
    Logger.log(`Application is running on: ${await app.getUrl()}`);
  } catch (error) {
    Logger.error('An error occurred during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();
