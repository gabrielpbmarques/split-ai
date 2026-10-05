import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type SelectQueryBuilder } from 'typeorm';

import { ReportEntity } from 'src/infrastructure/database/schema/report.entity';
import {
  type PageRequest,
  type PageResult,
  skipOf,
} from 'src/shared/contracts/pagination';

export interface ReportFilters {
  agent_id?: string;
  agent_ids?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
  type?: 'appointment' | 'order' | 'faq';
  startDate?: Date;
  endDate?: Date;
  createdAtDay?: Date;
}

@Injectable()
export class ReportRepository {
  constructor(
    @InjectRepository(ReportEntity)
    private readonly repository: Repository<ReportEntity>,
  ) {}

  async create(data: Partial<ReportEntity>): Promise<ReportEntity> {
    const entity = this.repository.create(data);
    return await this.repository.save(entity);
  }

  async update(id: string, data: Partial<ReportEntity>): Promise<void> {
    await this.repository.update(id, data);
  }

  async findById(id: string): Promise<ReportEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  private applyFilters(
    qb: SelectQueryBuilder<ReportEntity>,
    filters: ReportFilters = {},
  ): SelectQueryBuilder<ReportEntity> {
    qb.where('1=1');
    if (filters.agent_ids && filters.agent_ids.length > 0) {
      qb.andWhere('r.agent_id IN (:...agent_ids)', {
        agent_ids: filters.agent_ids,
      });
    } else if (filters.agent_id) {
      qb.andWhere('r.agent_id = :agent_id', { agent_id: filters.agent_id });
    }
    if (filters.sentiment) {
      qb.andWhere('r.sentiment = :sentiment', { sentiment: filters.sentiment });
    }
    if (filters.type) {
      qb.andWhere('r.type = :type', { type: filters.type });
    }
    if (filters.createdAtDay) {
      const start = new Date(filters.createdAtDay);
      start.setHours(0, 0, 0, 0);
      const end = new Date(filters.createdAtDay);
      end.setHours(23, 59, 59, 999);
      qb.andWhere('r.created_at BETWEEN :start AND :end', { start, end });
    } else {
      if (filters.startDate) {
        qb.andWhere('r.created_at >= :start', { start: filters.startDate });
      }
      if (filters.endDate) {
        qb.andWhere('r.created_at <= :end', { end: filters.endDate });
      }
    }
    return qb;
  }

  async listPaginated(
    filters: ReportFilters,
    page: PageRequest,
  ): Promise<PageResult<ReportEntity>> {
    const qb = this.repository.createQueryBuilder('r');
    this.applyFilters(qb, filters);
    const [items, total] = await qb
      .orderBy('r.created_at', 'DESC')
      .skip(skipOf(page))
      .take(page.limit)
      .getManyAndCount();

    return { items, total };
  }

  async countAll(
    filters?: Parameters<typeof this.applyFilters>[1],
  ): Promise<number> {
    const qb = this.repository.createQueryBuilder('r');
    this.applyFilters(qb, filters);
    return qb.getCount();
  }

  async groupCountBy(
    field: 'type' | 'sentiment',
    filters?: Parameters<typeof this.applyFilters>[1],
  ): Promise<{ key: string; count: number }[]> {
    const qb = this.repository.createQueryBuilder('r');
    this.applyFilters(qb, filters);
    qb.select(`r.${field}`, 'key')
      .addSelect('COUNT(*)', 'count')
      .groupBy(`r.${field}`);
    const rows = await qb.getRawMany<{ key: string; count: string }>();
    return rows.map((r) => ({ key: r.key, count: Number(r.count) }));
  }

  async countAppointments(
    filters?: Parameters<typeof this.applyFilters>[1],
    onlyScheduled: boolean = false,
  ): Promise<number> {
    const qb = this.repository.createQueryBuilder('r');
    this.applyFilters(qb, { ...filters, type: 'appointment' });
    if (onlyScheduled) {
      qb.andWhere('r.scheduled_to IS NOT NULL');
    }
    return qb.getCount();
  }

  async dailyCounts(
    start: Date,
    end: Date,
    filters?: Omit<
      Parameters<typeof this.applyFilters>[1],
      'startDate' | 'endDate' | 'createdAtDay'
    >,
  ): Promise<{ date: string; count: number }[]> {
    const qb = this.repository.createQueryBuilder('r');

    this.applyFilters(qb, filters);

    const toYMD = (d: Date) => d.toISOString().slice(0, 10);
    const startDate = toYMD(start);
    const endDate = toYMD(end);
    qb.andWhere("date_trunc('day', r.created_at)::date >= :startDate", {
      startDate,
    });
    qb.andWhere("date_trunc('day', r.created_at)::date <= :endDate", {
      endDate,
    });

    qb.select("date_trunc('day', r.created_at)::date", 'date')
      .addSelect('COUNT(*)', 'count')
      .groupBy("date_trunc('day', r.created_at)::date")
      .orderBy("date_trunc('day', r.created_at)::date", 'ASC');
    const rows = await qb.getRawMany<{ date: string; count: string }>();
    return rows.map((r) => ({ date: r.date, count: Number(r.count) }));
  }
}
