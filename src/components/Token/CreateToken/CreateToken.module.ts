import { Module } from '@nestjs/common';
import { CreateTokenService } from './CreateToken.service';
import { CreateTokenController } from './CreateToken.controller';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from 'src/schemas/Activity.schema';
import { Token, TokenSchema } from 'src/schemas/Token.schema';
import { TokenRepository } from 'src/repositories/Token.repository';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: Token.name, schema: TokenSchema },
    ]),
  ],
  providers: [CreateTokenService, TokenRepository, CalculateCheckDigitService],
  controllers: [CreateTokenController],
})
export class CreateTokenModule {}
