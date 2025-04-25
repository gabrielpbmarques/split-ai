import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';

@Injectable()
export class VerifyExistingUserService {
  constructor(private readonly workerRepository: WorkerRepository) {}

  async execute(worker: any, email?: string, cpf?: string): Promise<any> {
    if (!email && !cpf) {
      return worker;
    }

    let query = {};

    if (email) query = { ...query, email };
    if (cpf) query = { ...query, cpf };

    const existingWorker =
      await this.workerRepository.findOneWithRelations(query);

    if (existingWorker) {
      return this.normalizeWorkerData(worker, existingWorker);
    } else {
      return worker;
    }
  }

  private normalizeWorkerData(currentData: any, workerData: any): any {
    const normalizedData = { ...currentData };

    normalizedData._id = workerData._id;
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
    normalizedData.phoneId = workerData.phoneId || normalizedData.phoneId;
    normalizedData.addressId = workerData.addressId || normalizedData.addressId;
    normalizedData.bankAccount =
      workerData.bankAccount || normalizedData.bankAccount;
    normalizedData.userId = workerData.userId || normalizedData.userId;

    if (workerData.phoneData) {
      normalizedData.phone = {
        countryCode: workerData.phoneData.countryCode,
        areaCode: workerData.phoneData.areaCode,
        number: workerData.phoneData.number,
      };
    }

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

    if (workerData.bankAccountData) {
      normalizedData.bankInfo = {
        bankCode: workerData.bankAccountData.bankCode,
        agency: workerData.bankAccountData.agency,
        account: workerData.bankAccountData.account,
        accountDigit: workerData.bankAccountData.accountDigit,
        type: workerData.bankAccountData.type,
      };
    }

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

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

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
