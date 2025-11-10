import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { FUEL_PACKAGE } from 'src/config'; 


export interface FuelServiceGrpc {
  GetAllFuelRecords(data: { page: number; limit: number }): Observable<any>;
  GetFuelRecordById(data: { id: string }): Observable<any>;
  CreateFuelRecord(data: {
    driverId: string;
    vehicleId: string;
    routeId?: string;
    liters: number;
    fuelType: string;
    machineryType: string;
    gpsLocation?: string;
    userId: string;
  }): Observable<any>;

  UpdateFuelRecord(data: {
    id: string;
    liters?: number;
    fuelType?: string;
    machineryType?: string;
    gpsLocation?: string;
    routeId?: string;
    userId: string;
  }): Observable<any>;

  DeleteFuelRecord(data: { id: string }): Observable<any>;

  GetFuelRecordsByDriver(data: { driverId: string; page: number; limit: number }): Observable<any>;
  GetFuelRecordsByVehicle(data: { vehicleId: string; page: number; limit: number }): Observable<any>;
}

// ====== Cliente ======

@Injectable()
export class FuelClientService implements OnModuleInit {
  private fuelService: FuelServiceGrpc;

  constructor(
    @Inject(FUEL_PACKAGE) private readonly client: ClientGrpc
  ) {}

  onModuleInit() {
    this.fuelService = this.client.getService<FuelServiceGrpc>('FuelService');
  }

  getAllFuelRecords(page: number, limit: number) {
    return this.fuelService.GetAllFuelRecords({ page, limit });
  }

  getFuelRecordById(id: string) {
    return this.fuelService.GetFuelRecordById({ id });
  }

  createFuelRecord(data: {
    driverId: string;
    vehicleId: string;
    routeId?: string;
    liters: number;
    fuelType: string;
    machineryType: string;
    gpsLocation?: string;
    userId: string;
  }) {
    return this.fuelService.CreateFuelRecord(data);
  }

  updateFuelRecord(data: {
    id: string;
    liters?: number;
    fuelType?: string;
    machineryType?: string;
    gpsLocation?: string;
    routeId?: string;
    userId: string;
  }) {
    return this.fuelService.UpdateFuelRecord(data);
  }

  deleteFuelRecord(id: string) {
    return this.fuelService.DeleteFuelRecord({ id });
  }

  getFuelRecordsByDriver(driverId: string, page: number, limit: number) {
    return this.fuelService.GetFuelRecordsByDriver({ driverId, page, limit });
  }

  getFuelRecordsByVehicle(vehicleId: string, page: number, limit: number) {
    return this.fuelService.GetFuelRecordsByVehicle({ vehicleId, page, limit });
  }
}
