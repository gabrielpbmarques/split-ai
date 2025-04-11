import { Injectable } from '@nestjs/common';
import { UpdateWorkerDto } from './update-worker.dto';
import { SaveWorkerService } from '../SaveWorker/save-worker.service';
import { SaveSessionService } from '../SaveSession/save-session.service';
import { VerifyExistingUserService } from '../VerifyExistingUser/verify-existing-user.service';
import { CreateUserService } from '../CreateUser/create-user.service';

@Injectable()
export class UpdateWorkerService {
  constructor(
    private readonly saveWorkerService: SaveWorkerService,
    private readonly saveSessionService: SaveSessionService,
    private readonly verifyExistingUserService: VerifyExistingUserService,
    private readonly createUserService: CreateUserService,
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

    // Verifica se temos senha e estamos no estágio de endereço com dados completos
    if (
      updatedWorker.signupStage === 'address' &&
      this.hasAddressComplete(updatedWorker) &&
      parsedData.password &&
      !updatedWorker.userId &&
      updatedWorker.email &&
      updatedWorker.cpf &&
      updatedWorker.name
    ) {
      // Cria o usuário e atualiza o worker
      updatedWorker = await this.createUserService.execute(updatedWorker);
    }

    // Persiste o worker e a sessão
    await this.saveWorkerService.execute(updatedWorker);
    await this.saveSessionService.execute(
      sessionId,
      phoneNumber,
      updatedWorker,
    );

    return updatedWorker;
  }

  private hasAddressComplete(worker: any): boolean {
    const address = worker.address || {};
    return !!(
      address.street &&
      address.number &&
      address.neighborhood &&
      address.city &&
      address.state &&
      address.zipCode
    );
  }
}
