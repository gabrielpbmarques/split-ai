import { ForbiddenException } from '@nestjs/common';

import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { CreateAgentService } from 'src/modules/agents/create-agent/create-agent.service';

describe('CreateAgentService', () => {
  let service: CreateAgentService;
  let agentRepository: any;
  let agentInstructionRepository: any;
  let organizationRepository: any;

  const user = {
    id: 'user-1',
    organization_id: 'org-1',
  } as unknown as AuthenticatedUser;

  const dto: any = { name: 'Agent', instructions: { diretrizes: [] } };

  beforeEach(() => {
    agentRepository = {
      create: jest.fn().mockResolvedValue({ id: 'agent-1' }),
      countByOrganization: jest.fn(),
    };
    agentInstructionRepository = { create: jest.fn().mockResolvedValue({}) };
    organizationRepository = { findByIdWithPlan: jest.fn() };
    const transactionExecutor = {
      run: (work: (tx: unknown) => Promise<unknown>) => work('tx'),
    };
    service = new CreateAgentService(
      agentRepository,
      agentInstructionRepository,
      organizationRepository,
      transactionExecutor as any,
    );
  });

  it('scopes the agent to the user organization', async () => {
    organizationRepository.findByIdWithPlan.mockResolvedValue({
      plan: { unlimited: false, max_agents: null },
    });

    await service.execute(dto, user);

    expect(agentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ organization_id: 'org-1', user_id: 'user-1' }),
      'tx',
    );
    expect(agentInstructionRepository.create).toHaveBeenCalledWith(
      { agent_id: 'agent-1', instructions: dto.instructions },
      'tx',
    );
  });

  it('blocks creation when the plan agent quota is reached', async () => {
    organizationRepository.findByIdWithPlan.mockResolvedValue({
      plan: { unlimited: false, max_agents: 2 },
    });
    agentRepository.countByOrganization.mockResolvedValue(2);

    await expect(service.execute(dto, user)).rejects.toThrow(
      ForbiddenException,
    );
    expect(agentRepository.create).not.toHaveBeenCalled();
  });

  it('does not enforce a quota for unlimited plans', async () => {
    organizationRepository.findByIdWithPlan.mockResolvedValue({
      plan: { unlimited: true, max_agents: 1 },
    });

    await service.execute(dto, user);

    expect(agentRepository.countByOrganization).not.toHaveBeenCalled();
    expect(agentRepository.create).toHaveBeenCalled();
  });
});
