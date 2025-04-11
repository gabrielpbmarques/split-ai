import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { Worker } from 'src/models/Worker.model';

@Injectable()
export class SaveWorkerService {
  constructor(private readonly workerRepository: WorkerRepository) {}

  async execute(worker: Worker): Promise<Worker> {
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

    return worker;
  }

  private hasPersonalInfoComplete(worker: any): boolean {
    return !!(
      worker.name &&
      worker.email &&
      worker.cpf &&
      worker.birthDate &&
      worker.gender
    );
  }
}
