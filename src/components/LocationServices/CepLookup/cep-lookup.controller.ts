import { Controller, Get, Param } from '@nestjs/common';
import { CepLookupService } from 'src/components/LocationServices/CepLookup/cep-lookup.service';
import { NormalizedAddressData } from 'src/services/cep.service';

@Controller('cep')
export class CepLookupController {
  constructor(private readonly cepLookupService: CepLookupService) {}

  /**
   * Endpoint para consulta de CEP
   * @param cep CEP a ser consultado
   * @returns Dados do endereço normalizados
   */
  @Get(':cep')
  async lookupCep(@Param('cep') cep: string): Promise<NormalizedAddressData> {
    return this.cepLookupService.execute({ cep });
  }
}
