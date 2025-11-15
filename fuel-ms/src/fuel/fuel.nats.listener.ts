import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { FuelService } from './fuel.service';
import { FuelSource } from './dto/create-fuel.dto';

@Injectable()
export class FuelEventsListener {
  private readonly logger = new Logger(FuelEventsListener.name);

  constructor(private readonly fuelService: FuelService) {}

  @EventPattern('route.completed')
  async handleRouteCompleted(@Payload() payload: any) {
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
}
