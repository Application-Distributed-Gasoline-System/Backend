import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { CreateFuelDto } from './dto/create-fuel.dto';
import { ReportRequestDto } from './dto/report-request.dto';
import { FuelClientService } from './fuel-client.provider';
import { firstValueFrom } from 'rxjs';
import { Roles } from 'src/auth/roles.decorator';
import { VehiclesClientService } from '../vehicles/vehicles-client-provider';

@Controller('fuel')
export class FuelController {
  constructor(
    private readonly fuelService: FuelClientService,
    private readonly vehicleService: VehiclesClientService,
  ) { }


  private timestampToISOString(ts: any): string | null {
    if (!ts) return null;
    const seconds = ts.seconds?.low ?? ts.seconds ?? 0;
    const nanos = ts.nanos ?? 0;
    return new Date(seconds * 1000 + nanos / 1e6).toISOString();
  }

  private mapFuelRecord(record: any) {
    return {
      ...record,
      recordedAt: this.timestampToISOString(record.recordedAt),
      createdAt: this.timestampToISOString(record.createdAt),
      updatedAt: this.timestampToISOString(record.updatedAt),
    };
  }

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

    const records = (fuelData.records ?? []).map(r => this.mapFuelRecord(r));
    const anomalyRecords = (fuelData.anomalyRecords ?? []).map(r => this.mapFuelRecord(r));

    return {
      vehicle,
      records,
      anomaliesDetected: fuelData.anomaliesDetected ?? 0,
      anomalyRecords,
    };
  }

  @Get('driver/:id')
  @Roles('ADMIN', 'DISPATCHER', 'DRIVER')
  async findByDriver(
    @Param('id') id: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const fuelData = await firstValueFrom(
      this.fuelService.getFuelByDriver(id, from, to)
    );

    const records = (fuelData.records ?? []).map(r => this.mapFuelRecord(r));
    const anomalyRecords = (fuelData.anomalyRecords ?? []).map(r => this.mapFuelRecord(r));

    return {
      driverId: id,
      records,
      anomaliesDetected: fuelData.anomaliesDetected ?? 0,
      anomalyRecords,
    };
  }

  @Get('report')
  @Roles('ADMIN', 'DISPATCHER')
  async getReport(@Query() reportRequestDto: ReportRequestDto) {
    const fuelData = await firstValueFrom(this.fuelService.getFuelReport(reportRequestDto));

    const enrichedData = await Promise.all(
      (fuelData.items ?? []).map(async item => {
        const vehicle = await firstValueFrom(this.vehicleService.getVehicleById(item.vehicleId));
        const anomalyRecords = (item.anomalyRecords ?? []).map(r => this.mapFuelRecord(r));

        return {
          vehicle,
          totalLiters: item.totalLiters,
          avgLitersPerKm: item.avgLitersPerKm,
          recordsCount: item.recordsCount,
          anomaliesDetected: item.anomaliesDetected ?? 0,
          anomalyRecords,
        };
      })
    );

    return enrichedData;
  }
}