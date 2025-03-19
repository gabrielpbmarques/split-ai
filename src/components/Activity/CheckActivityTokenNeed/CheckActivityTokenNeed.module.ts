import { Module } from '@nestjs/common';
import { CheckActivityTokenNeedService } from './CheckActivityTokenNeed.service';
import { CheckActivityTokenNeedController } from './CheckActivityTokenNeed.controller';
import { TokenRepository } from 'src/repositories/Token.repository';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from 'src/schemas/Token.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  providers: [CheckActivityTokenNeedService, TokenRepository],
  controllers: [CheckActivityTokenNeedController],
})
export class CheckActivityTokenNeedModule {}
