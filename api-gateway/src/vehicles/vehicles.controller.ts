import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { VehiclesClientService } from '../vehicles/vehicles-client-provider';
import { firstValueFrom } from 'rxjs';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesClient: VehiclesClientService) {}

  @Get()
  @Roles('ADMIN')
  async getAll(@Query() paginationDto: PaginationDto) {
    return firstValueFrom(this.vehiclesClient.getAllVehicles(paginationDto));
  }

  @Get(':id')
  @Roles('ADMIN')
  async getById(@Param('id') id: string) {
    try {
      return await firstValueFrom(
        this.vehiclesClient.getVehicleById(Number(id)),
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() vehicle: CreateVehicleDto) {
    try {
      return await firstValueFrom(this.vehiclesClient.createVehicle(vehicle));
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(@Param('id') id: string, @Body() vehicle: UpdateVehicleDto) {
    return firstValueFrom(
      this.vehiclesClient.updateVehicle({ id: Number(id), ...vehicle }),
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.vehiclesClient.deleteVehicle(Number(id)));
  }
}
