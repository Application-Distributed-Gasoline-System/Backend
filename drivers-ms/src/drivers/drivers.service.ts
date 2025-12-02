import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { GrpcStatus, PaginationDto } from 'src/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';

@Injectable()
export class DriversService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('DriversService');

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('La base de datos esta conectada');
  }

  async getAllDrivers(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.driver.findMany({
        skip,
        take: limit,
        //orderBy: { createdAt: 'desc'},
      }),
      this.driver.count(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getDriverById(id: string) {
    const driver = await this.driver.findUnique({ where: { id } });

    if (!driver)
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `Driver with id: ${id} not found`,
      });

    return driver;
  }

  //Creacion de driver desde driver-ms
  async createDriver(data: CreateDriverDto) {
    const driver = await this.driver.create({ data });
    await this.natsClient.emit('drivers.driver.created', { driver });
    return driver;
  }


  async createFromAuth(data: { userId: string; email: string; name: string }) {

    const existing = await this.driver.findUnique({
      where: { userId: data.userId },
    });

    if (existing) {
      this.logger.warn(`El driver con userId ${data.userId} ya existe`);
      return existing;
    }

    const driver = await this.driver.create({
      data: {
        userId: data.userId,
        name: data.name,
        email: data.email
      },
    });
    await this.natsClient.emit('drivers.driver.created', {
      id: driver.id,
      name: driver.name,
      license: driver.license ?? null,
      isAvailable: driver.isAvailable,
    });

    this.logger.log(`Driver creado: ${driver.id}`);
    return driver;
  }

  async updateDriver(id: string, data: UpdateDriverDto) {
    const driver = await this.driver.update({ where: { id }, data });
    await this.natsClient.emit('drivers.driver.update', {
      id: driver.id,
      name: driver.name,
      license: driver.license ?? null,
      //isAvailable: driver.isAvailable,
    });
    return driver;
  }

  async deleteDriver(id: string) {
    const driver = await this.driver.findUnique({ where: { id } });

    if (!driver)
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `Driver with id: ${id} not found`,
      });

    const deletedDriver = await this.driver.delete({ where: { id } });
    try {
      await this.natsClient.emit('drivers.driver.delete', { id: deletedDriver.id });
    } catch (err) {
      this.logger.error(`Error al emitir evento NATS driver.delete: ${err.message}`);
    }
    return deletedDriver;
  }
  // Actualiza la disponibilidad del conductor
  async updateDriverAvailability(userId: string, active: boolean) {
    const driver = await this.driver.findUnique({ where: { userId } });
    if (!driver) {
      this.logger.warn(`Driver con userId ${userId} no encontrado para actualizar disponibilidad`);
      return;
    }

    await this.driver.update({
      where: { userId },
      data: { isAvailable: active },
    });

    this.logger.log(`Driver ${driver.id} disponibilidad actualizada a ${active}`);

    this.natsClient.emit('drivers.driver.availability.updated', {
      id: driver.id,
      isAvailable: active,
    });
  }

  // Actualiza el nombre del conductor
  async updateDriverName(userId: string, name: string) {
    const driver = await this.driver.findUnique({ where: { userId } });
    if (!driver) {
      this.logger.warn(`Driver con userId ${userId} no encontrado para actualizar nombre`);
      return;
    }

    const updated = await this.driver.update({
      where: { userId },
      data: { name },
    });

    this.logger.log(`Driver ${driver.id} nombre actualizado a ${name}`);

    this.natsClient.emit('drivers.driver.name.updated', {
      id: updated.id,
      name: updated.name,
    });
  }

  // Eliminar conductor usando userId 
  async deleteByUserId(userId: string) {
    const driver = await this.driver.findUnique({ where: { userId } });

    if (!driver) {
      this.logger.warn(`Driver con userId ${userId} no encontrado para eliminar`);
      return;
    }

    const deletedDriver = await this.driver.delete({ where: { userId } });
    try {
      await this.natsClient.emit('drivers.driver.delete', { id: deletedDriver.id });
    } catch (err) {
      this.logger.error(`Error al emitir evento NATS driver.delete: ${err.message}`);
    }
    return deletedDriver;
  }

  async getDriverByUserId(userId: string) {
    return await this.driver.findUnique({
      where: { userId },
    });
  }

}
