import axios from 'axios';

/**
 * Interface para os dados de endereço retornados pela API de CEP
 */
export interface CepAddressData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

/**
 * Interface normalizada para os dados de endereço
 */
export interface NormalizedAddressData {
  zipCode: string;
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string;
  error?: boolean;
  errorMessage?: string;
}

/**
 * Serviço para consulta de CEP
 */
export class CepService {
  /**
   * Consulta o CEP na API ViaCEP
   * @param cep CEP a ser consultado (apenas números)
   * @returns Dados do endereço normalizado
   */
  public static async getAddressByCep(
    cep: string,
  ): Promise<NormalizedAddressData> {
    try {
      // Remover caracteres não numéricos
      const cleanCep = cep.replace(/\D/g, '');

      // Validar se o CEP tem 8 dígitos
      if (cleanCep.length !== 8) {
        return {
          zipCode: cleanCep,
          street: '',
          neighborhood: '',
          city: '',
          state: '',
          error: true,
          errorMessage: 'CEP deve conter 8 dígitos',
        };
      }

      // Consultar API ViaCEP
      const response = await axios.get<CepAddressData>(
        `https://viacep.com.br/ws/${cleanCep}/json/`,
      );

      // Verificar se a API retornou erro
      if (response.data.erro) {
        return {
          zipCode: cleanCep,
          street: '',
          neighborhood: '',
          city: '',
          state: '',
          error: true,
          errorMessage: 'CEP não encontrado',
        };
      }

      // Normalizar os dados
      return {
        zipCode: cleanCep,
        street: response.data.logradouro,
        neighborhood: response.data.bairro,
        city: response.data.localidade,
        state: response.data.uf,
        complement: response.data.complemento || undefined,
      };
    } catch (error: any) {
      console.error('Erro ao consultar CEP:', error);

      return {
        zipCode: cep,
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        error: true,
        errorMessage: 'Erro ao consultar CEP',
      };
    }
  }

  /**
   * Método alternativo que consulta múltiplas APIs de CEP em caso de falha
   * @param cep CEP a ser consultado (apenas números)
   * @returns Dados do endereço normalizado
   */
  public static async getAddressByCepWithFallback(
    cep: string,
  ): Promise<NormalizedAddressData> {
    try {
      // Primeiro tenta a API ViaCEP
      const viaCepResult = await this.getAddressByCep(cep);

      // Se não houver erro, retorna o resultado
      if (!viaCepResult.error) {
        return viaCepResult;
      }

      // Se houver erro, tenta a API BrasilAPI como fallback
      const cleanCep = cep.replace(/\D/g, '');
      const response = await axios.get(
        `https://brasilapi.com.br/api/cep/v1/${cleanCep}`,
      );

      return {
        zipCode: cleanCep,
        street: response.data.street || '',
        neighborhood: response.data.neighborhood || '',
        city: response.data.city || '',
        state: response.data.state || '',
      };
    } catch (error: any) {
      console.error('Erro em todas as APIs de CEP:', error);

      return {
        zipCode: cep,
        street: '',
        neighborhood: '',
        city: '',
        state: '',
        error: true,
        errorMessage: 'CEP não encontrado em nenhuma API',
      };
    }
  }
}
