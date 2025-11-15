import { HttpService } from '@nestjs/axios';
import { ConfigType } from '@nestjs/config';

import nuvendeApiConfig from '@crosscutting/config/nuvende-api.config';

import { NuvendeAuthService } from '../nuvende-auth.service';

describe('NuvendeAuthService', () => {
  let service: NuvendeAuthService;
  let httpService: jest.Mocked<HttpService>;
  const config: ConfigType<typeof nuvendeApiConfig> = {
    baseUrl: 'https://api.nuvende.test',
    clientId: 'my-client-id',
    clientSecret: 'my-client-secret',
    accountId: '',
    defaultPixKey: '',
    chavePix: '',
  };

  beforeEach(() => {
    httpService = {
      post: jest.fn(),
    } as unknown as jest.Mocked<HttpService>;

    service = new NuvendeAuthService(httpService, config);
  });

  it('should return a token when getAccessToken is called and the token is valid', async () => {
    const authenticateSpy = jest
      .spyOn(service, 'authenticate')
      .mockResolvedValue('novo-token');

    (service as unknown as { cachedToken: string }).cachedToken =
      'token-em-cache';
    (service as unknown as { tokenExpiresAt: Date }).tokenExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000,
    );

    const token = await service.getAccessToken();

    expect(token).toBe('token-em-cache');
    expect(authenticateSpy).not.toHaveBeenCalled();
  });

  it('should authenticate again when the token is expired', async () => {
    const authenticateSpy = jest
      .spyOn(service, 'authenticate')
      .mockResolvedValue('novo-token');

    (service as unknown as { cachedToken: string }).cachedToken =
      'token-expirado';
    (service as unknown as { tokenExpiresAt: Date }).tokenExpiresAt = new Date(
      Date.now() + 2 * 60 * 1000,
    );

    const token = await service.getAccessToken();

    expect(token).toBe('novo-token');
    expect(authenticateSpy).toHaveBeenCalledTimes(1);
  });

  it('should clear the token and expiration in memory', () => {
    (service as unknown as { cachedToken: string }).cachedToken = 'token';
    (service as unknown as { tokenExpiresAt: Date }).tokenExpiresAt =
      new Date();

    service.clearCache();

    expect(
      (service as unknown as { cachedToken: string | null }).cachedToken,
    ).toBeNull();
    expect(
      (service as unknown as { tokenExpiresAt: Date | null }).tokenExpiresAt,
    ).toBeNull();
  });

  it('should correctly encode credentials using encodeCredentials', () => {
    const encoded = (
      service as unknown as {
        encodeCredentials: () => string;
      }
    ).encodeCredentials();

    const expected = Buffer.from(
      `${config.clientId}:${config.clientSecret}`,
    ).toString('base64');

    expect(encoded).toBe(expected);
  });
});
