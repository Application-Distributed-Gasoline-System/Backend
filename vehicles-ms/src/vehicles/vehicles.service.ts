import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PrismaClient } from '@prisma/client';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { estimateAverageConsumption } from '../utils/consumption';
import { GrpcStatus, PaginationDto } from 'src/common';

@Injectable()
export class VehiclesService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('VehiclesService');

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {
    super();
  }

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

    const createdVehicle = await this.vehicle.create({ data: vehicleData });

    this.natsClient.emit('vehicle.created', createdVehicle);

    return createdVehicle;
  }

  async updateVehicle(id: number, data: UpdateVehicleDto) {
    const updatedVehicle = await this.vehicle.update({
      where: { id },
      data,
    });

    this.natsClient.emit('vehicle.updated', updatedVehicle);

    return updatedVehicle;
  }

  async deleteVehicle(id: number) {
    const deletedVehicle = await this.vehicle.delete({ where: { id } });

    this.natsClient.emit('vehicle.deleted', deletedVehicle);

    return deletedVehicle;
  }
}
