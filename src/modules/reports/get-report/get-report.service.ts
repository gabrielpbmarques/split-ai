import { Injectable, NotFoundException } from '@nestjs/common';

import type { ReportEntity } from 'src/infrastructure/database/schema/report.entity';
import { ReportRepository } from 'src/modules/reports/repositories/report.repository';

@Injectable()
export class GetReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(id: string): Promise<ReportEntity> {
    const report = await this.reportRepository.findById(id);

    if (!report) {
      throw new NotFoundException('Relatório não encontrado');
    }

    return report;
  }
}
