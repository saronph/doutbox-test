import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

import nuvendeApiConfig from '@crosscutting/config/nuvende-api.config';
import {
  INuvendeAuthError,
  INuvendeAuthResponse,
} from '../interfaces/nuvende-auth.interface';

@Injectable()
export class NuvendeAuthService {
  private readonly logger = new Logger(NuvendeAuthService.name);
  private cachedToken: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(
    private readonly httpService: HttpService,
    @Inject(nuvendeApiConfig.KEY)
    private readonly config: ConfigType<typeof nuvendeApiConfig>,
  ) {}

  private encodeCredentials(): string {
    const credentials = `${this.config.clientId}:${this.config.clientSecret}`;
    return Buffer.from(credentials).toString('base64');
  }

  private isTokenValid(): boolean {
    if (!this.cachedToken || !this.tokenExpiresAt) {
      return false;
    }

    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    return this.tokenExpiresAt > fiveMinutesFromNow;
  }

  async getAccessToken(): Promise<string> {
    if (this.isTokenValid() && this.cachedToken) {
      this.logger.log('Usando token em cache');
      return this.cachedToken;
    }

    return this.authenticate();
  }

  async authenticate(): Promise<string> {
    this.logger.log('Autenticando na API Nuvende...');

    try {
      const credentials = this.encodeCredentials();
      const url = `${this.config.baseUrl}/auth/login`;

      const response = await firstValueFrom(
        this.httpService
          .post<INuvendeAuthResponse>(
            url,
            {
              grant_type: 'client_credentials',
              scope:
                'kyc.background-check.natural-person kyc.background-check.legal-person cob.write cob.read webhooks.read webhooks.write merchants.read merchants.write terminals.read terminals.write transactions.read transactions.write',
            },
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${credentials}`,
              },
            },
          )
          .pipe(
            catchError((error: AxiosError<INuvendeAuthError>) => {
              const status = error.response?.status;
              const data = error.response?.data as unknown as Record<
                string,
                unknown
              > | null;

              this.logger.error(
                `Erro ao autenticar na API Nuvende (status ${
                  status ?? 'unknown'
                })`,
                data ?? error,
              );

              if (data && typeof data === 'object') {
                const message =
                  (data['error_description'] as string) ||
                  (data['message'] as string) ||
                  error.message;

                throw new BadRequestException(
                  `Erro ao autenticar na API Nuvende: ${message}`,
                );
              }

              throw new BadRequestException(
                'Erro inesperado ao autenticar na API Nuvende',
              );
            }),
          ),
      );

      const { access_token, expires_in } = response.data;

      this.cachedToken = access_token;

      const expiresInSeconds = expires_in || 3600;
      this.tokenExpiresAt = new Date(Date.now() + expiresInSeconds * 1000);

      this.logger.log('Autenticação realizada com sucesso');

      return access_token;
    } catch (error) {
      this.logger.error('Erro ao autenticar na API Nuvende', error);
      throw error;
    }
  }

  clearCache(): void {
    this.cachedToken = null;
    this.tokenExpiresAt = null;
    this.logger.log('Cache de token limpo');
  }
}
