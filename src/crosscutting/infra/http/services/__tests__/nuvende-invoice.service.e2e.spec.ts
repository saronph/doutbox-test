import { HttpModule } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { createServer, IncomingMessage, Server, ServerResponse } from 'http';

import nuvendeApiConfig from '@crosscutting/config/nuvende-api.config';

import { NuvendeAuthService } from '../nuvende-auth.service';
import { NuvendeInvoiceService } from '../nuvende-invoice.service';

describe('NuvendeInvoiceService (E2E)', () => {
  let server: Server;

  const baseConfig = {
    clientId: 'client-id',
    clientSecret: 'client-secret',
    chavePix: 'pix-key',
    accountId: '',
    defaultPixKey: '',
    baseUrl: '',
  };

  const payload = {
    chave: '59ba4ca7-e1d4-433f-8dbf-77e692434a69',
    txid: 'TX12345',
    nomeRecebedor: 'Loja Exemplo',
    valor: { original: '10.50' },
    devedor: { nome: 'Cliente', cpf: '12345678900' },
  };

  let authToken = 'token-e2e';

  function startServer(
    handler: (req: IncomingMessage, res: ServerResponse) => void,
  ) {
    return new Promise<string>((resolve) => {
      const s = createServer(handler);
      s.listen(0, () => {
        const addr = s.address();
        if (!addr || typeof addr !== 'object')
          throw new Error('No server address');
        resolve(`http://127.0.0.1:${addr.port}`);
      });
      server = s;
    });
  }

  async function createTestingModule(baseUrl: string) {
    return Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        NuvendeInvoiceService,
        NuvendeAuthService,
        {
          provide: nuvendeApiConfig.KEY,
          useValue: { ...baseConfig, baseUrl },
        },
      ],
    }).compile();
  }

  afterEach(() => {
    server?.close();
  });

  it('should create an invoice', async () => {
    const url = await startServer((req, res) => {
      if (req.method === 'POST' && req.url === '/auth/login') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({ access_token: authToken, expires_in: 3600 }),
        );
      }

      if (req.method === 'PUT' && req.url === `/cobranca/cob/${payload.txid}`) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ txid: payload.txid }));
      }

      res.writeHead(404);
      res.end();
    });

    const moduleRef = await createTestingModule(url);
    const service = moduleRef.get(NuvendeInvoiceService);

    const response = await service.createInvoice(payload);
    expect(response).toEqual({ txid: payload.txid });
  });

  it('should throw an error when the API returns an error payload', async () => {
    const url = await startServer((req, res) => {
      if (req.url === '/auth/login') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ access_token: authToken }));
      }

      if (req.method === 'PUT' && req.url === `/cobranca/cob/${payload.txid}`) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ detail: 'Erro ao criar cobrança' }));
      }

      res.writeHead(404);
      res.end();
    });

    const moduleRef = await createTestingModule(url);
    const service = moduleRef.get(NuvendeInvoiceService);

    await expect(service.createInvoice(payload)).rejects.toThrow(
      /Erro ao criar cobrança/,
    );
  });
});
