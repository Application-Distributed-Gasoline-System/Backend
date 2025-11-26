import { Controller, Logger } from '@nestjs/common';
import { EventPattern, GrpcMethod, Payload } from '@nestjs/microservices';
import { FuelService } from './fuel.service';
import { CreateFuelDto, FuelSource } from './dto/create-fuel.dto';

@Controller()
export class FuelController {
  private readonly logger = new Logger(FuelController.name);
  constructor(private readonly fuelService: FuelService) { }
  @EventPattern('vehicle.created')
  async handleVehicleCreated(@Payload() data: any) {
    await this.fuelService.syncVehicleRef(data);
  }

  @EventPattern('vehicle.updated')
  async handleVehicleUpdated(@Payload() data: any) {
    await this.fuelService.syncVehicleRef(data);
  }

  @EventPattern('vehicle.deleted')
  async handleVehicleDeleted(@Payload() data: { id: number }) {
    await this.fuelService.deleteVehicleRef(data.id);
  }
  @EventPattern('route.completed')
  async handleRouteCompleted(@Payload() payload: any) {
    this.logger.log(`🔔 route.completed recibido: ${payload.routeId}`);

    try {
      const liters = Number(payload.actualFuelLiters ?? payload.fuelFilledLiters ?? 0);

      if (!liters || liters <= 0) {
        this.logger.warn(`Ruta ${payload.routeId} finalizada sin consumo reportado. Se omite registro.`);
        return;
      }

      const dto: CreateFuelDto = {
        externalId: payload.eventId,
        routeId: payload.routeId?.toString(),
        routeCode: payload.routeCode ?? null,
        vehicleId: payload.vehicleId?.toString(),
        driverId: payload.driverId,
        liters: liters,
        estimatedFuelL: payload.estimatedFuelLiters ? Number(payload.estimatedFuelLiters) : 0,
        distanceKm: payload.distanceKm ? Number(payload.distanceKm) : 0,
        source: FuelSource.ROUTE_COMPLETION,
        recordedAt: payload.occurredAt,
      };

      const result = await this.fuelService.createRecord(dto);

      if (result.isAnomaly) {
        this.logger.warn(`⚠️ Auto-Registro creado con ANOMALÍA: ${result.message}`);
      } else {
        this.logger.log(`✅ Auto-Registro creado: ID ${result.record.id} (Delta: ${result.record.deltaPercent?.toFixed(2)}%)`);
      }

    } catch (e) {
      this.logger.error(`Error procesando route.completed: ${e.message}`);
    }
  }

  // Logs informativos
  @EventPattern('route.started')
  handleRouteStarted(@Payload() data: any) {
    this.logger.log(`🚀 Ruta INICIADA: ${data.routeId}`);
  }

  @EventPattern('route.cancelled')
  handleRouteCancelled(@Payload() data: any) {
    this.logger.warn(`🚫 Ruta CANCELADA: ${data.routeId}`);
  }


  @GrpcMethod('FuelService', 'CreateFuel')
  async createFuel(data: { record: any }) {
    const dto: CreateFuelDto = {
      externalId: data.record.externalId,
      driverId: data.record.driverId,
      vehicleId: data.record.vehicleId,
      routeId: data.record.routeId,
      routeCode: data.record.routeCode,
      liters: data.record.liters,
      odometer: data.record.odometer,
      gpsLocation: data.record.gpsLocation,
      source: data.record.source,
      estimatedFuelL: data.record.estimatedFuelL,
      distanceKm: data.record.distanceKm,
      recordedAt: data.record.recordedAt,
    };

    const result = await this.fuelService.createRecord(dto);

    // Retornamos estructura enriquecida al Gateway
    return {
      id: result.record.id,
      record: result.record,
      isAnomaly: result.isAnomaly,
      message: result.message
    };
  }

  @GrpcMethod('FuelService', 'GetByVehicle')
  async getByVehicle(data: { vehicleId: string; from?: string; to?: string }) {
    const records = await this.fuelService.getByVehicle(data.vehicleId, data.from, data.to);

    const anomalies = records.filter((r: any) => r.isAnomaly);

    const anomalyRecords = anomalies.map((r: any) => ({
      recordId: r.id,
      deltaPercent: r.deltaPercent,
      liters: r.liters,
      estimatedFuelL: r.estimatedFuelL,
      distanceKm: r.distanceKm,
      recordedAt: r.recordedAt,
    }));

    return {
      records: records,
      anomaliesDetected: anomalies.length,
      anomalyRecords: anomalyRecords
    };
  }

  @GrpcMethod('FuelService', 'GetReport')
  async getReport(data: { from: string; to: string; vehicleIds?: string[]; machineryType?: string }) {
    const items = await this.fuelService.getReport(data);
    return { items };
  }
}