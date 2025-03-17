import { Test, TestingModule } from '@nestjs/testing';
import { UpdateActivityTokenService } from './UpdateActivityToken.service';

describe('UpdateActivityTokenService', () => {
  let service: UpdateActivityTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UpdateActivityTokenService],
    }).compile();

    service = module.get<UpdateActivityTokenService>(UpdateActivityTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
