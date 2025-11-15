import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  prefixUrl: process.env.API_PREFIX_URL || '/api',
  webUrl: process.env.APP_WEB_URL,
  senderEmail: process.env.SENDER_EMAIL_ADDRESS,
}));
