import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '@crosscutting/config/app.config';
import authConfig from '@crosscutting/config/auth.config';
import nuvendeApiConfig from '@crosscutting/config/nuvende-api.config';
import { AuthModule } from '@modules/auth/auth.module';
import { InvoicesModule } from '@modules/invoices/invoices.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import AppDataSource from '../ormconfig';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, authConfig, nuvendeApiConfig],
      expandVariables: true,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    AuthModule,
    InvoicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
