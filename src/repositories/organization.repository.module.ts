import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationEntity } from 'src/entities';

import { OrganizationRepository } from './organization.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OrganizationEntity])],
  providers: [OrganizationRepository],
  exports: [OrganizationRepository],
})
export class OrganizationRepositoryModule {}
