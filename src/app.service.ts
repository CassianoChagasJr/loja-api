import { Injectable } from '@nestjs/common';

// Dados devolvidos pelo GET /health/version (cap. 1)
const healthVersion = {
  name: 'loja-api',
  version: '0.1.0',
};

@Injectable()
export class AppService {
  // GET /
  getHello(): string {
    return 'Hello World!';
  }

  // GET /health/version
  healthVersion(): { name: string; version: string } {
    return healthVersion;
  }
}
