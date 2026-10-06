import { DataSource } from 'typeorm';

import { MIGRATIONS } from 'src/infrastructure/database/migrations';
import { ENTITIES } from 'src/infrastructure/database/schema';
import { useUtcForTimestampColumns } from 'src/infrastructure/database/utc-timestamps';
import { env } from 'src/shared/config/env';

useUtcForTimestampColumns();

export default new DataSource({
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: ENTITIES,
  migrations: MIGRATIONS,
  migrationsTransactionMode: 'each',
  synchronize: false,
  logging: ['migration', 'error'],
});
