import { Test, TestingModule } from '@nestjs/testing';
import { StartRegistrationService } from './start-registration.service';
import { getModelToken } from '@nestjs/mongoose';
import { Worker } from 'src/schemas/Worker.schema';
import { LoadAiChatService } from '../../Langchain/LoadAiChat/load-ai-chat.service';

describe('StartRegistrationService', () => {
  let service: StartRegistrationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartRegistrationService,
        {
          provide: getModelToken(Worker.name),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: LoadAiChatService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StartRegistrationService>(StartRegistrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
