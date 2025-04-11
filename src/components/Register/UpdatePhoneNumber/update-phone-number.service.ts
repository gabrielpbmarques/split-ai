import { Injectable } from '@nestjs/common';
import { PhoneRepository } from 'src/repositories/Phone.repository';
import { Phone as PhoneSchema } from 'src/schemas/Phone.schema';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { Phone } from 'src/models/Phone.model';

@Injectable()
export class UpdatePhoneNumberService {
  constructor(
    private readonly phoneRepository: PhoneRepository,
    private readonly workerRepository: WorkerRepository,
  ) {}

  async execute(
    payload: Pick<PhoneSchema, 'countryCode' | 'areaCode' | 'number'>,
    workerId: string,
    phoneId?: string,
  ): Promise<Phone> {
    let phone: Phone;

    if (phoneId) {
      phone = await this.phoneRepository.update(phoneId, payload);
    } else {
      phone = await this.phoneRepository.create(payload);
      await this.workerRepository.update(workerId, { phoneId: phone._id });
    }

    return phone;
  }
}
