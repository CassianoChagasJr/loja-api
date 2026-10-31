import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getHealthVersion(): { name: string; version: string } {
    return { name: 'loja-api', version: '0.1.0' };
  }
}
