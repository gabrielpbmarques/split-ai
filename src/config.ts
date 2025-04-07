import * as dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  env: string;
  mongoUri: string;
  sentryDsn: string;
}

export const config: IConfig = {
  env: process.env.ENV || process.env.NODE_ENV,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/anthor-agi',
  sentryDsn: process.env.SENTRY_DSN,
};
