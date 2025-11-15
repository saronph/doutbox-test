import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import authConfig from '@crosscutting/config/auth.config';
import { NuvendeAuthService } from '@crosscutting/infra/http/services';
import { User } from '@modules/users/entities';
import { SignInDTO } from '../dtos';
import { JwtPayload } from '../guards/auth.guard';
import { IAuthResponse } from '../interfaces/auth.interface';
import { CryptService } from './crypt.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly cryptService: CryptService,
    private readonly nuvendeAuthService: NuvendeAuthService,
    @Inject(authConfig.KEY)
    private readonly config: ConfigType<typeof authConfig>,
  ) {}

  async signIn({ email, password }: SignInDTO): Promise<IAuthResponse> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const isPasswordValid = await this.cryptService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha inválidos.');
    }

    const accessToken = await this.jwtService.signAsync<JwtPayload>(
      { sub: user.id },
      {
        secret: this.config.accessTokenSecret,
        expiresIn: this.config.accessTokenExpiresIn,
      },
    );

    const refreshToken = await this.jwtService.signAsync<JwtPayload>(
      { sub: user.id },
      {
        secret: this.config.refreshTokenSecret,
        expiresIn: this.config.refreshTokenExpiresIn,
      },
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        pixKey: user.pixKey,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async getNuvendeAccessToken(): Promise<string> {
    return this.nuvendeAuthService.getAccessToken();
  }
}
