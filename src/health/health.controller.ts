import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/auth/auth.guard';

@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check() {
    return { status: 'ok' };
  }
}
