import { AddLifecycleColumns1759600000000 } from 'src/infrastructure/database/migrations/1759600000000-add-lifecycle-columns';
import { AddSourcesOrganizationId1759600001000 } from 'src/infrastructure/database/migrations/1759600001000-add-sources-organization-id';
import { PartialUniqueIndexes1759600002000 } from 'src/infrastructure/database/migrations/1759600002000-partial-unique-indexes';
import { RemoveMultiTenancy1759700000000 } from 'src/infrastructure/database/migrations/1759700000000-remove-multi-tenancy';
import { UnifyAgentSystemPromptRemoveDatabase1759800000000 } from 'src/infrastructure/database/migrations/1759800000000-unify-agent-system-prompt-remove-database';
import { UnifyAgentResponseFormat1759900000000 } from 'src/infrastructure/database/migrations/1759900000000-unify-agent-response-format';

export const MIGRATIONS = [
  AddLifecycleColumns1759600000000,
  AddSourcesOrganizationId1759600001000,
  PartialUniqueIndexes1759600002000,
  RemoveMultiTenancy1759700000000,
  UnifyAgentSystemPromptRemoveDatabase1759800000000,
  UnifyAgentResponseFormat1759900000000,
];
