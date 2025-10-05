import { Module } from '@nestjs/common';

import { DriversModule } from './drivers/drivers.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [DriversModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
