import { Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories/User.repository';
import { WorkerRepository } from 'src/repositories/Worker.repository';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly workerRepository: WorkerRepository,
  ) {}

  async execute(worker: any): Promise<any> {
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
        userId: newUser._id,
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
}
