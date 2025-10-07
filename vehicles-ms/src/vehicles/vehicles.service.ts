import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { estimateAverageConsumption } from '../utils/consumption';
import { GrpcStatus, PaginationDto } from 'src/common';

@Injectable()
export class VehiclesService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('VehiclesService');

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Database connected in VehiclesService');
    } catch (err) {
      this.logger.error('Error connecting to DB', err);
    }
  }

  async getAllVehicles(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto

    const skip = (page - 1) * limit

    const [data, total] = await Promise.all([
      this.vehicle.findMany({
        skip,
        take: limit,
        //orderBy: { createdAt: 'desc'},
      }),
      this.vehicle.count(),
    ])

    return {
      data, total, page, totalPages: Math.ceil(total / limit)
    }

  }

  async getVehicleById(id: number) {
    const vehicle = await this.vehicle.findUnique({ where: { id } });
    if (!vehicle) throw new RpcException({
      code: GrpcStatus.NOT_FOUND,
      message: `El vehiculo con el id: ${id} no fue encontrado.`
    });
    return vehicle;
  }

  async createVehicle(data: CreateVehicleDto) {
    const existingVehicle = await this.vehicle.findUnique({
      where: { plate: data.plate },
    })

    if (existingVehicle) {
      throw new RpcException({
        code: GrpcStatus.ALREADY_EXISTS,
        message: `La placa ${data.plate} ya está registrada.`
      });
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

    return this.vehicle.create({ data: vehicleData });
  }

  async updateVehicle(id: number, data: UpdateVehicleDto) {
    return this.vehicle.update({
      where: { id },
      data,
    });
  }

  async deleteVehicle(id: number) {
    return this.vehicle.delete({ where: { id } });
  }
}
