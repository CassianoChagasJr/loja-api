import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service.js';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
