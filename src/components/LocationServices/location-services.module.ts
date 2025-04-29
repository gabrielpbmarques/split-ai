import { Module } from '@nestjs/common';
import { CepLookupModule } from 'src/components/LocationServices/CepLookup/cep-lookup.module';

@Module({
  imports: [CepLookupModule],
  exports: [CepLookupModule],
})
export class LocationServicesModule {}
