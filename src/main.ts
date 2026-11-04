import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Ponto de entrada da API
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validação global dos DTOs (class-validator) em TODAS as rotas
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // remove campos que não estão no DTO
      forbidNonWhitelisted: true, // ...e, em vez de remover, responde 400
    }),
  );

  // Swagger: documentação interativa em /api, com botão Authorize (Bearer)
  const configSwagger = new DocumentBuilder()
    .setTitle('Loja API')
    .setDescription(
      'API para gerenciamento de produtos, pedidos e autenticação de usuários',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configSwagger);
  SwaggerModule.setup('api', app, document);

  // Porta do .env (PORT) ou 3000
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
