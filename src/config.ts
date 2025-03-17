import * as dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  env: string;
  mongoUri: string;
  sentryDsn: string;
  tokenExpirationTime: number;
}

export const config: IConfig = {
  env: process.env.ENV,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/token-service',
  sentryDsn: process.env.SENTRY_DSN,
  tokenExpirationTime: Number(process.env.TOKEN_EXPIRATION_TIME),
};
