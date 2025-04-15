import { Injectable, Logger } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { UserRepository } from 'src/repositories/User.repository';

@Injectable()
export class VerifyExistingUserService {
  private readonly logger = new Logger(VerifyExistingUserService.name);
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(worker: any, email?: string, cpf?: string): Promise<any> {
    if (!email && !cpf) {
      this.logger.warn(
        'Nenhum email ou CPF fornecido para verificação. Retornando worker original.',
      );
      return worker;
    }

    try {
      // Busca usuário pelo email ou CPF
      let query = {};
      if (email) query = { ...query, email };
      if (cpf) query = { ...query, cpf };

      const existingUser = await this.userRepository.findOne(query);

      if (!existingUser) {
        this.logger.log(
          'Nenhum usuário existente encontrado para o email/CPF informado.',
        );
        return worker;
      }

      this.logger.log(
        `Usuário existente encontrado (id: ${existingUser.id}). Verificando worker associado...`,
      );
      // Verifica se existe um worker associado a este usuário
      const existingWorker = await this.workerRepository.findOne({
        userId: existingUser.id,
      });

      if (existingWorker) {
        this.logger.log(
          `Worker existente encontrado para o usuário (id: ${existingUser.id}). Mesclando dados.`,
        );
        // Se existir worker, usa ele como base
        return {
          ...existingWorker,
          ...worker, // Preserva os dados atualizados
        };
      } else {
        this.logger.log(
          `Nenhum worker encontrado para o usuário (id: ${existingUser.id}). Associando userId ao worker atual.`,
        );
        // Se não existir worker, associa o ID do usuário
        return {
          ...worker,
          userId: existingUser.id,
          name: worker.name || existingUser.name,
          email: worker.email || existingUser.email,
        };
      }
    } catch (error) {
      this.logger.error(
        `Erro ao verificar usuário existente: ${error.message}`,
        error.stack,
      );
      return worker;
    }
  }
}
