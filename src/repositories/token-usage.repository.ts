import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenUsageEntity } from 'src/entities';
import { Repository, SelectQueryBuilder } from 'typeorm';

export interface TokenUsageFilters {
  organization_id?: string;
  agent_id?: string;
  user_id?: string;
  start_date?: Date;
  end_date?: Date;
}

@Injectable()
export class TokenUsageRepository {
  constructor(
    @InjectRepository(TokenUsageEntity)
    private readonly repository: Repository<TokenUsageEntity>,
  ) {}

  async create(data: Partial<TokenUsageEntity>): Promise<TokenUsageEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  private applyFilters(
    qb: SelectQueryBuilder<TokenUsageEntity>,
    filters: TokenUsageFilters,
  ) {
    if (filters.organization_id) {
      qb.andWhere('token_usage.organization_id = :organization_id', {
        organization_id: filters.organization_id,
      });
    }

    if (filters.agent_id) {
      qb.andWhere('token_usage.agent_id = :agent_id', {
        agent_id: filters.agent_id,
      });
    }

    if (filters.user_id) {
      qb.andWhere('token_usage.user_id = :user_id', {
        user_id: filters.user_id,
      });
    }

    if (filters.start_date) {
      qb.andWhere('token_usage.created_at >= :start_date', {
        start_date: filters.start_date,
      });
    }

    if (filters.end_date) {
      qb.andWhere('token_usage.created_at <= :end_date', {
        end_date: filters.end_date,
      });
    }

    return qb;
  }

  async getTotals(filters: TokenUsageFilters) {
    const qb = this.repository.createQueryBuilder('token_usage');
    this.applyFilters(qb, filters);

    qb.select('SUM(token_usage.input_tokens)', 'input_tokens')
      .addSelect('SUM(token_usage.output_tokens)', 'output_tokens')
      .addSelect('SUM(token_usage.total_tokens)', 'total_tokens');

    const result = await qb.getRawOne();

    return {
      input_tokens: Number(result.input_tokens || 0),
      output_tokens: Number(result.output_tokens || 0),
      total_tokens: Number(result.total_tokens || 0),
    };
  }

  async getDailyUsage(filters: TokenUsageFilters) {
    const qb = this.repository.createQueryBuilder('token_usage');
    this.applyFilters(qb, filters);

    qb.select("date_trunc('day', token_usage.created_at)::date", 'date')
      .addSelect('SUM(token_usage.total_tokens)', 'total_tokens')
      .groupBy('date')
      .orderBy('date', 'ASC');

    const result = await qb.getRawMany();

    return result.map((row) => ({
      date: row.date,
      total_tokens: Number(row.total_tokens || 0),
    }));
  }

  async getUsageByAgent(filters: TokenUsageFilters) {
    const qb = this.repository.createQueryBuilder('token_usage');
    this.applyFilters(qb, filters);

    qb.leftJoinAndSelect('token_usage.agent', 'agent')
      .select('token_usage.agent_id', 'agent_id')
      .addSelect('agent.name', 'agent_name')
      .addSelect('SUM(token_usage.total_tokens)', 'total_tokens')
      .groupBy('token_usage.agent_id')
      .addGroupBy('agent.name');

    const result = await qb.getRawMany();

    return result.map((row) => ({
      agent_id: row.agent_id,
      agent_name: row.agent_name || 'Unknown Agent',
      total_tokens: Number(row.total_tokens || 0),
    }));
  }
}
