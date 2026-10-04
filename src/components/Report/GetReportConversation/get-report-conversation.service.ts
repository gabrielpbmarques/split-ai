import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { GetSessionMessagesService } from 'src/components/Session/GetSessionMessages/get-session-messages.service';
import { ReportRepository } from 'src/repositories';

@Injectable()
export class GetReportConversationService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly getSessionMessagesService: GetSessionMessagesService,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(user: AuthenticatedUser, reportId: string) {
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
