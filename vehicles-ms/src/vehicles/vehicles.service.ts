import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { estimateAverageConsumption } from '../utils/consumption';

@Injectable()
export class VehiclesService {
  private prisma = new PrismaClient();
  private readonly logger = new Logger('VehiclesService');

  async onModuleInit() {
    try {
      await this.prisma.$connect();
      this.logger.log('Database connected in VehiclesService');
    } catch (err) {
      this.logger.error('Error connecting to DB', err);
    }
  }

  async getAllVehicles() {
    return this.prisma.vehicle.findMany();
  }

  async getVehicleById(id: number) {
    return this.prisma.vehicle.findUnique({ where: { id } });
  }

  async createVehicle(data: CreateVehicleDto) {
  const existingVehicle = await this.prisma.vehicle.findUnique({
    where: { plate: data.plate },
  })

  if(existingVehicle){
      throw new RpcException(`La placa "${data.plate}" ya está registrada.`);
  }
    const engineTypeMap = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'];
    const machineryTypeMap = ['LIGHT', 'HEAVY'];

    const vehicleData = {
      ...data,
      engineType: engineTypeMap[data.engineType],
      machineryType: machineryTypeMap[data.machineryType],
      averageConsumption: estimateAverageConsumption(
        machineryTypeMap[data.machineryType] as 'LIGHT' | 'HEAVY',
        engineTypeMap[data.engineType] as 'GASOLINE' | 'DIESEL' | 'ELECTRIC' | 'HYBRID',
        data.engineDisplacement,
        data.year,
      ),
    };

    return this.prisma.vehicle.create({ data: vehicleData });
  }

  async updateVehicle(id: number, data: UpdateVehicleDto) {
    return this.prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async deleteVehicle(id: number) {
    return this.prisma.vehicle.delete({ where: { id } });
  }
}
