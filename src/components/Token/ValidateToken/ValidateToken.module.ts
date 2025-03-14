import { Module } from '@nestjs/common';
import { ValidateTokenService } from './ValidateToken.service';
import { ValidateTokenController } from './ValidateToken.controller';
import { TokenRepository } from 'src/repositories/Token.repository';
import { CalculateCheckDigitService } from '../CalculateCheckDigit/CalculateCheckDigit.service';
import { DatabaseModule } from 'src/database/database.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from 'src/schemas/Activity.schema';
import { Token, TokenSchema } from 'src/schemas/Token.schema';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Activity.name, schema: ActivitySchema },
      { name: Token.name, schema: TokenSchema }
    ])
  ],
  providers: [ValidateTokenService, TokenRepository, CalculateCheckDigitService],
  controllers: [ValidateTokenController]
})
export class ValidateTokenModule {}
