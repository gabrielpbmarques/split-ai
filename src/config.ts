import * as dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  env: string;
  jwtSecret: string;
  mongoUri: string;
  sentryDsn: string;
}

export const config: IConfig = {
  env: process.env.ENV,
  jwtSecret: process.env.JWT_SECRET,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/token-service',
  sentryDsn: process.env.SENTRY_DSN,
};
