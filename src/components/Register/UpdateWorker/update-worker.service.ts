import { Injectable, Logger } from '@nestjs/common';
import { UpdateWorkerDto } from './update-worker.dto';
import { SaveWorkerService } from '../SaveWorker/save-worker.service';
import { SaveSessionService } from '../SaveSession/save-session.service';
import { VerifyExistingUserService } from '../VerifyExistingUser/verify-existing-user.service';

@Injectable()
export class UpdateWorkerService {
  private readonly logger = new Logger(UpdateWorkerService.name);
  constructor(
    private readonly saveWorkerService: SaveWorkerService,
    private readonly saveSessionService: SaveSessionService,
    private readonly verifyExistingUserService: VerifyExistingUserService,
  ) {}

  async execute(updateWorkerDto: UpdateWorkerDto): Promise<any> {
    this.logger.log(
      `Iniciando atualização do worker para o telefone: ${updateWorkerDto.phoneNumber}`,
    );
    const { worker, parsedData, sessionId, phoneNumber } = updateWorkerDto;

    // Se não houver dados parseados, retorna o worker original
    if (!parsedData) {
      this.logger.warn(
        `Nenhum dado parseado recebido para o telefone: ${phoneNumber}, retornando worker original.`,
      );
      return worker;
    }

    // Integra os dados parseados com o worker
    // Extrair address e bankInfo para tratamento especial
    const { address, bankInfo, ...personalData } = parsedData;

    this.logger.debug(
      `Dados parseados: bankInfo=${JSON.stringify(bankInfo)}, address=${JSON.stringify(address)}`,
    );

    let updatedWorker = {
      ...worker,
      // Incluir todos os dados pessoais diretamente
      ...personalData,
      // Tratamento especial para objetos aninhados
      address: address ? { ...worker.address, ...address } : worker.address,
      bankInfo: bankInfo
        ? { ...worker.bankInfo, ...bankInfo }
        : worker.bankInfo,
    };

    this.logger.debug(
      `Worker após merge dos dados parseados: ${JSON.stringify(updatedWorker)}`,
    );

    // Verifica se existem usuários pelo email ou CPF
    if (parsedData.email || parsedData.cpf) {
      this.logger.debug(
        'Verificando existência de usuário pelo email ou CPF...',
      );
      try {
        updatedWorker = await this.verifyExistingUserService.execute(
          updatedWorker,
          parsedData.email,
          parsedData.cpf,
        );
        this.logger.verbose('Verificação de usuário existente concluída.');
      } catch (error) {
        this.logger.error(
          `Erro ao verificar usuário existente: ${error.message}`,
          error.stack,
        );
        throw error;
      }
    }

    // Persiste o worker e a sessão
    try {
      updatedWorker = await this.saveWorkerService.execute(updatedWorker);
      this.logger.debug('Worker persistido com sucesso.');
      await this.saveSessionService.execute(
        sessionId,
        phoneNumber,
        updatedWorker,
      );
      this.logger.debug('Sessão persistida com sucesso.');
    } catch (error) {
      this.logger.error(
        `Erro ao persistir worker ou sessão: ${error.message}`,
        error.stack,
      );
      throw error;
    }

    this.logger.log(
      `Atualização do worker finalizada para o telefone: ${phoneNumber}`,
    );
    return updatedWorker;
  }
}
