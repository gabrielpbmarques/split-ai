import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import mongoose from 'mongoose';

@Injectable()
export class VerifyExistingUserService {
  constructor(private readonly workerRepository: WorkerRepository) {}

  /**
   * Verifica se um usuário já existe e normaliza os dados de acordo com o formato do messageDataParser
   * @param worker Dados atuais do worker
   * @param email Email para busca (opcional)
   * @param cpf CPF para busca (opcional)
   * @returns Dados do worker normalizados
   */
  async execute(worker: any, email?: string, cpf?: string): Promise<any> {
    if (!email && !cpf) {
      return worker;
    }

    let query = {};

    if (email) query = { ...query, email };
    if (cpf) query = { ...query, cpf };

    // Busca o worker com todas as relações
    const existingWorker =
      await this.workerRepository.findOneWithRelations(query);

    if (existingWorker) {
      // Normaliza os dados de acordo com o formato do messageDataParser
      return this.normalizeWorkerData(worker, existingWorker);
    } else {
      return worker;
    }
  }

  /**
   * Normaliza os dados do worker de acordo com o formato do messageDataParser
   * @param currentData Dados atuais da sessão
   * @param workerData Dados do worker do banco de dados
   * @returns Dados normalizados
   */
  private normalizeWorkerData(currentData: any, workerData: any): any {
    // Cria um objeto base com os dados atuais
    const normalizedData = { ...currentData };

    // Dados básicos do worker
    normalizedData.name = workerData.name || normalizedData.name;
    normalizedData.nickname = workerData.nickname || normalizedData.nickname;
    normalizedData.email = workerData.email || normalizedData.email;
    normalizedData.cpf = workerData.cpf || normalizedData.cpf;
    normalizedData.birthDate = workerData.birthDate
      ? this.formatDate(workerData.birthDate)
      : normalizedData.birthDate;
    normalizedData.gender =
      this.normalizeGender(workerData.gender) || normalizedData.gender;
    normalizedData.hasLegalAge =
      workerData.hasLegalAge !== undefined
        ? workerData.hasLegalAge
        : normalizedData.hasLegalAge;
    normalizedData.hasPassport =
      workerData.hasPassport !== undefined
        ? workerData.hasPassport
        : normalizedData.hasPassport;
    normalizedData.signupStage =
      workerData.signupStage || normalizedData.signupStage;
    normalizedData.status = workerData.status || normalizedData.status;

    // Normaliza os dados do telefone
    if (workerData.phoneData) {
      normalizedData.phone = {
        countryCode: workerData.phoneData.countryCode,
        areaCode: workerData.phoneData.areaCode,
        number: workerData.phoneData.number,
      };
    }

    // Normaliza os dados do endereço
    if (workerData.addressData) {
      normalizedData.address = {
        zipCode: workerData.addressData.zipCode,
        street: workerData.addressData.street,
        number: workerData.addressData.number,
        complement: workerData.addressData.complement || '',
        neighborhood: workerData.addressData.neighborhood,
        city: workerData.addressData.city,
        state: workerData.addressData.state,
        country: workerData.addressData.country,
        cityCode: workerData.addressData.cityCode || undefined,
      };
    }

    // Normaliza os dados bancários
    if (workerData.bankAccountData) {
      normalizedData.bankInfo = {
        bankCode: workerData.bankAccountData.bankCode,
        agency: workerData.bankAccountData.agency,
        account: workerData.bankAccountData.account,
        accountDigit: workerData.bankAccountData.accountDigit,
        type: workerData.bankAccountData.type,
        name: workerData.bankAccountData.name,
        cpf: workerData.bankAccountData.cpf,
      };
    }

    // Normaliza os dados de comunicação e termos
    if (workerData.comunication) {
      normalizedData.comunication = {
        agree: workerData.comunication.agree,
      };
    }

    if (workerData.terms) {
      normalizedData.terms = {
        agree: workerData.terms.agree,
      };
    }

    return normalizedData;
  }

  /**
   * Formata uma data para o formato esperado pelo messageDataParser (YYYY-MM-DD)
   * @param date Data a ser formatada
   * @returns Data formatada como string
   */
  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  }

  /**
   * Normaliza o gênero para o formato esperado pelo messageDataParser
   * @param gender Gênero do worker
   * @returns Gênero normalizado
   */
  private normalizeGender(gender: string): string | undefined {
    if (!gender) return undefined;

    const genderMap: Record<string, string> = {
      male: 'male',
      female: 'female',
      masculino: 'male',
      feminino: 'female',
      uninformed: 'uninformed',
      'não informado': 'uninformed',
    };

    return genderMap[gender.toLowerCase()] || 'uninformed';
  }
}
