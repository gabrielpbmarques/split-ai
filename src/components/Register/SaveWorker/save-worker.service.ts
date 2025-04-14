import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { Worker } from 'src/models/Worker.model';
import { BankAccount } from 'src/models/BankAccount.model';
import { Address } from 'src/models/Address.model';
import { UpdatePhoneNumberService } from '../UpdatePhoneNumber/update-phone-number.service';
import { UpdateBankAccountService } from '../UpdateBankAccount/update-bank-account.service';
import { UpdateAddressService } from '../UpdateAddress/update-address.service';

interface WorkerExtras {
  phone?: {
    countryCode: string;
    areaCode: string;
    number: string;
  };
  address?: Partial<Address>;
  bankInfo?: Partial<BankAccount>;
  document?: {
    type: string;
    number: string;
    frontImage?: string;
    backImage?: string;
    selfieImage?: string;
  };
  fieldsToUpdate?: string[];
}

// Tipo que representa os dados completos do worker incluindo extras
type WorkerWithExtras = Worker & WorkerExtras;

@Injectable()
export class SaveWorkerService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly updatePhoneNumberService: UpdatePhoneNumberService,
    private readonly updateBankAccountService: UpdateBankAccountService,
    private readonly updateAddressService: UpdateAddressService,
  ) {}

  async execute(worker: WorkerWithExtras): Promise<Worker> {
    console.log('Worker extras:', worker);
    try {
      const { phone, bankInfo, address, document, fieldsToUpdate, ...rest } =
        worker;
      console.log('rest', rest);
      // Se já tem _id, atualiza
      if (rest._id) {
        await this.workerRepository.update(rest._id.toString(), rest);

        const shouldUpdatePhone = fieldsToUpdate?.some((f) =>
          f.includes('phone'),
        );
        const shouldUpdateBankInfo =
          fieldsToUpdate?.some((f) => f.includes('bankInfo')) &&
          this.hasBankInfo(bankInfo);
        const shouldUpdateAddress =
          fieldsToUpdate?.some((f) => f.includes('address')) &&
          this.hasAddress(address);

        console.log('shouldUpdatePhone', shouldUpdatePhone);
        console.log('shouldUpdateBankInfo', shouldUpdateBankInfo);
        console.log('shouldUpdateAddress', shouldUpdateAddress);

        if (shouldUpdatePhone) {
          await this.updatePhoneNumberService.execute(
            phone,
            rest._id.toString(),
            rest.phoneId,
          );
        }
        if (shouldUpdateBankInfo) {
          await this.updateBankAccountService.execute(
            bankInfo,
            rest._id.toString(),
            rest.bankAccount.toString(),
          );
        }
        if (shouldUpdateAddress) {
          await this.updateAddressService.execute(address, rest._id.toString());
        }
      }
      // Se tem dados pessoais completos, cria novo worker
      else if (this.hasPersonalInfoComplete(worker)) {
        const createdWorker = await this.workerRepository.create(rest);
        worker._id = createdWorker._id;

        if (this.hasPhone(phone))
          await this.updatePhoneNumberService.execute(
            phone,
            worker._id.toString(),
          );

        if (this.hasBankInfo(bankInfo))
          await this.updateBankAccountService.execute(
            bankInfo,
            worker._id.toString(),
          );

        console.log('has address', this.hasAddress(address));

        if (this.hasAddress(address))
          await this.updateAddressService.execute(
            address,
            worker._id.toString(),
          );
      }
      // Caso contrário, mantém em memória
      else {
        console.log(
          'Worker temporário não persistido - aguardando dados completos',
        );
      }
    } catch (error) {
      console.error('Erro ao salvar worker:', error);
    }

    return worker;
  }

  private hasPersonalInfoComplete(worker: WorkerWithExtras): boolean {
    return !!(
      worker.name &&
      worker.email &&
      worker.cpf &&
      worker.birthDate &&
      worker.phone &&
      worker.gender
    );
  }

  private hasPhone(phone: WorkerWithExtras['phone']): boolean {
    return !!(phone.countryCode && phone.areaCode && phone.number);
  }

  private hasBankInfo(bankInfo: WorkerWithExtras['bankInfo']): boolean {
    return !!(
      bankInfo?.bankCode &&
      bankInfo?.agency &&
      bankInfo?.account &&
      bankInfo?.accountDigit &&
      bankInfo?.type &&
      bankInfo?.name &&
      bankInfo?.cpf
    );
  }

  private hasAddress(address: WorkerWithExtras['address']): boolean {
    return !!(
      address?.street &&
      address?.number &&
      address?.neighborhood &&
      address?.city &&
      address?.state &&
      address?.zipCode
    );
  }
}
