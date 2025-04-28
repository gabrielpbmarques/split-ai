import { Injectable } from '@nestjs/common';
import { CepService, NormalizedAddressData } from 'src/services/cep.service';

export interface CepLookupDto {
  cep: string;
}

/**
 * Serviço para consulta de CEP no fluxo de cadastro
 */
@Injectable()
export class CepLookupService {
  /**
   * Consulta o CEP e retorna os dados do endereço
   * @param dto DTO com o CEP a ser consultado
   * @returns Dados do endereço normalizados
   */
  async execute(dto: CepLookupDto): Promise<NormalizedAddressData> {
    try {
      const addressData = await CepService.getAddressByCepWithFallback(dto.cep);

      return addressData;
    } catch (error) {
      return {
        zipCode: dto.cep,
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        error: true,
        errorMessage: 'Falha ao consultar o CEP',
      };
    }
  }
}
