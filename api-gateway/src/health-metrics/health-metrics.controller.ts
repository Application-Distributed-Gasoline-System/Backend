import { Controller, Get, Res } from '@nestjs/common';
import { Registry, collectDefaultMetrics } from 'prom-client';
import type { Response } from 'express';
import { Public } from '../auth/public.decorator';

const register = new Registry();
collectDefaultMetrics({ register });

@Controller()
export class HealthMetricsController {
  @Public()
  @Get('health')
  getHealth() {
    return { status: 'ok', service: 'api-gateway', timestamp: new Date() };
  }
  @Public()
  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    const metrics = await register.metrics();
    res.setHeader('Content-Type', register.contentType);
    res.send(metrics);
  }
}
