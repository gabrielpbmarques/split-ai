import { Global, Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import {
  AGENT_RESOLVER,
  AgentResolver,
} from 'src/modules/agent-runtime/contracts/agent-resolver.port';
import { ResolveAgentService } from 'src/modules/agent-runtime/resolve-agent/resolve-agent.service';

@Global()
@Module({
  providers: [
    {
      provide: AGENT_RESOLVER,
      inject: [ModuleRef],
      useFactory: (moduleRef: ModuleRef): AgentResolver => ({
        execute: (...args) =>
          moduleRef
            .get(ResolveAgentService, { strict: false })
            .execute(...args),
      }),
    },
  ],
  exports: [AGENT_RESOLVER],
})
export class AgentRuntimeContractsModule {}
