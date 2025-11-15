import { Inject, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFuelDto, FuelSource } from './dto/create-fuel.dto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class FuelService {
  private readonly logger = new Logger(FuelService.name);
  private readonly ANOMALY_THRESHOLD_PERCENT = Number(process.env.FUEL_ANOMALY_THRESHOLD ?? 30);

  constructor(private prisma: PrismaService, @Inject('NATS_SERVICE') private natsClient: ClientProxy) { }

  private computeDelta(liters: number, estimated?: number): number | null {
    if (estimated == null || estimated === 0) return null;
    return ((liters - estimated) / estimated) * 100;
  }

  private normalizeDate(s?: string) {
    return s ? new Date(s) : new Date();
  }

  private normalizeSource(s?: string) {
    if (!s) return FuelSource.MANUAL;
    const lower = s.toString().toLowerCase();
    if (lower === FuelSource.SENSOR) return FuelSource.SENSOR;
    if (lower === FuelSource.ROUTE_COMPLETION) return FuelSource.ROUTE_COMPLETION;
    return FuelSource.MANUAL;
  }

  async createRecord(dto: CreateFuelDto) {
    // idempotency
    if (dto.externalId) {
      const existing = await this.prisma.fuelRecord.findFirst({ where: { externalId: dto.externalId } });
      if (existing) {
        this.logger.warn(`Registro ya procesado (externalId=${dto.externalId})`);
        return existing;
      }
    }

    const recordedAt = this.normalizeDate(dto.recordedAt);
    const delta = this.computeDelta(dto.liters, dto.estimatedFuelL);

    const data: any = {
      externalId: dto.externalId,
      driverId: dto.driverId,
      vehicleId: dto.vehicleId,
      routeId: dto.routeId ?? null,
      liters: dto.liters,
      fuelType: dto.fuelType,
      machineryType: dto.machineryType,
      odometer: dto.odometer ?? null,
      gpsLocation: dto.gpsLocation ?? null,
      source: this.normalizeSource(dto.source as any),
      estimatedFuelL: dto.estimatedFuelL ?? null,
      distanceKm: dto.distanceKm ?? null,
      deltaPercent: delta,
      recordedAt,
    };

    const created = await this.prisma.fuelRecord.create({ data });

    // Publish events
    this.natsClient.emit('fuel.recorded', {
      recordId: created.id,
      vehicleId: created.vehicleId,
      driverId: created.driverId,
      liters: created.liters,
      recordedAt: created.recordedAt,
      routeId: created.routeId,
      deltaPercent: created.deltaPercent,
    });

    if (delta !== null && Math.abs(delta) >= this.ANOMALY_THRESHOLD_PERCENT) {
      this.natsClient.emit('fuel.anomaly', {
        recordId: created.id,
        vehicleId: created.vehicleId,
        deltaPercent: created.deltaPercent,
        threshold: this.ANOMALY_THRESHOLD_PERCENT,
      });
    }

    return created;
  }

  async getByVehicle(vehicleId: string, from?: string, to?: string) {
    const where: any = { vehicleId };
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = new Date(from);
      if (to) where.recordedAt.lte = new Date(to);
    }

    return this.prisma.fuelRecord.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
    });
  }

  async getReport({ from, to, vehicleIds, machineryType }: { from: string; to: string; vehicleIds?: string[]; machineryType?: string }) {
    const where: any = {};
    if (from || to) {
      where.recordedAt = {};
      if (from) where.recordedAt.gte = new Date(from);
      if (to) where.recordedAt.lte = new Date(to);
    }
    if (vehicleIds && vehicleIds.length) where.vehicleId = { in: vehicleIds };
    if (machineryType) where.machineryType = machineryType;

    const records = await this.prisma.fuelRecord.findMany({ where });

    const map = new Map<string, { totalLiters: number; totalKm: number; count: number }>();
    for (const r of records) {
      const v = map.get(r.vehicleId) ?? { totalLiters: 0, totalKm: 0, count: 0 };
      v.totalLiters += r.liters ?? 0;
      v.totalKm += r.distanceKm ?? 0;
      v.count += 1;
      map.set(r.vehicleId, v);
    }

    return Array.from(map.entries()).map(([vehicleId, agg]) => ({
      vehicleId,
      totalLiters: agg.totalLiters,
      avgLitersPerKm: agg.totalKm ? agg.totalLiters / agg.totalKm : 0,
      recordsCount: agg.count,
    }));
  }
}
