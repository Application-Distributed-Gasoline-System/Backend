import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { GrpcStatus, PaginationDto } from 'src/common';

@Injectable()
export class RoutesService extends PrismaClient implements OnModuleInit {

  constructor(@Inject('NATS_SERVICE') private natsClient: ClientProxy) {
    super();
  }

  private readonly logger = new Logger('RoutesService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('La base de datos esta conectada');
  }
  private async validateDriverAndVehicleExistenceAndAvailability(
    tx: any,
    driverId: string,
    vehicleId: number,
    routeMachineryType: string,
  ) {
    const driver = await tx.driverRef.findUnique({ where: { id: driverId } });
    const vehicle = await tx.vehicleRef.findUnique({ where: { id: vehicleId } });

    if (!driver) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `El chofer con id ${driverId} no existe.`,
      });
    }

    if (!vehicle) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `El vehículo con id ${vehicleId} no existe.`,
      });
    }

    // Validar disponibilidad administrativa (vacaciones, mantenimiento, etc.)
    if (!driver.isAvailable) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: `El chofer ${driver.name} no está disponible administrativamente.`,
      });
    }

    if (!vehicle.available) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: `El vehículo ${vehicle.plate} no está disponible administrativamente.`,
      });
    }

    // Validar compatibilidad de licencia y tipo de maquinaria
    this.validateDriverVehicleCompatibility(driver, vehicle, routeMachineryType);

    return { driver, vehicle };
  }

  private validateDriverVehicleCompatibility(driver: any, vehicle: any, routeMachineryType: string) {
    const driverLicense = driver.license;
    const vehicleType = vehicle.machineryType;
    const heavyLicenses = ['D', 'E'];
    const lightLicenses = ['C', 'D', 'E'];

    let isDriverCompatible = false;

    if (routeMachineryType === 'LIGHT') {
      isDriverCompatible = lightLicenses.includes(driverLicense);
    } else if (routeMachineryType === 'HEAVY') {
      isDriverCompatible = heavyLicenses.includes(driverLicense);
    }

    if (!isDriverCompatible) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: `El chofer ${driver.name} (Licencia: ${driverLicense}) no es apto para maquinaria de tipo ${routeMachineryType}.`,
      });
    }

    if (vehicleType !== routeMachineryType) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: `El vehículo ID ${vehicle.id} es de tipo ${vehicleType}, lo cual es incompatible con la ruta de tipo ${routeMachineryType}.`,
      });
    }
  }

  private async validateRouteAvailabilityByDate(
    tx: any,
    driverId: string,
    vehicleId: number,
    scheduledAt: Date | string | null | undefined,
    excludeRouteId?: number,
  ) {
    const routeDate = scheduledAt ? new Date(scheduledAt) : new Date();
    const startOfDay = new Date(routeDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(routeDate);
    endOfDay.setHours(23, 59, 59, 999);

    const commonWhere = {
      scheduledAt: { gte: startOfDay, lte: endOfDay },
      status: { notIn: ['CANCELLED', 'COMPLETED'] },
      ...(excludeRouteId && { id: { not: excludeRouteId } }),
    };

    // Verificar rutas existentes del chofer en esa fecha
    const driverHasRoute = await tx.route.findFirst({
      where: { ...commonWhere, driverId },
      include: { driver: true },
    });

    if (driverHasRoute) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: `El chofer ${driverHasRoute.driver.name} ya tiene una ruta asignada para esa fecha (${routeDate.toISOString().split('T')[0]}).`,
      });
    }

    // Verificar rutas existentes del vehículo en esa fecha
    const vehicleHasRoute = await tx.route.findFirst({
      where: { ...commonWhere, vehicleId },
      include: { vehicle: true },
    });

    if (vehicleHasRoute) {
      throw new RpcException({
        code: GrpcStatus.FAILED_PRECONDITION,
        message: `El vehículo ${vehicleHasRoute.vehicle.plate} ya tiene una ruta asignada para esa fecha (${routeDate.toISOString().split('T')[0]}).`,
      });
    }
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
        message: `Error creando VehicleRef: ${error.message}`,
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
  async createDriverRef(data: { id: string; name: string; license: any; isAvailable: boolean }) {
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

  async updateDriverRef(data: { id: string; name: string; license: any; isAvailable: boolean }) {
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
    return this.$transaction(async (tx) => {
      const { driver, vehicle } =
        await this.validateDriverAndVehicleExistenceAndAvailability(
          tx,
          data.driverId,
          data.vehicleId,
          data.machineryType,
        );

      await this.validateRouteAvailabilityByDate(
        tx,
        data.driverId,
        data.vehicleId,
        data.scheduledAt,
      );

      // Generar código único
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const code = `RT-${vehicle.machineryType[0]}-${datePart}-${randomPart}`;

      // Calcular consumo estimado
      const estimatedFuelL =
        data.estimatedFuelL ??
        Number((data.distanceKm / 100) * vehicle.averageConsumption);


      // Crear ruta
      const route = await tx.route.create({
        data: {
          code,
          origin: data.origin,
          destination: data.destination,
          distanceKm: data.distanceKm,
          machineryType: data.machineryType,
          estimatedFuelL,
          scheduledAt: data.scheduledAt,
          driverId: data.driverId,
          vehicleId: data.vehicleId,
          status: 'PLANNED',
        },
      });

      return route;
    });
  }

  async findAllRoutes(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;
    const skip = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        this.route.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: { driver: true, vehicle: true },
        }),
        this.route.count(),
      ]);

      return {
        routes: data,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`Error listando rutas: ${error.message}`);
      throw new RpcException({
        code: GrpcStatus.INTERNAL,
        message: 'Error al listar rutas',
      });
    }
  }

  async findOneRoute(id: number) {
    const route = await this.route.findUnique({
      where: { id },
      include: { driver: true, vehicle: true },
    });

    if (!route)
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `Ruta con ID ${id} no encontrada`,
      });

    return route;
  }

  async updateRoute(id: number, data: UpdateRouteDto) {
    // 1. Verificar existencia de la ruta a actualizar
    const existing: any = await this.route.findUnique({
      where: { id },
      include: { driver: true, vehicle: true },
    });

    if (!existing) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: `Ruta con ID ${id} no encontrada`,
      });
    }
    return this.$transaction(async (tx) => {

      this.logger.log(`Actualizando ruta ID ${id} - Datos: ${JSON.stringify(data)}`);
      console.log(`Actualizando ruta ID ${id} - Datos: ${JSON.stringify(data)}`);
      // 2. No permitir actualizar rutas en progreso o completadas/canceladas si se cambia driver/vehicle
      if (existing.status === 'IN_PROGRESS' || existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
        if (data.driverId || data.vehicleId || data.scheduledAt) {
          throw new RpcException({
            code: GrpcStatus.FAILED_PRECONDITION,
            message: `No se permite cambiar chofer, vehículo o fecha para rutas en estado ${existing.status}.`,
          });
        }
      }

      // 3. Determinar el Chofer y Vehículo final para la ruta
      const newDriverId = data.driverId ?? existing.driverId;
      const newVehicleId = data.vehicleId ?? existing.vehicleId;
      const newScheduledAt = data.scheduledAt ?? existing.scheduledAt;

      // 4. Validar las nuevas referencias (existencia, disponibilidad, compatibilidad)
      const finalMachineryType = data.machineryType ?? existing.machineryType;
      const { driver, vehicle } =
        await this.validateDriverAndVehicleExistenceAndAvailability(
          tx,
          newDriverId,
          newVehicleId,
          finalMachineryType,
        );

      // 5. Validar disponibilidad de ruta por fecha para el nuevo chofer/vehículo
      await this.validateRouteAvailabilityByDate(
        tx,
        newDriverId,
        newVehicleId,
        newScheduledAt,
        id,
      );

      // 6. Preparar datos de actualización
      const updateData: any = { ...data };

      // Lógica específica para el consumo real (solo al completar)
      if (data.actualFuelL != null) {
        updateData.actualFuelL = data.actualFuelL;
      }

      // Usamos el valor que se enviaría o el existente, para el cálculo
      const currentDistanceKm = data.distanceKm ?? existing.distanceKm;

      // Verificamos si hubo un cambio en la distancia o en el vehículo
      const distanceChanged = data.distanceKm !== undefined && data.distanceKm !== existing.distanceKm;
      const vehicleChanged = data.vehicleId !== undefined && data.vehicleId !== existing.vehicleId;

      const shouldRecalculate =
        (distanceChanged || vehicleChanged) ||
        (data.estimatedFuelL === undefined || data.estimatedFuelL === null || data.estimatedFuelL === 0);

      if (!distanceChanged && !vehicleChanged && shouldRecalculate) {
        delete updateData.estimatedFuelL;
      }
      else if (shouldRecalculate) {
        if (data.estimatedFuelL === undefined || data.estimatedFuelL === null || data.estimatedFuelL === 0) {
          if (vehicle.averageConsumption !== undefined && currentDistanceKm != null) {
            const newEstimatedFuelL = Number((currentDistanceKm / 100) * vehicle.averageConsumption);
            updateData.estimatedFuelL = newEstimatedFuelL;
          }
        }
      }
      if (existing.status !== data.status) {
        if (data.status === 'IN_PROGRESS') {
          updateData.startedAt = new Date().toISOString();
          console.log(`🔹 Ruta ${id} pasó a IN_PROGRESS, seteando startedAt: ${updateData.startedAt}`);
        }

        if (data.status === 'COMPLETED') {
          const hasActualFuel = data.actualFuelL !== undefined && data.actualFuelL !== null;

          if (!hasActualFuel) {
            throw new RpcException({
              code: GrpcStatus.INVALID_ARGUMENT,
              message: 'Para completar la ruta es OBLIGATORIO proporcionar el consumo real de combustible (actualFuelL).',
            });
          }

          updateData.completedAt = new Date().toISOString();
        }

        if (data.status === 'CANCELLED') {
          console.log(`🔹 Ruta ${id} pasó a CANCELLED`);
        }
      }
      const updated = await tx.route.update({
        where: { id },
        data: updateData,
        include: { driver: true, vehicle: true },
      });

      if (existing.status !== updated.status) {
        if (updated.status === 'IN_PROGRESS') {
          this.natsClient.emit('route.started', {
            eventId: crypto.randomUUID(),
            routeId: updated.id,
            driverId: updated.driverId,
            vehicleId: updated.vehicleId,
            occurredAt: new Date().toISOString()
          });
          console.log(`✅ Evento NATS route.started emitido para ruta ${updated.id}`);
        }

        if (updated.status === 'COMPLETED') {
          this.natsClient.emit('route.completed', {
            eventId: crypto.randomUUID(),
            routeId: updated.id,
            driverId: updated.driverId,
            vehicleId: updated.vehicleId,
            distanceKm: updated.distanceKm,
            estimatedFuelLiters: updated.estimatedFuelL,
            actualFuelLiters: updated.actualFuelL,
            occurredAt: new Date().toISOString(),
            fuelType: vehicle.engineType,
            machineryType: vehicle.machineryType
          });
          console.log(`✅ Evento NATS route.completed emitido para ruta ${updated.id}`);
        }

        if (updated.status === 'CANCELLED') {
          this.natsClient.emit('route.cancelled', {
            eventId: crypto.randomUUID(),
            routeId: updated.id,
            vehicleId: updated.vehicleId,
            driverId: updated.driverId,
            occurredAt: new Date().toISOString(),
          });
          console.log(`✅ Evento NATS route.cancelled emitido para ruta ${updated.id}`);
        }
      }

      return updated;
    });
  }


  async removeRoute(id: number) {
    return this.$transaction(async (tx) => {
      const route = await tx.route.findUnique({
        where: { id },
        include: { driver: true, vehicle: true },
      });

      if (!route)
        throw new RpcException({
          code: GrpcStatus.NOT_FOUND,
          message: `Ruta con ID ${id} no encontrada`,
        });

      if (route.status === 'IN_PROGRESS') {
        throw new RpcException({
          code: GrpcStatus.FAILED_PRECONDITION,
          message: `No se puede eliminar la ruta ${id} porque está EN PROGRESO. Debes cancelarla o completarla primero.`,
        });
      }

      if (route.status === 'COMPLETED') {
        throw new RpcException({
          code: GrpcStatus.FAILED_PRECONDITION,
          message: `No se puede eliminar la ruta ${id} porque ya fue COMPLETADA y es parte del historial.`,
        });
      }

      await tx.route.delete({ where: { id } });

      this.logger.log(`Ruta ${id} eliminada correctamente (Estaba en estado ${route.status})`);

      return { message: `Ruta ${id} eliminada correctamente` };
    });
  }
}
