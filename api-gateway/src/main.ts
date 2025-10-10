import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { envs } from './config';
import { RpcCustomExceptionFilter } from './common';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
  const logger = new Logger('Main');

  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new RpcCustomExceptionFilter());

  const authGuard = app.select(AuthModule).get(AuthGuard);
  const rolesGuard = app.select(AuthModule).get(RolesGuard);
  app.useGlobalGuards(authGuard, rolesGuard);

  await app.listen(envs.port);

  logger.log(`Api gateway ejecutandose en el puerto: ${envs.port}`);
}
bootstrap();
