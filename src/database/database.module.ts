import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'src/config';

@Module({
  imports: [MongooseModule.forRoot(config.mongoUri)],
  exports: [MongooseModule],
})
export class DatabaseModule {}
