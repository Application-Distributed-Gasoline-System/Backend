import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpException,
} from '@nestjs/common';
import { DriversClientService } from './driver-client.provider';
import { firstValueFrom } from 'rxjs';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';
import { Roles } from 'src/auth/roles.decorator';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversClient: DriversClientService) {}

  @Get()
  @Roles('ADMIN', 'DISPATCHER', 'DRIVER')
  async getAll(@Query() paginationDto: PaginationDto) {
    return firstValueFrom(this.driversClient.getAllDrivers(paginationDto));
  }

  @Get(':id')
  @Roles('ADMIN', 'DISPATCHER', 'DRIVER')
  async findOne(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.driversClient.getDriverById(id));
    } catch (error) {
      throw new RpcException(error);
    }
  }
  @Post()
  @Roles('ADMIN')
  async create(@Body() createDriverDto: CreateDriverDto) {
    return firstValueFrom(this.driversClient.createDriver(createDriverDto));
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateDriverDto: UpdateDriverDto,
  ) {
    return firstValueFrom(
      this.driversClient.updateDriver({ id, ...updateDriverDto }),
    );
  }

  @Delete(':id')
  @Roles('ADMIN')
  async remove(@Param('id') id: string) {
    try {
      return await firstValueFrom(this.driversClient.deleteDriver(id));
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
