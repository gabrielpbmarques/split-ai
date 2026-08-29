import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageEntity } from 'src/entities';
import { VoyageEmbeddingsProviderModule } from 'src/infrastructure/providers/voyage-embeddings.provider.module';

import { MessageRepository } from './message.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageEntity]),
    VoyageEmbeddingsProviderModule,
  ],
  providers: [MessageRepository],
  exports: [MessageRepository],
})
export class MessageRepositoryModule {}
