import { Injectable } from '@nestjs/common';
import { ReportEntity } from 'src/entities/report.entity';
import { ReportRepository } from 'src/repositories';
import { User } from 'src/types';

@Injectable()
export class GetReportService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async execute(user: User, id: string): Promise<ReportEntity> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw { status: 404, message: 'Report not found' };
    }
    if (
      user.role !== 'admin' &&
      report.organization_id !== user.organization_id
    ) {
      throw { status: 403, message: 'Forbidden' };
    }
    return report;
  }
}
