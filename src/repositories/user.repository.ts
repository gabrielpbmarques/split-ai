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
        'phone',
        'role',
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

  async findNearbySecurityOfficersWithState(
    latitude: number,
    longitude: number,
    alertId: string,
    radiusInKm = 10,
    limit = 100,
  ): Promise<
    Array<{
      user_id: string;
      name: string | null;
      email: string | null;
      phone: string | null;
      latitude: number;
      longitude: number;
      notified_for_alert: boolean;
      is_busy: boolean;
    }>
  > {
    const query = `
      WITH latest_loc AS (
        SELECT DISTINCT ON (ul.user_id)
          ul.user_id,
          ul.latitude,
          ul.longitude,
          ul.created_at
        FROM user_location ul
        ORDER BY ul.user_id, ul.created_at DESC
      )
      SELECT
        u.id AS user_id,
        u.name AS name,
        u.email AS email,
        u.phone AS phone,
        ll.latitude AS latitude,
        ll.longitude AS longitude,
        EXISTS (
          SELECT 1 FROM notifications n
          WHERE n.user_id = u.id
            AND n.entity_type = 'Alert'
            AND n.entity_id = $3
        ) AS notified_for_alert,
        EXISTS (
          SELECT 1 FROM alerts a
          WHERE a.attended_by_user_id = u.id
            AND a.status = 'em_atendimento'
        ) AS is_busy
      FROM latest_loc ll
      JOIN users u ON u.id = ll.user_id
      WHERE u.role = 'security_force'
        AND u.status = 'active'
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(ll.longitude, ll.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        $4 * 1000
      )
      ORDER BY ST_Distance(
        ST_SetSRID(ST_MakePoint(ll.longitude, ll.latitude), 4326)::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
      ) ASC
      LIMIT $5
    `;

    return this.userRepository.query(query, [
      longitude,
      latitude,
      alertId,
      radiusInKm,
      limit,
    ]);
  }
}
