import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'bff',
      name: 'trading-artificial',
      timestamp: new Date().toISOString(),
    };
  }
}
