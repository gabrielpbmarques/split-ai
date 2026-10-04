import { Embeddings } from '@langchain/core/embeddings';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

import { MessageEntity } from 'src/infrastructure/database/schema/message.entity';
import { VOYAGE_EMBEDDINGS } from 'src/infrastructure/voyage-embeddings/voyage-embeddings.tokens';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly repository: Repository<MessageEntity>,
    @Inject(VOYAGE_EMBEDDINGS)
    private readonly embeddings: Embeddings,
  ) {}

  async create(data: Partial<MessageEntity>): Promise<MessageEntity> {
    const embedding = await this.embeddings.embedQuery(data.message);

    const message = this.repository.create({
      ...data,
      embedding,
    });

    return this.repository.save(message);
  }

  async findById(id: string): Promise<MessageEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<MessageEntity>,
  ): Promise<MessageEntity | null> {
    return await this.repository.findOne(options);
  }

  async find(
    options?: FindManyOptions<MessageEntity>,
  ): Promise<MessageEntity[]> {
    return await this.repository.find(options);
  }

  async count(options?: FindManyOptions<MessageEntity>): Promise<number> {
    return await this.repository.count(options);
  }

  createQueryBuilder(alias: string): SelectQueryBuilder<MessageEntity> {
    return this.repository.createQueryBuilder(alias);
  }
}
