import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { ReportRequestDto } from './dto/report-request.dto';
import { FuelClientService } from './fuel-client.provider';
import { first, firstValueFrom } from 'rxjs';
import { report } from 'process';
import { Roles } from 'src/auth/roles.decorator';
import { VehiclesClientService } from '../vehicles/vehicles-client-provider';

@Controller('fuel')
export class FuelController {
  constructor(
    private readonly fuelService: FuelClientService,
    private readonly vehicleService: VehiclesClientService,
  ) { }

  @Post()
  @Roles('ADMIN', 'DISPATCHER')
  create(@Body() createFuelDto: CreateFuelDto) {
    return firstValueFrom(
      this.fuelService.createFuelRecord(createFuelDto)
    );
  }

  @Get('vehicle/:id')
  @Roles('ADMIN', 'DISPATCHER')
  async findByVehicle(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fuelData = await firstValueFrom(
      this.fuelService.getFuelByVehicle(id, from, to)
    );

    const vehicle = await firstValueFrom(this.vehicleService.getVehicleById(+id));

    return {
      vehicle,
      records: fuelData.records,
      anomaliesDetected: fuelData.anomaliesDetected,
      anomalyRecords: fuelData.anomalyRecords,
    };
  }

  @Get('report')
  @Roles('ADMIN', 'DISPATCHER')
  async getReport(@Query() reportRequestDto: ReportRequestDto) {
    const fuelData = await firstValueFrom(this.fuelService.getFuelReport(reportRequestDto));

    const enrichedData = await Promise.all(
      fuelData.items.map(async item => {
        const vehicle = await firstValueFrom(this.vehicleService.getVehicleById(item.vehicleId));
        return {
          vehicle,
          totalLiters: item.totalLiters,
          avgLitersPerKm: item.avgLitersPerKm,
          recordsCount: item.recordsCount,
          anomaliesDetected: item.anomaliesDetected,
          anomalyRecords: item.anomalyRecords,
        };
      })
    );

    return enrichedData;
  }



}
