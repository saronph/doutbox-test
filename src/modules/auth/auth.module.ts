import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import appConfig from '@crosscutting/config/app.config';
import authConfig from '@crosscutting/config/auth.config';
import { HttpModule } from '@crosscutting/infra/http/http.module';
import { User } from '@modules/users/entities';
import { AuthController } from './controllers/auth.controller';
import { NuvendeController } from './controllers/nuvende.controller';
import { AuthGuard } from './guards/auth.guard';
import { AuthService, CryptService } from './services';

@Module({
  imports: [
    ConfigModule.forFeature(authConfig),
    ConfigModule.forFeature(appConfig),
    TypeOrmModule.forFeature([User]),
    HttpModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController, NuvendeController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
    CryptService,
    JwtService,
  ],
  exports: [AuthService, JwtService, JwtModule],
})
export class AuthModule {}
