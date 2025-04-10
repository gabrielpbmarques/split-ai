import { Injectable } from '@nestjs/common';
import { UpdateWorkerDto } from './update-worker.dto';
import { WorkerRepository } from '../../../repositories/Worker.repository';
import { UserRepository } from '../../../repositories/User.repository';
import { SessionRepository } from '../../../repositories/Session.repository';

@Injectable()
export class UpdateWorkerService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
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
      updatedWorker = await this.verifyExistingUser(
        updatedWorker,
        parsedData.email,
        parsedData.cpf,
      );
    }

    // Atualiza o estágio do cadastro
    updatedWorker = this.updateSignupStage(updatedWorker);

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
      updatedWorker = await this.createUser(updatedWorker);
      // Atualiza o estágio novamente
      updatedWorker = this.updateSignupStage(updatedWorker);
    }

    // Persiste o worker e a sessão
    await this.saveWorker(updatedWorker);
    await this.saveSession(sessionId, phoneNumber, updatedWorker);

    return updatedWorker;
  }

  private async verifyExistingUser(
    worker: any,
    email?: string,
    cpf?: string,
  ): Promise<any> {
    if (!email && !cpf) return worker;

    try {
      // Busca usuário pelo email ou CPF
      let query = {};
      if (email) query = { ...query, email };
      if (cpf) query = { ...query, cpf };

      const existingUser = await this.userRepository.findOne(query);

      if (!existingUser) return worker;

      // Verifica se existe um worker associado a este usuário
      const existingWorker = await this.workerRepository.findOne({
        userId: existingUser.id,
      });

      if (existingWorker) {
        // Se existir worker, usa ele como base
        return {
          ...existingWorker,
          ...worker, // Preserva os dados atualizados
        };
      } else {
        // Se não existir worker, associa o ID do usuário
        return {
          ...worker,
          userId: existingUser.id,
          name: worker.name || existingUser.name,
          email: worker.email || existingUser.email,
        };
      }
    } catch (error) {
      console.error('Erro ao verificar usuário existente:', error);
      return worker;
    }
  }

  private async createUser(worker: any): Promise<any> {
    try {
      if (!worker.email || !worker.name || !worker.password) {
        return worker;
      }

      // Primeiro verifica se o worker já existe no banco (tem _id)
      let workerId = worker._id ? worker._id.toString() : null;

      // Se o worker não existe ainda, cria-o primeiro
      if (!workerId) {
        const createdWorker = await this.workerRepository.create(worker);
        workerId = createdWorker._id.toString();
        worker._id = createdWorker._id;
      }

      // Cria o usuário conforme a estrutura real do banco
      const newUser = await this.userRepository.create({
        name: worker.name,
        email: worker.email,
        password: worker.password,
        type: 'worker',
        permissions: [],
        isRemoved: false,
        workerId: workerId, // Importante: adiciona a referência ao worker
        createdAt: new Date(),
      });

      // Atualiza o worker com o userId e remove a senha
      const updatedWorker = {
        ...worker,
        userId: newUser.id,
        password: undefined,
      };

      // Sempre atualiza o worker com o userId
      await this.workerRepository.update(
        updatedWorker._id.toString(),
        updatedWorker,
      );

      return updatedWorker;
    } catch (error) {
      return worker;
    }
  }

  private async saveWorker(worker: any): Promise<void> {
    try {
      // Se já tem _id, atualiza
      if (worker._id) {
        await this.workerRepository.update(worker._id.toString(), worker);
      }
      // Se tem dados pessoais completos, cria novo worker
      else if (this.hasPersonalInfoComplete(worker)) {
        const createdWorker = await this.workerRepository.create(worker);
        worker._id = createdWorker._id;
      }
      // Caso contrário, mantém em memória
      else {
        console.log(
          'Worker temporário não persistido - aguardando dados completos',
        );
      }
    } catch (error) {
      console.error('Erro ao salvar worker:', error);
    }
  }

  private async saveSession(
    sessionId: string,
    phoneNumber: string,
    workerData: any,
  ): Promise<void> {
    try {
      const existingSession =
        await this.sessionRepository.findBySessionId(sessionId);

      if (existingSession) {
        // Atualiza a sessão
        await this.sessionRepository.update(sessionId, {
          workerData,
          lastInteraction: new Date(),
        });
      } else {
        // Cria a sessão
        await this.sessionRepository.create({
          sessionId,
          phoneNumber,
          workerData,
          lastInteraction: new Date(),
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
    }
  }

  /**
   * Atualiza o estágio de cadastro com base nos dados disponíveis
   */
  private updateSignupStage(worker: any): any {
    // Se não tem estágio definido, começa pelo personal_info
    if (!worker.signupStage) {
      worker.signupStage = 'personal_info';
      return worker;
    }

    // Lógica de progressão dos estágios
    switch (worker.signupStage) {
      case 'personal_info':
        if (this.hasPersonalInfoComplete(worker)) {
          worker.signupStage = 'address';
        }
        break;

      case 'address':
        if (this.hasAddressComplete(worker)) {
          // No fluxo da Anthor, aqui solicitamos a senha para criar a conta
          // Se tiver userId, podemos avançar
          if (worker.userId) {
            worker.signupStage = 'profile_picture';
          }
        }
        break;

      case 'profile_picture':
        if (worker.profilePicture) {
          worker.signupStage = 'document';
        }
        break;

      case 'document':
        if (this.hasDocumentsComplete(worker)) {
          worker.signupStage = 'bank_account';
        }
        break;

      case 'bank_account':
        if (this.hasBankAccountComplete(worker)) {
          worker.signupStage = 'chains';
        }
        break;

      case 'chains':
        if (worker.chains && worker.chains.length > 0) {
          worker.signupStage = 'complete';
        }
        break;
    }

    return worker;
  }

  // Métodos auxiliares para validar a completude dos dados
  private hasPersonalInfoComplete(worker: any): boolean {
    return !!(
      worker.name &&
      worker.email &&
      worker.cpf &&
      worker.birthDate &&
      worker.gender
    );
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

  private hasDocumentsComplete(worker: any): boolean {
    return !!(
      worker.documentFront &&
      worker.documentBack &&
      worker.documentSelfie
    );
  }

  private hasBankAccountComplete(worker: any): boolean {
    const bankAccount = worker.bankAccount || {};
    return !!(
      bankAccount.bankCode &&
      bankAccount.agency &&
      bankAccount.accountNumber &&
      bankAccount.accountType
    );
  }
}
