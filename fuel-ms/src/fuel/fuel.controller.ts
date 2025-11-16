import { Controller, Logger } from '@nestjs/common';
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import { FuelService } from './fuel.service';
import { CreateFuelDto, FuelSource } from './dto/create-fuel.dto';

@Controller()
export class FuelController {
  private readonly logger = new Logger(FuelController.name);
  constructor(private readonly fuelService: FuelService) { }
  
  //// NATS /////
  @EventPattern('route.completed')
  async handleRouteCompleted(@Payload() payload: any) {
    console.log(`🔔 route.completed recibido: ${JSON.stringify(payload)}`)
    this.logger.log(`🔔 route.completed recibido: ${JSON.stringify(payload)}`);
    try {
      const liters =
        payload.actualFuelLiters ??
        payload.fuelFilledLiters ??
        0;

      if (!liters || liters === 0) {
        this.logger.log('route.completed recibido sin litros — no se crea registro.');
        return;
      }

      const dto = {
        externalId: payload.eventId,
        routeId: payload.routeId?.toString(),
        vehicleId: payload.vehicleId?.toString(),
        driverId: payload.driverId,
        liters,
        fuelType: payload.fuelType ?? 'diesel',
        machineryType: payload.machineryType ?? 'HEAVY',
        source: FuelSource.ROUTE_COMPLETION,
        estimatedFuelL: payload.estimatedFuelLiters,
        distanceKm: payload.distanceKm,
        recordedAt: payload.occurredAt,
      };

      const created = await this.fuelService.createRecord(dto);
      this.logger.log(`Fuel record creado desde route.completed → ${created.id}`);

    } catch (e) {
      this.logger.error('Error procesando route.completed: ' + (e?.message ?? e));
    }
  }
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
