import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { Worker } from 'src/models/Worker.model';
import { BankAccount } from 'src/models/BankAccount.model';
import { Address } from 'src/models/Address.model';
import { UpdatePhoneNumberService } from '../UpdatePhoneNumber/update-phone-number.service';
import { UpdateBankAccountService } from '../UpdateBankAccount/update-bank-account.service';
import { UpdateAddressService } from '../UpdateAddress/update-address.service';
import { UpdateUserService } from '../UpdateUser/update-user.service';

interface WorkerExtras {
  phone?: {
    countryCode: string;
    areaCode: string;
    number: string;
  };
  address?: Partial<Address>;
  bankInfo?: Partial<BankAccount>;
  password?: string;
  profilePictureId?: string;
  document?: {
    type: string;
    number: string;
    frontImage?: string;
    backImage?: string;
    selfieImage?: string;
  };
  fieldsToUpdate?: string[];
}

type WorkerWithExtras = Worker & WorkerExtras;

@Injectable()
export class SaveWorkerService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly updatePhoneNumberService: UpdatePhoneNumberService,
    private readonly updateBankAccountService: UpdateBankAccountService,
    private readonly updateAddressService: UpdateAddressService,
    private readonly updateUserService: UpdateUserService,
  ) {}

  async execute(worker: WorkerWithExtras): Promise<Worker> {
    const {
      phone,
      bankInfo,
      address,
      document,
      fieldsToUpdate,
      password,
      profilePictureId,
      ...rest
    } = worker;

    if (rest._id) {
      await this.workerRepository.update(rest._id.toString(), rest);

      const shouldUpdatePhone = fieldsToUpdate?.some((f) =>
        f.includes('phone'),
      );

      const shouldUpdateUser =
        fieldsToUpdate?.some(
          (f) => f.includes('password') || f.includes('profilePictureId'),
        ) && this.hasUserInfo({ ...rest, password });

      const shouldUpdateBankInfo =
        fieldsToUpdate?.some((f) => f.includes('bankInfo')) &&
        this.hasBankInfo(bankInfo);

      const shouldUpdateAddress =
        fieldsToUpdate?.some((f) => f.includes('address')) &&
        this.hasAddress(address);

      if (shouldUpdateUser) {
        await this.updateUserService.execute(
          { ...rest, password },
          rest._id.toString(),
        );
      }

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
          rest.bankAccount?.toString() || undefined,
        );
      }

      if (shouldUpdateAddress) {
        await this.updateAddressService.execute(
          address,
          rest._id.toString(),
          rest.addressId,
        );
      }

      return worker;
    }

    if (this.hasPersonalInfoComplete(worker)) {
      const createdWorker = await this.workerRepository.create(rest);
      worker._id = createdWorker._id;

      if (this.hasPhone(phone)) {
        await this.updatePhoneNumberService.execute(
          phone,
          worker._id.toString(),
        );
      }

      if (this.hasBankInfo(bankInfo)) {
        await this.updateBankAccountService.execute(
          bankInfo,
          worker._id.toString(),
        );
      }

      if (this.hasAddress(address)) {
        await this.updateAddressService.execute(address, worker._id.toString());
      }

      return worker;
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
      bankInfo?.type
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

  private hasUserInfo(
    userInfo: Pick<WorkerWithExtras, 'name' | 'email' | 'password'>,
  ): boolean {
    return !!(userInfo.name && userInfo.email && userInfo.password);
  }
}
