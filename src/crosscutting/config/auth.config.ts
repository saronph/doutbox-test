import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiresIn: parseInt(
    process.env.ACCESS_TOKEN_EXPIRES_IN || '3600',
    10,
  ),
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiresIn: parseInt(
    process.env.REFRESH_TOKEN_EXPIRES_IN || '3600',
    10,
  ),
}));
