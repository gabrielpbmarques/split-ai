import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { UserRepository } from 'src/repositories/User.repository';

@Injectable()
export class VerifyExistingUserService {
  constructor(
    private readonly workerRepository: WorkerRepository,
    private readonly userRepository: UserRepository,
  ) {}

  async execute(worker: any, email?: string, cpf?: string): Promise<any> {
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
}
