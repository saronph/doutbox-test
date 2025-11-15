import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { InvoicesController } from '../invoices.controller';
import { InvoicesService } from '../../services/invoices.service';
import { APP_GUARD } from '@nestjs/core';
import { INuvendeInvoiceResponse } from '@crosscutting/infra/http/interfaces';

describe('Invoices (E2E)', () => {
  let app: INestApplication;

  const mockInvoiceResponse: INuvendeInvoiceResponse = {
    txid: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
    revisao: 0,
    status: 'ATIVA',
    calendario: {
      criacao: '2023-01-01T00:00:00Z',
      expiracao: 3600,
    },
    devedor: {
      nome: 'Maria Santos',
      cpf: '40352056053',
    },
    valor: {
      original: '150.50',
    },
    chave: 'pix-key',
    solicitacaoPagador: 'Pagamento do pedido 123',
    qrCode: 'abc123',
    raw: {
      txid: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
      revisao: 0,
      status: 'ATIVA',
      calendario: {
        criacao: '2023-01-01T00:00:00Z',
        expiracao: 3600,
      },
      devedor: {
        nome: 'Maria Santos',
        cpf: '40352056053',
      },
      valor: {
        original: '150.50',
      },
      chave: 'pix-key',
      solicitacaoPagador: 'Pagamento do pedido 123',
      qrCode: 'abc123',
    },
  };

  const mockedInvoicesService = {
    create: jest.fn().mockResolvedValue(mockInvoiceResponse),
  };

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoicesService,
          useValue: mockedInvoicesService,
        },
        {
          provide: APP_GUARD,
          useValue: {
            canActivate: () => true,
          },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /invoices → cria invoice e retorna somente qrCode + status', async () => {
    const payload = {
      nomeRecebedor: 'Loja Exemplo LTDA',
      txid: 'A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6',
      solicitacaoPagador: 'Pagamento do pedido 123',
      calendario: {
        expiracao: 3600,
      },
      valor: {
        original: '150.50',
        modalidadeAlteracao: 1,
      },
      devedor: {
        nome: 'Maria Santos',
        cpf: '40352056053',
      },
    };

    const res = await request(app.getHttpServer())
      .post('/invoices')
      .send(payload)
      .expect(201);

    expect(res.body).toEqual({
      qrCode: 'abc123',
      status: 'ATIVA',
    });

    expect(mockedInvoicesService.create).toHaveBeenCalledTimes(1);
  });

  it('POST /invoices → valida DTO (deve falhar com payload inválido)', async () => {
    const invalidPayload = {};

    const res = await request(app.getHttpServer())
      .post('/invoices')
      .send(invalidPayload)
      .expect(400);

    expect(res.body.message).toBeDefined();
  });
});
