import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Executor } from 'src/infrastructure/database/database.types';
import { MessageEntity } from 'src/infrastructure/database/schema/message.entity';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly repository: Repository<MessageEntity>,
  ) {}

  async create(
    data: Partial<MessageEntity>,
    tx?: Executor,
  ): Promise<MessageEntity> {
    const repo = this.repo(tx);
    return repo.save(repo.create(data));
  }

  async findById(id: string): Promise<MessageEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async listBySession<TField extends keyof MessageEntity = keyof MessageEntity>(
    sessionId: string,
    fields?: readonly TField[],
  ): Promise<Pick<MessageEntity, TField>[]> {
    const rows = await this.repository.find({
      where: { session_id: sessionId },
      select: fields ? [...fields] : undefined,
      order: { created_at: 'ASC' },
    });

    return rows as Pick<MessageEntity, TField>[];
  }

  private repo(tx?: Executor): Repository<MessageEntity> {
    return tx ? tx.getRepository(MessageEntity) : this.repository;
  }
}
