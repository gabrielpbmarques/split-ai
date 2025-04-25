import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { Worker, PixObject } from 'src/models/Worker.model';
import { UpdatePhoneNumberService } from '../UpdatePhoneNumber/update-phone-number.service';
import { UpdatePixService } from '../UpdatePix/update-pix.service';
import { UpdateAddressService } from '../UpdateAddress/update-address.service';
import { UpdateUserService } from '../UpdateUser/update-user.service';
import { Address } from 'src/models/Address.model';

interface WorkerExtras {
  phone?: {
    countryCode: string;
    areaCode: string;
    number: string;
  };
  pix?: Partial<PixObject>;
  address?: Partial<Address>;
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
    private readonly updatePixService: UpdatePixService,
    private readonly updateAddressService: UpdateAddressService,
    private readonly updateUserService: UpdateUserService,
  ) {}

  async execute(worker: WorkerWithExtras): Promise<Worker> {
    const {
      phone,
      pix,
      address,
      document,
      fieldsToUpdate,
      password,
      profilePictureId,
      addressId,
      phoneId,
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

      const shouldUpdatePix =
        fieldsToUpdate?.some((f) => f.includes('pix')) && this.hasPixInfo(pix);

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
        const updatedPhone = await this.updatePhoneNumberService.execute(
          phone,
          rest._id.toString(),
          worker.phoneId,
        );

        worker.phoneId = updatedPhone._id.toString();
      }

      if (shouldUpdatePix) {
        await this.updatePixService.execute(rest._id.toString(), pix);
      }

      if (shouldUpdateAddress) {
        const updatedAddress = await this.updateAddressService.execute(
          address,
          rest._id.toString(),
          worker.addressId,
        );

        worker.addressId = updatedAddress._id.toString();
      }

      return worker;
    }

    if (this.hasPersonalInfoComplete(worker)) {
      const createdWorker = await this.workerRepository.create(rest);
      worker._id = createdWorker._id;

      if (this.hasPhone(phone)) {
        const updatedPhone = await this.updatePhoneNumberService.execute(
          phone,
          worker._id.toString(),
        );

        worker.phoneId = updatedPhone._id.toString();
      }

      if (this.hasPixInfo(pix)) {
        await this.updatePixService.execute(worker._id.toString(), pix);
      }

      if (this.hasAddress(address)) {
        const updatedAddress = await this.updateAddressService.execute(
          address,
          worker._id.toString(),
        );

        worker.addressId = updatedAddress._id.toString();
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

  private hasPixInfo(pix: WorkerWithExtras['pix']): boolean {
    return !!(pix?.type && pix?.key);
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
