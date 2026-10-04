import { Injectable, NotFoundException } from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { ReportRepository } from 'src/modules/reports/repositories/report.repository';
import { ConversationDetail } from 'src/modules/sessions/get-session-messages/get-session-messages.service';
import { GetSessionMessagesService } from 'src/modules/sessions/get-session-messages/get-session-messages.service';

@Injectable()
export class GetReportConversationService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly getSessionMessagesService: GetSessionMessagesService,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(
    user: AuthenticatedUser,
    reportId: string,
  ): Promise<ConversationDetail> {
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    this.accessScope.ensureCan(
      user,
      'report.read',
      { organizationId: report.organization_id },
      'Acesso negado',
    );

    // Get conversation messages using the session_id from report
    return this.getSessionMessagesService.execute(user, report.session_id);
  }
}
