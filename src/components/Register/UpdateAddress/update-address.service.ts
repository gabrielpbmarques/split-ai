import { Injectable } from '@nestjs/common';
import { AddressRepository } from 'src/repositories/Address.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { Address } from 'src/models/Address.model';

@Injectable()
export class UpdateAddressService {
  constructor(
    private readonly addressRepository: AddressRepository,
    private readonly workerRepository: WorkerRepository,
  ) {}

  async execute(address: Partial<Address>, workerId: string): Promise<Address> {
    const newAddress = await this.addressRepository.create(address);

    await this.workerRepository.update(workerId, {
      addressId: newAddress._id.toString(),
    });

    return newAddress;
  }
}
