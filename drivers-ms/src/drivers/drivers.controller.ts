import { Controller } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';


@Controller()
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  // Obtener todos los conductores
  @GrpcMethod('DriversService', 'GetAllDrivers')
  async getAllDrivers() {
    const drivers = await this.driversService.getAllDrivers();
    return { drivers };
  }

  // Obtener conductor por ID
  @GrpcMethod('DriversService', 'GetDriverById')
  async getDriverById(data: { id: string }) {
    const driver = await this.driversService.getDriverById(data.id);
    return driver || { id: '', name: '', license: '', message: 'No encontrado' };
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
    return driver ? { ...driver, message: 'Actualizado' } : { id: '', name: '', license: '', message: 'No encontrado' };
  }

  // Eliminar conductor
  @GrpcMethod('DriversService', 'DeleteDriver')
  async deleteDriver(data: { id: string }) {
    const driver = await this.driversService.deleteDriver(data.id);
    return driver ? { ...driver, message: 'Eliminado' } : { id: '', name: '', license: '', message: 'No encontrado' };
  }
}