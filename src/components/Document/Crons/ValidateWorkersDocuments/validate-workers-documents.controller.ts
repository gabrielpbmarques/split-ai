import { Controller, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ValidateWorkersDocumentsService } from './validate-workers-documents.service';

@Controller('documents')
export class ValidateWorkersDocumentsController {
  private logger = new Logger(ValidateWorkersDocumentsController.name);

  constructor(
    private readonly validateWorkersDocumentsService: ValidateWorkersDocumentsService,
  ) {}

  @Cron('50 17 * * *')
  async execute() {
    try {
      await this.validateWorkersDocumentsService.execute();
    } catch (error) {
      this.logger.error(error);
    }
  }
}
