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
import { INuvendeInvoicePayload, INuvendeInvoiceResponse } from '../interfaces';
import { NuvendeAuthService } from './nuvende-auth.service';

@Injectable()
export class NuvendeInvoiceService {
  private readonly logger = new Logger(NuvendeInvoiceService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly nuvendeAuthService: NuvendeAuthService,
    @Inject(nuvendeApiConfig.KEY)
    private readonly config: ConfigType<typeof nuvendeApiConfig>,
  ) {}

  async createInvoice(
    payload: INuvendeInvoicePayload,
  ): Promise<INuvendeInvoiceResponse> {
    const accessToken = await this.nuvendeAuthService.getAccessToken();
    const baseUrl = this.config.baseUrl.endsWith('/')
      ? this.config.baseUrl.slice(0, -1)
      : this.config.baseUrl;
    const url = `${baseUrl}/cobranca/cob/${payload.txid}`;

    const requestBody: Record<string, unknown> = {
      chave: this.config.chavePix,
      nomeRecebedor: payload.nomeRecebedor,
      valor: {
        original: payload.valor.original,
        ...(payload.valor.modalidadeAlteracao !== undefined && {
          modalidadeAlteracao: payload.valor.modalidadeAlteracao,
        }),
      },
      devedor: {
        nome: payload.devedor.nome,
        ...(payload.devedor.cpf && { cpf: payload.devedor.cpf }),
        ...(payload.devedor.cnpj && { cnpj: payload.devedor.cnpj }),
      },
      ...(payload.solicitacaoPagador && {
        solicitacaoPagador: payload.solicitacaoPagador,
      }),
      ...(payload.calendario &&
        Object.keys(payload.calendario).length > 0 && {
          calendario: payload.calendario,
        }),
      ...(payload.infoAdicionais &&
        payload.infoAdicionais.length > 0 && {
          infoAdicionais: payload.infoAdicionais,
        }),
    };

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: '*/*',
    };

    const response = await firstValueFrom(
      this.httpService
        .put<INuvendeInvoiceResponse>(url, requestBody, {
          headers,
        })
        .pipe(
          catchError((error: AxiosError) => {
            const status = error.response?.status;
            const data = error.response?.data as Record<string, unknown> | null;

            this.logger.error(
              `Erro ao criar cobrança Invoice (status ${status ?? 'unknown'})`,
              data ?? error,
            );

            if (data && typeof data === 'object') {
              const message =
                (data['message'] as string) ||
                (data['detail'] as string) ||
                error.message;
              throw new BadRequestException(
                `Erro ao criar cobrança Invoice: ${message}`,
              );
            }

            throw new BadRequestException(
              'Erro inesperado ao criar cobrança Invoice',
            );
          }),
        ),
    );

    if (!response.data) {
      throw new BadRequestException(
        'Resposta inválida da API Nuvende ao criar cobrança',
      );
    }

    return response.data;
  }
}
