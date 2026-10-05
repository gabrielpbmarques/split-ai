import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import type { Executor } from 'src/infrastructure/database/database.types';
import { UserEntity } from 'src/infrastructure/database/schema';
import {
  type PageRequest,
  type PageResult,
  skipOf,
} from 'src/shared/contracts/pagination';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async listPaginated<TField extends keyof UserEntity = keyof UserEntity>(
    page: PageRequest,
    fields?: readonly TField[],
  ): Promise<PageResult<Pick<UserEntity, TField>>> {
    const [items, total] = await this.userRepository.findAndCount({
      select: fields ? [...fields] : undefined,
      order: { created_at: 'ASC' },
      skip: skipOf(page),
      take: page.limit,
    });

    return { items: items as Pick<UserEntity, TField>[], total };
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'origin',
        'status',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      select: [
        'id',
        'name',
        'email',
        'password_hash',
        'phone',
        'role',
        'origin',
        'status',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { phone },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'origin',
        'status',
        'created_at',
        'updated_at',
      ],
    });
  }

  async create(data: Partial<UserEntity>): Promise<UserEntity> {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async update(
    id: string,
    data: Partial<UserEntity>,
    tx?: Executor,
  ): Promise<UserEntity | null> {
    await (tx ? tx.getRepository(UserEntity) : this.userRepository).update(
      id,
      data as QueryDeepPartialEntity<UserEntity>,
    );
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.softDelete(id);
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }
}
