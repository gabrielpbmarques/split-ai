import { Module } from '@nestjs/common';
import { CepLookupService } from 'src/components/LocationServices/CepLookup/cep-lookup.service';

@Module({
  providers: [CepLookupService],
  exports: [CepLookupService],
})
export class CepLookupModule {}
