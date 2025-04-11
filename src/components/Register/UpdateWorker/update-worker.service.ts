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

    // Se não houver dados parseados, retorna o worker original
    if (!parsedData) {
      return worker;
    }

    // Integra os dados parseados com o worker
    let updatedWorker = {
      ...worker,
      ...parsedData,
    };

    // Verifica se existem usuários pelo email ou CPF
    if (parsedData.email || parsedData.cpf) {
      updatedWorker = await this.verifyExistingUserService.execute(
        updatedWorker,
        parsedData.email,
        parsedData.cpf,
      );
    }

    // Persiste o worker e a sessão
    updatedWorker = await this.saveWorkerService.execute(updatedWorker);
    await this.saveSessionService.execute(
      sessionId,
      phoneNumber,
      updatedWorker,
    );

    return updatedWorker;
  }
}
