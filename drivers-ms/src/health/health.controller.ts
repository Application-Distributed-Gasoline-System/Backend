import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get('liveness')
  @HealthCheck()
  checkLiveness() {
    return this.health.check([
      async () => this.http.pingCheck('self', 'http://localhost:3000'), // verifica que el servidor responda
    ]);
  }

  @Get('readiness')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      async () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024), // máx. 300MB de heap
      async () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9, // falla si disco > 90% lleno
        }),
    ]);
  }
}
