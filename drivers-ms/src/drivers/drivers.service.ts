import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('DriversService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('La base de datos esta conectada');
  }

  async getAllDrivers() {
    return this.driver.findMany(); // Prisma ya sabe que devuelve Driver[]
  }

  async getDriverById(id: string) {
    return this.driver.findUnique({ where: { id } });
  }

  async createDriver(data: CreateDriverDto) {
    return this.driver.create({ data });
  }

  async updateDriver(id: string, data: UpdateDriverDto) {
    return this.driver.update({ where: { id }, data });
  }

  async deleteDriver(id: string) {
    return this.driver.delete({ where: { id } });
  }
}
