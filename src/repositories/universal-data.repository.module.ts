import { Module } from '@nestjs/common';

import { UniversalDataRepository } from './universal-data.repository';

@Module({
  providers: [UniversalDataRepository],
  exports: [UniversalDataRepository],
})
export class UniversalDataRepositoryModule {}
