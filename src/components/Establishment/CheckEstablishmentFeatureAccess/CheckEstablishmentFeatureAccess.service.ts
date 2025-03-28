import { Injectable } from '@nestjs/common';
import { EstablishmentRepository } from 'src/repositories/Establishment.repository';

@Injectable()
export class CheckEstablishmentFeatureAccessService {
  constructor(
    private readonly establishmentRepository: EstablishmentRepository,
  ) {}

  async execute(establishmentId: string): Promise<boolean> {
    const establishment =
      await this.establishmentRepository.findById(establishmentId);
    return establishment?.hasTokenGenerationAccess ?? false;
  }
}
