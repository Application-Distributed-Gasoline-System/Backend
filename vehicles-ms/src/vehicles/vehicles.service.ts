import { Injectable, Logger, Inject, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { readReplicas } from '@prisma/extension-read-replicas';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { GrpcStatus, PaginationDto } from 'src/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { estimateAverageConsumption } from '../utils/consumption';

@Injectable()
export class VehiclesService implements OnModuleInit {
  private readonly logger = new Logger('VehiclesService');
  private prisma: any; // Cliente extendido con read replicas

  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) {}

  async onModuleInit() {
    try {
      // Cliente principal (escrituras - usa DATABASE_URL del env)
      const primaryClient = new PrismaClient();

      // Cliente de réplica (lecturas)
      const replicaClient = new PrismaClient({
        datasources: {
          db: {
            url: process.env.READ_REPLICA_URL,
          },
        },
      });

      // Extender el cliente principal con soporte de read replicas
      this.prisma = primaryClient.$extends(
        readReplicas({
          replicas: [replicaClient],
        }),
      );

      await primaryClient.$connect();
      await replicaClient.$connect();
      this.logger.log('Primary & Replica connected using Prisma extension');
    } catch (err) {
      this.logger.error('Error connecting to DB:', err);
    }
  }

  // ---------------------------------------------------------
  // LECTURAS → Enviadas automáticamente a la READ REPLICA
  // ---------------------------------------------------------
  async getAllVehicles(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.vehicle.findMany({ skip, take: limit }),
      this.prisma.vehicle.count(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getVehicleById(id: number) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `El vehículo con ID ${id} no fue encontrado.`,
      });
    }

    return vehicle;
  }

  // ---------------------------------------------------------
  // ESCRITURAS → Enviadas automáticamente al PRIMARY
  // ---------------------------------------------------------
  async createVehicle(data: CreateVehicleDto) {
    // Validar placa duplicada (esta lectura va a la réplica)
    const existingVehicle = await this.prisma.vehicle.findUnique({
      where: { plate: data.plate },
    });

    if (existingVehicle) {
      throw new RpcException({
        code: GrpcStatus.ALREADY_EXISTS,
        message: `La placa ${data.plate} ya está registrada.`,
      });
    }

    const engineTypeMap = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'];
    const machineryTypeMap = ['LIGHT', 'HEAVY'];

    const vehicleData = {
      ...data,
      engineType: engineTypeMap[data.engineType],
      machineryType: machineryTypeMap[data.machineryType],
      averageConsumption: estimateAverageConsumption(
        machineryTypeMap[data.machineryType] as any,
        engineTypeMap[data.engineType] as any,
        data.engineDisplacement,
        data.year,
      ),
    };

    const createdVehicle = await this.prisma.vehicle.create({
      data: vehicleData,
    });

    this.natsClient.emit('vehicle.created', createdVehicle);
    return createdVehicle;
  }

  async updateVehicle(id: number, data: UpdateVehicleDto) {
    const updatedVehicle = await this.prisma.vehicle.update({
      where: { id },
      data,
    });

    this.natsClient.emit('vehicle.updated', updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: number) {
    const deletedVehicle = await this.prisma.vehicle.delete({
      where: { id },
    });

    this.natsClient.emit('vehicle.deleted', deletedVehicle);
    return deletedVehicle;
  }
}