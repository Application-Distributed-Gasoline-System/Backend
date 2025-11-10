import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { UpdateFuelDto } from './dto/update-fuel.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class FuelService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    console.log('FuelService conectado a MongoDB');
  }

  async createFuel(createFuelDto: CreateFuelDto) {
    const record =  await this.fuelRecord.create({
    data: {
      driverId: createFuelDto.driverId,
      vehicleId: createFuelDto.vehicleId,
      routeId: createFuelDto.routeId,
      liters: createFuelDto.liters,
      fuelType: createFuelDto.fuelType,
      machineryType: createFuelDto.machineryType,
      gpsLocation: createFuelDto.gpsLocation,
      createdBy: createFuelDto.userId,
    },
  });

    return {
      message: 'Fuel record created successfully check db atlas',
      record,
    };
  }

  findAll() {
    return `This action returns all fuel`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fuel`;
  }

  updateFuelRecord(id: string, updateFuelDto: UpdateFuelDto) {
    return { id, updateFuelDto}
  }

  remove(id: number) {
    return `This action removes a #${id} fuel`;
  }
}
