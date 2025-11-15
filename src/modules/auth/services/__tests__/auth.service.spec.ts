import { UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';

import authConfig from '@crosscutting/config/auth.config';
import { NuvendeAuthService } from '@crosscutting/infra/http/services';
import { User } from '@modules/users/entities';
import { CryptService } from '../crypt.service';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;
  let cryptService: jest.Mocked<CryptService>;
  let nuvendeAuthService: jest.Mocked<NuvendeAuthService>;

  const config: ConfigType<typeof authConfig> = {
    accessTokenSecret: 'access-secret',
    accessTokenExpiresIn: 86400,
    refreshTokenSecret: 'refresh-secret',
    refreshTokenExpiresIn: 2592000,
  };

  const user: User = {
    id: 'user-id',
    name: 'User Name',
    email: 'user@example.com',
    password: 'hashed',
    pixKey: 'pix-key',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: CryptService,
          useValue: {
            compare: jest.fn(),
          },
        },
        {
          provide: NuvendeAuthService,
          useValue: {
            getAccessToken: jest.fn(),
          },
        },
        {
          provide: authConfig.KEY,
          useValue: config,
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
    usersRepository = moduleRef.get(getRepositoryToken(User));
    jwtService = moduleRef.get(JwtService);
    cryptService = moduleRef.get(CryptService);
    nuvendeAuthService = moduleRef.get(NuvendeAuthService);
  });

  describe('signIn', () => {
    it('should authenticate and return tokens', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      cryptService.compare.mockResolvedValue(true);
      jwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');

      const response = await service.signIn({
        email: user.email,
        password: 'password',
      });

      expect(response).toEqual({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          pixKey: user.pixKey,
        },
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      });

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { email: user.email },
      });
      expect(cryptService.compare).toHaveBeenCalledWith(
        'password',
        user.password,
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        { sub: user.id },
        {
          secret: config.accessTokenSecret,
          expiresIn: config.accessTokenExpiresIn,
        },
      );
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: user.id },
        {
          secret: config.refreshTokenSecret,
          expiresIn: config.refreshTokenExpiresIn,
        },
      );
    });

    it('should throw an error if the user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(
        service.signIn({ email: user.email, password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw an error if the password is invalid', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      cryptService.compare.mockResolvedValue(false);

      await expect(
        service.signIn({ email: user.email, password: 'password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
