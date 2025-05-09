import { Module } from '@nestjs/common';
import { GetjobTemplatesController } from './getjob-templates.controller';
import { GetjobTemplatesService } from './getjob-templates.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  controllers: [GetjobTemplatesController],
  providers: [GetjobTemplatesService],
})
export class GetjobTemplatesModule {}
