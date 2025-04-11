import { Injectable } from '@nestjs/common';
import { UpdateWorkerDto } from './update-worker.dto';
import { WorkerRepository } from '../../../repositories/Worker.repository';
import { UserRepository } from '../../../repositories/User.repository';
import { SessionRepository } from '../../../repositories/Session.repository';
import { UpdatePhoneNumberService } from '../UpdatePhoneNumber/update-phone-number.service';
import { UpdateAddressService } from '../UpdateAddress/update-address.service';
import { UpdateBankAccountService } from '../UpdateBankAccount/update-bank-account.service';

@Injectable()
export class UpdateWorkerService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly updatePhoneNumberService: UpdatePhoneNumberService,
    private readonly updateAddressService: UpdateAddressService,
    private readonly updateBankAccountService: UpdateBankAccountService,
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
    }

    if (parsedData.fieldsToUpdate.includes('phone') && worker._id)
      await this.updatePhoneNumberService.execute(
        parsedData.phone,
        worker._id.toString(),
      );

    if (parsedData.fieldsToUpdate.includes('address') && worker._id)
      await this.updateAddressService.execute(
        parsedData.address,
        worker._id.toString(),
      );

    if (parsedData.fieldsToUpdate.includes('bankAccount') && worker._id)
      await this.updateBankAccountService.execute(
        parsedData.bankAccount,
        worker._id.toString(),
      );

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
}
