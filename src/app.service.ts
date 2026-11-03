import { Injectable } from '@nestjs/common';

const healthVersion = {
  name: 'loja-api',
  version: '0.1.0',
};

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  healthVersion(): { name: string; version: string } {
    return healthVersion;
  }
}
