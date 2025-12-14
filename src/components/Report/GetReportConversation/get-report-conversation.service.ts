import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { GetSessionMessagesService } from 'src/components/Conversation/GetSessionMessages/get-session-messages.service';
import { ReportRepository } from 'src/repositories';

interface AuthUser {
  id: string;
  role: string;
  organization_id: string;
}

@Injectable()
export class GetReportConversationService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly getSessionMessagesService: GetSessionMessagesService,
  ) {}

  async execute(user: AuthUser, reportId: string) {
    const report = await this.reportRepository.findById(reportId);

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    if (report.organization_id !== user.organization_id) {
      throw new ForbiddenException('Acesso negado');
    }

    // Get conversation messages using the session_id from report
    return this.getSessionMessagesService.execute(user, report.session_id);
  }
}
