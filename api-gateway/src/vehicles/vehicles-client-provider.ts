import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import{ type ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { VEHICLES_PACKAGE } from 'src/config';

export interface VehiclesService {
  GetAllVehicles(data: { page: number, limit: number }): Observable<{ vehicles: any[] }>;
  GetVehicleById(data: { id: number }): Observable<any>;
  CreateVehicle(data: { vehicle: any }): Observable<any>;
  UpdateVehicle(data: { vehicle: any }): Observable<any>;
  DeleteVehicle(data: { id: number }): Observable<any>;
}

@Injectable()
export class VehiclesClientService implements OnModuleInit {
  private vehiclesService: VehiclesService;

  constructor(@Inject(VEHICLES_PACKAGE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.vehiclesService = this.client.getService<VehiclesService>('VehiclesService');
  }

  getAllVehicles(data: {page: number, limit: number}) {
    return this.vehiclesService.GetAllVehicles( data );
  }

  getVehicleById(id: number) {
    return this.vehiclesService.GetVehicleById({ id });
  }

  createVehicle(vehicle: any) {
    return this.vehiclesService.CreateVehicle({ vehicle });
  }

  updateVehicle(vehicle: any) {
    return this.vehiclesService.UpdateVehicle({ vehicle });
  }

  deleteVehicle(id: number) {
    return this.vehiclesService.DeleteVehicle({ id });
  }
}
