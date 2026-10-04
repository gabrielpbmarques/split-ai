import { AddLifecycleColumns1759600000000 } from 'src/infrastructure/database/migrations/1759600000000-add-lifecycle-columns';
import { AddSourcesOrganizationId1759600001000 } from 'src/infrastructure/database/migrations/1759600001000-add-sources-organization-id';
import { PartialUniqueIndexes1759600002000 } from 'src/infrastructure/database/migrations/1759600002000-partial-unique-indexes';

export const MIGRATIONS = [
  AddLifecycleColumns1759600000000,
  AddSourcesOrganizationId1759600001000,
  PartialUniqueIndexes1759600002000,
];
