import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { GrpcStatus, PaginationDto } from 'src/common';

@Injectable()
export class RoutesService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('RoutesService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('La base de datos esta conectada');
  }


  /////// NATS //////

  // VEHICLES

  async createVehicleRef(data) {
    try {
      const existing = await this.vehicleRef.findUnique({ where: { id: data.id } });
      if (existing) {
        this.logger.warn(`VehicleRef con id ${data.id} ya existe`);
        return existing;
      }

      const vehicleRef = await this.vehicleRef.create({
        data: {
          id: data.id,
          plate: data.plate,
          engineType: data.engineType,
          machineryType: data.machineryType,
          tankCapacity: data.tankCapacity,
          engineDisplacement: data.engineDisplacement,
          averageConsumption: data.averageConsumption,
          mileage: data.mileage,
          available: data.available,
          status: data.status
        },
      });

      return vehicleRef;
    } catch (error) {
      this.logger.error(`Error creando VehicleRef: ${error.message}`);
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: `Error creando VehicleRed: ${error.message}`,
      });
    }
  }

  async updateVehicleRef(data) {
    try {
      const vehicleRef = await this.vehicleRef.findUnique({ where: { id: data.id } });
      if (!vehicleRef) {
        this.logger.warn(`VehicleRef con id ${data.id} no encontrado`);
        return;
      }

      const updated = await this.vehicleRef.update({
        where: { id: data.id },
        data: {
          plate: data.plate,
          engineType: data.engineType,
          machineryType: data.machineryType,
          tankCapacity: data.tankCapacity,
          engineDisplacement: data.engineDisplacement,
          averageConsumption: data.averageConsumption,
          mileage: data.mileage,
          available: data.available,
          status: data.status
        },
      });

      return updated;
    } catch (error) {
      this.logger.error(`Error actualizando VehicleRef: ${error.message}`);
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: `Error actualizando VehicleRef: ${error.message}`,
      });
    }
  }

  async deleteVehicleRef(id: number) {
    try {
      const vehicleRef = await this.vehicleRef.findUnique({ where: { id } });
      if (!vehicleRef) {
        this.logger.warn(`VehicleRef con id ${id} no encontrado`);
        return;
      }

      await this.vehicleRef.delete({ where: { id } });
      this.logger.log(`vehicleRef eliminado: ${id}`);
    } catch (error) {
      this.logger.error(`Error eliminando VehicleRef: ${error.message}`);
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: `Error eliminando VehicleRef: ${error.message}`,
      });
    }
  }



  // DRIVERS
  async createDriverRef(data : { id: string; name: string; license: any; isAvailable : boolean  }) {
    try {
      const existing = await this.driverRef.findUnique({ where: { id: data.id } });
      if (existing) {
        this.logger.warn(`DriverRef con id ${data.id} ya existe`);
        return existing;
      }

      const driverRef = await this.driverRef.create({
        data: {
          id: data.id,
          name: data.name,
          license: data.license,
          isAvailable: data.isAvailable
        },
      });

      this.logger.log(`DriverRef creado: ${driverRef.id}`);
      return driverRef;
    } catch (error) {
      this.logger.error(`Error creando DriverRef: ${error.message}`);
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: `Error creando DriverRef: ${error.message}`,
      });
    }
  }

  async updateDriverRef(data : { id: string; name: string; license: any; isAvailable : boolean  }) {
    try {
      const driverRef = await this.driverRef.findUnique({ where: { id: data.id } });
      if (!driverRef) {
        this.logger.warn(`DriverRef con id ${data.id} no encontrado`);
        return;
      }

      const updated = await this.driverRef.update({
        where: { id: data.id },
        data: {
          name: data.name ?? driverRef.name,
          license: data.license,
          isAvailable: data.isAvailable ?? driverRef.isAvailable
        },
      });

      this.logger.log(`DriverRef actualizado: ${updated.id}`);
      return updated;
    } catch (error) {
      this.logger.error(`Error actualizando DriverRef: ${error.message}`);
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: `Error actualizando DriverRef: ${error.message}`,
      });
    }
  }

  async deleteDriverRef(id: string) {
    try {
      const driverRef = await this.driverRef.findUnique({ where: { id } });
      if (!driverRef) {
        this.logger.warn(`DriverRef con id ${id} no encontrado`);
        return;
      }

      await this.driverRef.delete({ where: { id } });
      this.logger.log(`DriverRef eliminado: ${id}`);
    } catch (error) {
      this.logger.error(`Error eliminando DriverRef: ${error.message}`);
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: `Error eliminando DriverRef: ${error.message}`,
      });
    }
  }

  async updateDriverNameRef(data: { id: string; name: string }) {
    try {
      const driverRef = await this.driverRef.findUnique({ where: { id: data.id } });
      if (!driverRef) {
        this.logger.warn(`DriverRef con id ${data.id} no encontrado`);
        return;
      }

      await this.driverRef.update({
        where: { id: data.id },
        data: { name: data.name },
      });

      this.logger.log(`Nombre del DriverRef actualizado: ${data.id}`);
    } catch (error) {
      this.logger.error(`Error actualizando nombre del DriverRef: ${error.message}`);
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: `Error actualizando nombre del DriverRef: ${error.message}`,
      });
    }
  }

  async updateDriverStatusRef(data: { id: string; isAvailable: boolean }) {
    try {
      const driverRef = await this.driverRef.findUnique({ where: { id: data.id } });
      if (!driverRef) {
        this.logger.warn(`DriverRef con id ${data.id} no encontrado`);
        return;
      }

      await this.driverRef.update({
        where: { id: data.id },
        data: { isAvailable: data.isAvailable },
      });

      this.logger.log(
        `Disponibilidad del DriverRef actualizada (${data.id}) → ${data.isAvailable}`,
      );
    } catch (error) {
      this.logger.error(`Error actualizando disponibilidad del DriverRef: ${error.message}`);
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: `Error actualizando disponibilidad del DriverRef: ${error.message}`,
      });
    }
  }

  //Propios del microservicio Rutas

  async createRoute(data: CreateRouteDto) {
    const route = await this.route.create({ data });
    return route
  }

  async findAllRoutes(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.route.findMany({
        skip,
        take: limit,
        //orderBy: { createdAt: 'desc'},
      }),
      this.route.count(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  findOneRoute(id: number) {
    return `This action returns a #${id} route`;
  }

  updateRoute(id: number, data: UpdateRouteDto) {
    const route = this.route.update({ where: { id }, data });
    return route
  }

  async removeRoute(id: number) {
    const route = await this.route.findUnique({ where: { id } });

    if (!route)
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `Route with id: ${id} not found`,
      });

    return this.route.delete({ where: { id } });
  }
}
