import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DriversClientService } from './driver-client.provider';
import { firstValueFrom } from 'rxjs';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversClient: DriversClientService) {}

  @Get()
  async getAll(@Query() paginationDto: PaginationDto) {
    return firstValueFrom(this.driversClient.getAllDrivers(paginationDto));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {

    try {
      
      return await firstValueFrom(this.driversClient.getDriverById(id));

    } catch (error) {
      throw new RpcException(error);
      
    }

  }

  @Post()
  async create(@Body() createDriverDto: CreateDriverDto) {
    return firstValueFrom(this.driversClient.createDriver(createDriverDto));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto) {
    return firstValueFrom(this.driversClient.updateDriver({ id, ...updateDriverDto }));
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(this.driversClient.deleteDriver(id));
  }
}