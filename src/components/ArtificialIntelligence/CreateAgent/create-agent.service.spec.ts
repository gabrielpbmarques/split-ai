import { ForbiddenException } from '@nestjs/common';
import { User } from 'src/types';

import { CreateAgentService } from './create-agent.service';

describe('CreateAgentService', () => {
  let service: CreateAgentService;
  let agentRepository: any;
  let agentInstructionRepository: any;
  let organizationRepository: any;

  const user = {
    id: 'user-1',
    organization_id: 'org-1',
  } as unknown as User;

  const dto: any = { name: 'Agent', instructions: { diretrizes: [] } };

  beforeEach(() => {
    agentRepository = {
      create: jest.fn().mockResolvedValue({ id: 'agent-1' }),
      count: jest.fn(),
    };
    agentInstructionRepository = { create: jest.fn().mockResolvedValue({}) };
    organizationRepository = { findByIdWithPlan: jest.fn() };
    service = new CreateAgentService(
      agentRepository,
      agentInstructionRepository,
      organizationRepository,
    );
  });

  it('scopes the agent to the user organization', async () => {
    organizationRepository.findByIdWithPlan.mockResolvedValue({
      plan: { unlimited: false, max_agents: null },
    });

    await service.execute(dto, user);

    expect(agentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ organization_id: 'org-1', user_id: 'user-1' }),
    );
  });

  it('blocks creation when the plan agent quota is reached', async () => {
    organizationRepository.findByIdWithPlan.mockResolvedValue({
      plan: { unlimited: false, max_agents: 2 },
    });
    agentRepository.count.mockResolvedValue(2);

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

    expect(agentRepository.count).not.toHaveBeenCalled();
    expect(agentRepository.create).toHaveBeenCalled();
  });
});
