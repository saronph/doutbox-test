import { HttpModule as NestHttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import nuvendeApiConfig from '@crosscutting/config/nuvende-api.config';
import { NuvendeAuthService, NuvendeInvoiceService } from './services';

@Module({
  imports: [
    ConfigModule.forFeature(nuvendeApiConfig),
    NestHttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
  ],
  providers: [NuvendeAuthService, NuvendeInvoiceService],
  exports: [NuvendeAuthService, NuvendeInvoiceService],
})
export class HttpModule {}
