import { Controller, Logger } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { FuelService } from './fuel.service';
import { CreateFuelDto } from './dto/create-fuel.dto';

@Controller()
export class FuelController {
  private readonly logger = new Logger(FuelController.name);
  constructor(private readonly fuelService: FuelService) {}

  @GrpcMethod('FuelService', 'CreateFuel')
  async createFuel(data: { record: any }) {
    // data.record es el CreateFuelDto definido en proto
    const dto: CreateFuelDto = {
      externalId: data.record.externalId,
      driverId: data.record.driverId,
      vehicleId: data.record.vehicleId,
      routeId: data.record.routeId,
      liters: data.record.liters,
      fuelType: data.record.fuelType,
      machineryType: data.record.machineryType,
      odometer: data.record.odometer,
      gpsLocation: data.record.gpsLocation,
      source: data.record.source,
      estimatedFuelL: data.record.estimatedFuelL,
      distanceKm: data.record.distanceKm,
      recordedAt: data.record.recordedAt,
    };

    const created = await this.fuelService.createRecord(dto);

    // Convert timestamps to proto-friendly (string ISO or Timestamp if desired)
    return { id: created.id, record: created };
  }

  @GrpcMethod('FuelService', 'GetByVehicle')
  async getByVehicle(data: { vehicleId: string; from?: string; to?: string }) {
    const records = await this.fuelService.getByVehicle(data.vehicleId, data.from, data.to);
    return { records };
  }

  @GrpcMethod('FuelService', 'GetReport')
  async getReport(data: { from: string; to: string; vehicleIds?: string[]; machineryType?: string }) {
    const items = await this.fuelService.getReport(data);
    return { items };
  }
}
