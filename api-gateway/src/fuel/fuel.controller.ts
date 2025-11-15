import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { ReportRequestDto } from './dto/report-request.dto';
import { FuelClientService } from './fuel-client.provider';
import { first, firstValueFrom } from 'rxjs';
import { report } from 'process';
import { Roles } from 'src/auth/roles.decorator';

@Controller('fuel')
export class FuelController {
  constructor(private readonly fuelService: FuelClientService) { }

  @Post()
  @Roles('ADMIN', 'DISPATCHER')
  create(@Body() createFuelDto: CreateFuelDto) {
    return firstValueFrom(
      this.fuelService.createFuelRecord(createFuelDto)
    );
  }

  @Get('vehicle/:id')
  @Roles('ADMIN', 'DISPATCHER')
  findByVehicle(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return firstValueFrom(
      this.fuelService.getFuelByVehicle(id, from, to)
    );
  }

  @Get('report')
  @Roles('ADMIN', 'DISPATCHER')
  getReport(@Query() reportRequestDto: ReportRequestDto) {
    return firstValueFrom(
      this.fuelService.getFuelReport(reportRequestDto)
    );
  }


}
