import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.find();
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
        'org_role',
        'organization_id',
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
        'organization_id',
        'role',
        'org_role',
        'origin',
        'status',
        'invite_token_hash',
        'created_at',
        'updated_at',
      ],
    });
  }

  async findByOrganization(organizationId: string): Promise<UserEntity[]> {
    return this.userRepository.find({
      where: { organization_id: organizationId },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'org_role',
        'status',
        'created_at',
        'updated_at',
      ],
      order: { created_at: 'ASC' },
    });
  }

  async countByOrganization(organizationId: string): Promise<number> {
    return this.userRepository.count({
      where: { organization_id: organizationId },
    });
  }

  async findByIdInOrganization(
    id: string,
    organizationId: string,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id, organization_id: organizationId },
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
  ): Promise<UserEntity | null> {
    await this.userRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (
      result.affected !== null &&
      result.affected !== undefined &&
      result.affected > 0
    );
  }
}
