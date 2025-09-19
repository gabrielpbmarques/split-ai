import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities/message.entity';
import { FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class MessageRepository {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly repository: Repository<MessageEntity>,
  ) {}

  async create(data: Partial<MessageEntity>): Promise<MessageEntity> {
    const message = this.repository.create(data);
    return await this.repository.save(message);
  }

  async findById(id: string): Promise<MessageEntity | null> {
    return await this.repository.findOne({ where: { id } });
  }

  async findOne(
    options: FindOneOptions<MessageEntity>,
  ): Promise<MessageEntity | null> {
    return await this.repository.findOne(options);
  }
}
