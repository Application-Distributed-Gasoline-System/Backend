import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { VehiclesClientService } from '../vehicles/vehicles-client-provider';
import { firstValueFrom } from 'rxjs';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesClient: VehiclesClientService) {}

  @Get()
  async getAll() {
    return firstValueFrom(this.vehiclesClient.getAllVehicles());
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return firstValueFrom(this.vehiclesClient.getVehicleById(Number(id)));
  }

  @Post()
  async create(@Body() vehicle: any) {
    return firstValueFrom(this.vehiclesClient.createVehicle(vehicle));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() vehicle: any) {
    return firstValueFrom(this.vehiclesClient.updateVehicle({ id: Number(id), ...vehicle }));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.vehiclesClient.deleteVehicle(Number(id)));
  }
}
