import { Injectable } from '@nestjs/common';
import { EstablishmentRepository } from 'src/repositories/Establishment.repository';

@Injectable()
export class CheckEstablishmentFeatureAccessService {
  constructor(
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async execute(workerId: string): Promise<boolean> {
    const establishment = await this.establishmentRepository.findById(workerId);
    return establishment?.hasTokenGenerationAccess ?? false;
  }
}
