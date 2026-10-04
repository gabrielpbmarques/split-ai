import { Injectable, NotFoundException } from '@nestjs/common';

import { AccessScopeService } from 'src/auth/access-scope.service';
import { AuthenticatedUser } from 'src/auth/authenticated-user';
import { ReportEntity } from 'src/infrastructure/database/schema/report.entity';
import { ReportRepository } from 'src/modules/reports/repositories/report.repository';

@Injectable()
export class GetReportService {
  constructor(
    private readonly reportRepository: ReportRepository,
    private readonly accessScope: AccessScopeService,
  ) {}

  async execute(user: AuthenticatedUser, id: string): Promise<ReportEntity> {
    const report = await this.reportRepository.findById(id);

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    this.accessScope.ensureCan(
      user,
      'report.read',
      { organizationId: report.organization_id },
      'Acesso negado',
    );

    return report;
  }
}
