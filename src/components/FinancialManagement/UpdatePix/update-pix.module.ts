import { Module } from '@nestjs/common';
import { UpdatePixService } from 'src/components/FinancialManagement/UpdatePix/update-pix.service';
import { RepositoriesModule } from 'src/repositories/repositories.module';

@Module({
  imports: [RepositoriesModule],
  providers: [UpdatePixService],
  exports: [UpdatePixService],
})
export class UpdatePixModule {}
