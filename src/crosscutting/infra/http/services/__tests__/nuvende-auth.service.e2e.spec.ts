import { HttpModule } from '@nestjs/axios';
import { Test } from '@nestjs/testing';
import { createServer, IncomingMessage, ServerResponse } from 'http';

import nuvendeApiConfig from '@crosscutting/config/nuvende-api.config';
import { NuvendeAuthService } from '../nuvende-auth.service';

describe('NuvendeAuthService (E2E)', () => {
  let service: NuvendeAuthService;
  let server: ReturnType<typeof createServer>;
  let serverUrl: string;

  const config = {
    baseUrl: '',
    clientId: 'integration-client-id',
    clientSecret: 'integration-client-secret',
    accountId: '',
    defaultPixKey: '',
    chavePix: '',
  };

  const successHandler = (
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
  ) => {
    if (req.method === 'POST' && req.url === '/auth/login') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const hasGrant = body.includes('grant_type=client_credentials');
        const hasAuth = req.headers.authorization?.includes('Basic');

        if (!hasGrant) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(
            JSON.stringify({ error_description: 'Invalid payload' }),
          );
        }

        if (!hasAuth) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error_description: 'Auth missing' }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            access_token: 'integration-access-token',
            expires_in: 3600,
          }),
        );
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  };

  beforeAll(async () => {
    server = createServer(successHandler);

    await new Promise<void>((resolve) => server.listen(0, resolve));

    const address = server.address();
    if (address && typeof address === 'object') {
      serverUrl = `http://127.0.0.1:${address.port}`;
    }

    config.baseUrl = serverUrl;

    const moduleRef = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [
        NuvendeAuthService,
        {
          provide: nuvendeApiConfig.KEY,
          useValue: config,
        },
      ],
    }).compile();

    service = moduleRef.get(NuvendeAuthService);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    server.removeAllListeners('request');
    server.on('request', successHandler);
  });

  it('should authenticate on the local server and return the token', async () => {
    const token = await service.authenticate();
    expect(token).toBe('integration-access-token');
  });

  it('should throw an exception when the server returns an error', async () => {
    server.removeAllListeners('request');
    server.on(
      'request',
      (req: IncomingMessage, res: ServerResponse<IncomingMessage>) => {
        if (req.method === 'POST' && req.url === '/auth/login') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({ error_description: 'Credenciais inválidas' }),
          );
        } else {
          res.writeHead(404);
          res.end();
        }
      },
    );

    await expect(service.authenticate()).rejects.toThrow(
      /Credenciais inválidas/,
    );
  });
});
