import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { ROUTES_PACKAGE } from 'src/config';

export interface RouteService {
  GetAllRoutes(data: { page: number; limit: number }): Observable<{ routes: any[]; total: number; page: number; totalPages: number }>;
  GetRouteById(data: { id: number }): Observable<any>;
  CreateRoute(data: {
    origin: string;
    destination: string;
    distanceKm: number;
    machineryType: string;
    estimatedFuelL?: number;
    status?: string;
    scheduledAt?: string;
    driverId: string;
    vehicleId: number;
  }): Observable<any>;
  UpdateRoute(data: {
    id: number;
    code?: string;
    origin?: string;
    destination?: string;
    distanceKm?: number;
    estimatedFuelL?: number;
    status?: string;
    scheduledAt?: string;
    driverId?: string;
    vehicleId?: number;
  }): Observable<any>;
  DeleteRoute(data: { id: number }): Observable<any>;
}

@Injectable()
export class RoutesClientService implements OnModuleInit {
  private routesService: RouteService;

  constructor(@Inject(ROUTES_PACKAGE) private readonly client: ClientGrpc) { }

  onModuleInit() {
    this.routesService = this.client.getService<RouteService>('RouteService');
  }

  getAllRoutes(data: { page: number; limit: number }) {
    return this.routesService.GetAllRoutes(data);
  }

  getRouteById(id: number) {
    return this.routesService.GetRouteById({ id });
  }

  createRoute(data: {
    origin: string;
    destination: string;
    distanceKm: number;
    machineryType: string;
    estimatedFuelL?: number;
    status?: string;
    scheduledAt?: string;
    driverId: string;
    vehicleId: number;
  }) {
    return this.routesService.CreateRoute(data);
  }

  updateRoute(data: {
    id: number;
    code?: string;
    origin?: string;
    destination?: string;
    distanceKm?: number;
    estimatedFuelL?: number;
    status?: string;
    scheduledAt?: string;
    driverId?: string;
    vehicleId?: number;
  }) {
    return this.routesService.UpdateRoute(data);
  }

  deleteRoute(id: number) {
    return this.routesService.DeleteRoute({ id });
  }
}
