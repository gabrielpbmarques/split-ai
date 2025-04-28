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

  /**
   * Atualiza ou cria o endereço do worker
   * @param address Dados do endereço
   * @param workerId ID do worker
   * @param addressId ID do endereço (opcional)
   * @returns Endereço atualizado
   */
  async execute(
    address: Partial<Address>,
    workerId: string,
    addressId?: string,
  ): Promise<Address> {
    let updatedAddress: Address;

    if (addressId) {
      updatedAddress = await this.addressRepository.update(addressId, address);
    } else {
      updatedAddress = await this.addressRepository.create(address);
      await this.workerRepository.update(workerId, {
        addressId: updatedAddress._id.toString(),
      });
    }

    return updatedAddress;
  }
}
