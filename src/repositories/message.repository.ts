import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';
import { VERTEX_AI_EMBEDDINGS } from 'src/infrastructure/providers/vertex-ai.provider';
import {
  FindManyOptions,
  FindOneOptions,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly repository: Repository<MessageEntity>,
    @Inject(VERTEX_AI_EMBEDDINGS)
    private readonly embeddings: VertexAIEmbeddings,
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
