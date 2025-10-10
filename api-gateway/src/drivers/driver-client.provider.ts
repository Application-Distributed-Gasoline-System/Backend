import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import{ type ClientGrpc } from '@nestjs/microservices';
import type { Observable } from 'rxjs';import { DRIVERS_PACKAGE } from 'src/config';
;

export interface DriversService {
  GetAllDrivers(data: { page: number, limit: number }): Observable<{ drivers: any[] }>;
  GetDriverById(data: { id: string }): Observable<any>;
  CreateDriver(data: { name: string; userId: string }): Observable<any>;
  UpdateDriver(data: { id: string; name: string; license: string }): Observable<any>;
  DeleteDriver(data: { id: string }): Observable<any>;
}

@Injectable()
export class DriversClientService implements OnModuleInit {
  private driversService: DriversService;

  constructor(@Inject(DRIVERS_PACKAGE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.driversService = this.client.getService<DriversService>('DriversService');
  }

  getAllDrivers(data: {page: number, limit: number}) {
    return this.driversService.GetAllDrivers( data );
  }

  getDriverById(id: string) {
    return this.driversService.GetDriverById({ id });
  }

  createDriver(data: { name: string; userId: string }) {
    return this.driversService.CreateDriver(data);
  }

  updateDriver(data: { id: string; name: string; license: string }) {
    return this.driversService.UpdateDriver(data);
  }

  deleteDriver(id: string) {
    return this.driversService.DeleteDriver({ id });
  }
}

