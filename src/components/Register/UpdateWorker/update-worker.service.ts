import { Injectable } from '@nestjs/common';
import { UpdateWorkerDto } from './update-worker.dto';
import { SaveWorkerService } from '../SaveWorker/save-worker.service';
import { SaveSessionService } from '../SaveSession/save-session.service';
import { VerifyExistingUserService } from '../VerifyExistingUser/verify-existing-user.service';

@Injectable()
export class UpdateWorkerService {
  constructor(
    private readonly saveWorkerService: SaveWorkerService,
    private readonly saveSessionService: SaveSessionService,
    private readonly verifyExistingUserService: VerifyExistingUserService,
  ) {}

  async execute(updateWorkerDto: UpdateWorkerDto): Promise<any> {
    const { worker, parsedData, sessionId, phoneNumber } = updateWorkerDto;

    if (!parsedData) {
      return worker;
    }

    const { address, bankInfo, ...personalData } = parsedData;

    let updatedWorker = {
      ...worker,
      ...personalData,
      address: address ? { ...worker.address, ...address } : worker.address,
      bankInfo: bankInfo
        ? { ...worker.bankInfo, ...bankInfo }
        : worker.bankInfo,
    };

    if (parsedData.email || parsedData.cpf) {
      updatedWorker = await this.verifyExistingUserService.execute(
        updatedWorker,
        parsedData.email,
        parsedData.cpf,
      );
    }

    updatedWorker = await this.saveWorkerService.execute(updatedWorker);

    if (updatedWorker) {
      await this.saveSessionService.execute(
        sessionId,
        phoneNumber,
        updatedWorker,
      );
    } else {
      console.error(
        'UpdateWorkerService - updatedWorker é null/undefined, não atualizando a sessão',
      );
    }

    return updatedWorker;
  }
}
