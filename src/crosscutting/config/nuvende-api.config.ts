import { registerAs } from '@nestjs/config';

export default registerAs('nuvendeApi', () => ({
  baseUrl: process.env.NUVENDE_API_BASE_URL || '',
  clientId: process.env.NUVENDE_CLIENT_ID || '',
  clientSecret: process.env.NUVENDE_CLIENT_SECRET || '',
  accountId: process.env.NUVENDE_ACCOUNT_ID || '',
  defaultPixKey: process.env.NUVENDE_DEFAULT_PIX_KEY || '',
  chavePix: process.env.NUVENDE_CHAVE_PIX || '',
}));
