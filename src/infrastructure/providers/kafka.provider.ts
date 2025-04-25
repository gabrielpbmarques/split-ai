import { Provider } from '@nestjs/common';
import {
  Kafka,
  Producer,
  Consumer,
  EachMessagePayload,
  SASLOptions,
} from 'kafkajs';
import { kafkaConfig } from 'src/config/kafka.config';

export const KAFKA_CLIENT = 'KAFKA_CLIENT';
export const KAFKA_SERVICE = 'KAFKA_SERVICE';

export interface IKafkaService {
  publish<T>(topic: string, message: T): Promise<void>;
  subscribe(
    topic: string,
    groupId: string,
    callback: (message: EachMessagePayload) => Promise<void>,
  ): Promise<void>;
}

export const KafkaClientProvider: Provider = {
  provide: KAFKA_CLIENT,
  useFactory: (): Kafka => {
    return new Kafka(kafkaConfig);
  },
};

export const KafkaServiceProvider: Provider = {
  provide: KAFKA_SERVICE,
  useFactory: async (kafka: Kafka): Promise<IKafkaService> => {
    const producer = kafka.producer();
    await producer.connect();

    // Armazenar os consumidores para desconexão posterior
    const consumers: Map<string, Consumer> = new Map();

    return {
      /**
       * Publica uma mensagem em um tópico Kafka
       * @param topic Nome do tópico
       * @param message Mensagem a ser publicada
       */
      async publish<T>(topic: string, message: T): Promise<void> {
        await producer.send({
          topic,
          messages: [
            {
              value: JSON.stringify(message),
            },
          ],
        });
      },

      /**
       * Inscreve-se em um tópico Kafka para consumir mensagens
       * @param topic Nome do tópico
       * @param groupId ID do grupo de consumidores
       * @param callback Função a ser chamada para cada mensagem
       */
      async subscribe(
        topic: string,
        groupId: string,
        callback: (message: EachMessagePayload) => Promise<void>,
      ): Promise<void> {
        const consumer = kafka.consumer({ groupId });
        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: false });

        await consumer.run({
          eachMessage: callback,
        });

        consumers.set(`${topic}-${groupId}`, consumer);
      },
    };
  },
  inject: [KAFKA_CLIENT],
};

export const KafkaProvider = [KafkaClientProvider, KafkaServiceProvider];
