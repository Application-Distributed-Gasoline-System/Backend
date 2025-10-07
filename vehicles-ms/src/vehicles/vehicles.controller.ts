import { Controller } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { GrpcMethod } from '@nestjs/microservices';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { PaginationDto } from 'src/common';

@Controller()
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @GrpcMethod('VehiclesService', 'GetAllVehicles')
  async getAllVehicles(data : PaginationDto) {
    const response = await this.vehiclesService.getAllVehicles(data);
    return {
      vehicles: response.data,
      total: response.total,
      page: response.page,
      totalPages: response.totalPages
    };
  }

  @GrpcMethod('VehiclesService', 'GetVehicleById')
  async getVehicleById(data: { id: number }) {
    const vehicle = await this.vehiclesService.getVehicleById(data.id);
    return vehicle || { message: 'Not found' };
  }

  @GrpcMethod('VehiclesService', 'CreateVehicle')
  async createVehicle(data: { vehicle: CreateVehicleDto }) {
    const vehicle = await this.vehiclesService.createVehicle(data.vehicle);
    return { ...vehicle, message: 'Created' };
  }

  @GrpcMethod('VehiclesService', 'DeleteVehicle')
  async deleteVehicle(data: { id: number }) {
    const vehicle = await this.vehiclesService.deleteVehicle(data.id);
    return vehicle ? { ...vehicle, message: 'Deleted' } : { message: 'Not found' }; 
  }

  @GrpcMethod('VehiclesService', 'UpdateVehicle')
  async updateVehicle(data: { vehicle: UpdateVehicleDto & { id: number } }) {

    const engineTypeMap = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'];
    const machineryTypeMap = ['LIGHT', 'HEAVY'];
    const vehicleData: any = { ...data.vehicle };

    if (data.vehicle.engineType !== undefined) {
      vehicleData.engineType = engineTypeMap[data.vehicle.engineType];
    }
    if (data.vehicle.machineryType !== undefined) {
      vehicleData.machineryType = machineryTypeMap[data.vehicle.machineryType];
    }

    const vehicle = await this.vehiclesService.updateVehicle(data.vehicle.id, vehicleData);
    return { ...vehicle, message: 'Updated' };
  }
}
