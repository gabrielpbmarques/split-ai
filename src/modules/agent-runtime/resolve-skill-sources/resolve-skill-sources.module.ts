import { Module } from '@nestjs/common';

import { ResolveSkillSourcesService } from 'src/modules/agent-runtime/resolve-skill-sources/resolve-skill-sources.service';

@Module({
  providers: [ResolveSkillSourcesService],
  exports: [ResolveSkillSourcesService],
})
export class ResolveSkillSourcesModule {}
