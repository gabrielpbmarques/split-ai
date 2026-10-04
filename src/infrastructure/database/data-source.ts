import { DataSource } from 'typeorm';

import { MIGRATIONS } from 'src/infrastructure/database/migrations';
import { ENTITIES } from 'src/infrastructure/database/schema';
import { env } from 'src/shared/config/env';

export default new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: ENTITIES,
  migrations: MIGRATIONS,
  synchronize: false,
  logging: ['migration', 'error'],
});
