import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { GrpcStatus, PaginationDto } from 'src/common';

@Injectable()
export class RoutesService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('RoutesService');

  constructor(
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('La base de datos esta conectada');
  }


  //NATS

  async createDriverRef(data: { id: string; name: string }) {
    try {
      const existing = await this.driverRef.findUnique({ where: { id: data.id } });
      if (existing) {
        this.logger.warn(`DriverRef con id ${data.id} ya existe`);
        return existing;
      }

      const driverRef = await this.driverRef.create({
        data: {
          id: data.id,
          name: data.name
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

  async updateDriverRef(data: { id: string; name?: string}) {
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

  // async updateDriverStatusRef(data: { id: string; isAvailable: boolean }) {
  //   try {
  //     const driverRef = await this.driverRef.findUnique({ where: { id: data.id } });
  //     if (!driverRef) {
  //       this.logger.warn(`DriverRef con id ${data.id} no encontrado`);
  //       return;
  //     }

  //     await this.driverRef.update({
  //       where: { id: data.id },
  //       data: { isAvailable: data.isAvailable },
  //     });

  //     this.logger.log(
  //       `Disponibilidad del DriverRef actualizada (${data.id}) → ${data.isAvailable}`,
  //     );
  //   } catch (error) {
  //     this.logger.error(`Error actualizando disponibilidad del DriverRef: ${error.message}`);
  //     throw new RpcException({
  //       code: GrpcStatus.INTERNAL,
  //       message: `Error actualizando disponibilidad del DriverRef: ${error.message}`,
  //     });
  //   }
  // }

  //Propios del microservicio Rutas

  async createRoute(data : CreateRouteDto) {
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
