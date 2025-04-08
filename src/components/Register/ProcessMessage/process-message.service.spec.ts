import { Test, TestingModule } from '@nestjs/testing';
import { ProcessMessageService } from './process-message.service';
import { getModelToken } from '@nestjs/mongoose';
import { Worker } from 'src/schemas/Worker.schema';
import { LoadAiChatService } from '../../Langchain/LoadAiChat/load-ai-chat.service';

describe('ProcessMessageService', () => {
  let service: ProcessMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessMessageService,
        {
          provide: getModelToken(Worker.name),
          useValue: {
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
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

    service = module.get<ProcessMessageService>(ProcessMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
