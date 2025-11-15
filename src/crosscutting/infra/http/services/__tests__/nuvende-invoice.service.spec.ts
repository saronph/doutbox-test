import { HttpService } from '@nestjs/axios';
import { BadRequestException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { AxiosError, AxiosResponse } from 'axios';
import { of, throwError } from 'rxjs';

import nuvendeApiConfig from '@crosscutting/config/nuvende-api.config';
import { NuvendeAuthService } from '../nuvende-auth.service';
import { NuvendeInvoiceService } from '../nuvende-invoice.service';

describe('NuvendeInvoiceService', () => {
  let service: NuvendeInvoiceService;
  let httpService: jest.Mocked<HttpService>;
  let nuvendeAuthService: jest.Mocked<NuvendeAuthService>;

  const config: ConfigType<typeof nuvendeApiConfig> = {
    baseUrl: 'https://api.nuvende.test',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    accountId: '',
    defaultPixKey: '',
    chavePix: 'pix-key-from-config',
  };

  const payload = {
    txid: 'TX12345',
    nomeRecebedor: 'Loja Exemplo',
    valor: {
      original: '10.50',
      modalidadeAlteracao: 1,
    },
    devedor: {
      nome: 'Cliente',
      cpf: '12345678901',
    },
    solicitacaoPagador: 'Pagar em 2 dias',
    calendario: {
      expiracao: 3600,
    },
    infoAdicionais: [
      { nome: 'pedido', valor: '123' },
      { nome: 'referencia', valor: 'ABC' },
    ],
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        NuvendeInvoiceService,
        {
          provide: nuvendeApiConfig.KEY,
          useValue: config,
        },
        {
          provide: HttpService,
          useValue: {
            put: jest.fn(),
          },
        },
        {
          provide: NuvendeAuthService,
          useValue: {
            getAccessToken: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(NuvendeInvoiceService);
    httpService = moduleRef.get(HttpService);
    nuvendeAuthService = moduleRef.get(NuvendeAuthService);
  });

  describe('CreateInvoice', () => {
    it('should send PUT with correct body and headers', async () => {
      nuvendeAuthService.getAccessToken.mockResolvedValue('mocked-token');

      const mockedResponse = {
        data: { txid: payload.txid },
      } as AxiosResponse;

      httpService.put.mockReturnValue(of(mockedResponse));

      const response = await service.createInvoice(payload);

      expect(response).toEqual({ txid: payload.txid });

      expect(httpService.put).toHaveBeenCalledWith(
        `${config.baseUrl}/cobranca/cob/${payload.txid}`,
        expect.objectContaining({
          chave: config.chavePix,
          nomeRecebedor: payload.nomeRecebedor,
        }),
        {
          headers: expect.objectContaining({
            Authorization: 'Bearer mocked-token',
            'Content-Type': 'application/json',
          }),
        },
      );
    });

    it('should throw BadRequestException when the API returns an error', async () => {
      nuvendeAuthService.getAccessToken.mockResolvedValue('mocked-token');

      const axiosError = {
        response: {
          status: 400,
          data: {
            detail: 'Erro de validação',
          },
        },
        message: 'Bad Request',
      } as AxiosError;

      httpService.put.mockReturnValue(throwError(() => axiosError));

      const promise = service.createInvoice(payload);

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow(/Erro de validação/);
    });

    it('should throw an error when getAccessToken fails', async () => {
      nuvendeAuthService.getAccessToken.mockRejectedValue(
        new Error('auth failed'),
      );

      await expect(service.createInvoice(payload)).rejects.toThrow(
        'auth failed',
      );
    });

    it('should throw an error if the API returns no data', async () => {
      nuvendeAuthService.getAccessToken.mockResolvedValue('mocked-token');

      const mockedResponse = {
        data: undefined,
      } as unknown as AxiosResponse;

      httpService.put.mockReturnValue(of(mockedResponse));

      await expect(service.createInvoice(payload)).rejects.toThrow(
        /Resposta inválida da API/,
      );
    });
  });
});
