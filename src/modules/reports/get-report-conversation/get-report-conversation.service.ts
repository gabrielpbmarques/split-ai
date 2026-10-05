import { Injectable, NotFoundException } from '@nestjs/common';

import { ReportRepository } from 'src/modules/reports/repositories/report.repository';
import type { ConversationDetail } from 'src/modules/sessions/get-session-messages/get-session-messages.service';
import { GetSessionMessagesService } from 'src/modules/sessions/get-session-messages/get-session-messages.service';

@Injectable()
export class GetReportConversationService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly getSessionMessagesService: GetSessionMessagesService,
  ) {}

  async execute(reportId: string): Promise<ConversationDetail> {
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    return this.getSessionMessagesService.execute(report.session_id);
  }
}
