import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UniversalDataRepository {
  constructor(private readonly dataSource: DataSource) {}

  async execute(query: string, parameters?: any[]): Promise<any> {
    return this.dataSource.query(query, parameters);
  }
}
