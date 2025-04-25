import { Injectable } from '@nestjs/common';
import { WorkerRepository } from 'src/repositories/Worker.repository';
import { PixObject } from 'src/models/Worker.model';

@Injectable()
export class UpdatePixService {
  constructor(private readonly workerRepository: WorkerRepository) {}

  /**
   * Atualiza as informações de PIX do worker
   * @param workerId ID do worker
   * @param pixData Dados do PIX
   * @returns Dados atualizados do worker
   */
  async execute(workerId: string, pixData: Partial<PixObject>) {
    try {
      const formattedPixData = this.formatPixData(pixData);

      const updatedWorker = await this.workerRepository.update(workerId, {
        pix: formattedPixData,
      });

      if (!updatedWorker) {
        throw new Error(`Worker não encontrado com ID: ${workerId}`);
      }

      return updatedWorker;
    } catch (error) {
      console.error('Erro ao atualizar PIX:', error);
      throw error;
    }
  }

  /**
   * Formata os dados do PIX para garantir que estejam no formato correto
   * @param data Dados do PIX
   * @returns Dados do PIX formatados
   */
  private formatPixData(data: Partial<PixObject>): PixObject {
    return {
      type: data.type || '',
      key: data.key || '',
      isRemoved: false,
      removedAt: null,
    };
  }
}
