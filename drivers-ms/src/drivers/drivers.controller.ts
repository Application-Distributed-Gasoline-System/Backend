import { Controller, Logger } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PaginationDto } from 'src/common';
import { MessagePattern } from '@nestjs/microservices';
@Controller()
export class DriversController {
  private readonly logger = new Logger(DriversController.name);
  constructor(private readonly driversService: DriversService) { }

  @MessagePattern('driver.find.by.user')
  async handleFindDriverByUser(@Payload() data: { userId: string }) {
    const driver = await this.driversService.getDriverByUserId(data.userId);
    if (!driver) return null;
    return { driverId: driver.id };
  }

  @EventPattern('driver.created')
  async handleDriverCreated(@Payload() data: any) {
    this.logger.log(`Received driver.created event: ${JSON.stringify(data)}`);
    await this.driversService.createFromAuth(data);
  }
  // Evento recibido cuando cambia el estado (activo/disponible)
  @EventPattern('driver.status.updated')
  async handleDriverStatusUpdated(@Payload() data: { userId: string; active: boolean }) {
    this.logger.log(`Received driver.status.updated event: ${JSON.stringify(data)}`);
    await this.driversService.updateDriverAvailability(data.userId, data.active);
  }

  // Evento recibido cuando se actualiza el nombre del conductor
  @EventPattern('driver.name.updated')
  async handleDriverNameUpdated(@Payload() data: { userId: string; name: string }) {
    this.logger.log(`Received driver.name.updated event: ${JSON.stringify(data)}`);
    await this.driversService.updateDriverName(data.userId, data.name);
  }

  @EventPattern('driver.deleted')
  async handleDriverDeleted(@Payload() data: { userId: string }) {
    this.logger.log(`Received driver.deleted event: ${JSON.stringify(data)}`);
    await this.driversService.deleteByUserId(data.userId);
  }

  // Obtener todos los conductores
  @GrpcMethod('DriversService', 'GetAllDrivers')
  async getAllDrivers(data: PaginationDto) {
    const response = await this.driversService.getAllDrivers(data);
    return {
      drivers: response.data,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
  }

  // Obtener conductor por ID
  @GrpcMethod('DriversService', 'GetDriverById')
  async getDriverById(data: { id: string }) {
    const driver = await this.driversService.getDriverById(data.id);
    return (
      driver || { id: '', name: '', license: '', message: 'No encontrado' }
    );
  }

  // Crear nuevo conductor
  @GrpcMethod('DriversService', 'CreateDriver')
  async createDriver(data: CreateDriverDto) {
    const driver = await this.driversService.createDriver(data);
    return { ...driver, message: 'Creado' };
  }

  // Actualizar conductor
  @GrpcMethod('DriversService', 'UpdateDriver')
  async updateDriver(data: UpdateDriverDto & { id: string }) {
    const driver = await this.driversService.updateDriver(data.id, data);
    return driver
      ? { ...driver, message: 'Actualizado' }
      : { id: '', name: '', license: '', message: 'No encontrado' };
  }

  // Eliminar conductor
  @GrpcMethod('DriversService', 'DeleteDriver')
  async deleteDriver(data: { id: string }) {
    const driver = await this.driversService.deleteDriver(data.id);
    return driver
      ? { ...driver, message: 'Eliminado' }
      : { id: '', name: '', license: '', message: 'No encontrado' };
  }
}
