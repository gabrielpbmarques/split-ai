import { ConsumeCreditsService } from './consume-credits.service';

describe('ConsumeCreditsService', () => {
  let service: ConsumeCreditsService;
  let manageCreditsService: any;
  let creditBalanceRepository: any;
  let deactivateOrganizationService: any;
  let organizationRepository: any;

  beforeEach(() => {
    manageCreditsService = { execute: jest.fn().mockResolvedValue({}) };
    creditBalanceRepository = {
      hasEnoughCredits: jest.fn(),
      getAvailableCredits: jest.fn(),
    };
    deactivateOrganizationService = {
      execute: jest.fn().mockResolvedValue({}),
    };
    organizationRepository = { isUnlimited: jest.fn() };
    service = new ConsumeCreditsService(
      manageCreditsService,
      creditBalanceRepository,
      deactivateOrganizationService,
      organizationRepository,
    );
  });

  it('skips consumption for unlimited plans', async () => {
    organizationRepository.isUnlimited.mockResolvedValue(true);

    const result = await service.execute('org-1', 'session-1', true);

    expect(result).toBe(true);
    expect(creditBalanceRepository.hasEnoughCredits).not.toHaveBeenCalled();
    expect(manageCreditsService.execute).not.toHaveBeenCalled();
  });

  it('consumes credits for limited plans with sufficient balance', async () => {
    organizationRepository.isUnlimited.mockResolvedValue(false);
    creditBalanceRepository.hasEnoughCredits.mockResolvedValue(true);

    const result = await service.execute('org-1', 'session-1', true);

    expect(result).toBe(true);
    expect(manageCreditsService.execute).toHaveBeenCalled();
  });

  it('checkCredits returns true for unlimited plans without touching balance', async () => {
    organizationRepository.isUnlimited.mockResolvedValue(true);

    const result = await service.checkCredits('org-1');

    expect(result).toBe(true);
    expect(creditBalanceRepository.hasEnoughCredits).not.toHaveBeenCalled();
  });
});
