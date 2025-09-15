import { Provider } from '@nestjs/common';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';
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
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;
}

const MAX_RETRIES = 5;
const CALLBACK_TIMEOUT_MS = 15000;

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

    const consumers: Map<string, Consumer> = new Map();

    return {
      async publish<T>(topic: string, message: T): Promise<void> {
        await producer.send({
          topic,
          messages: [{ value: JSON.stringify(message) }],
        });
      },

      async subscribe(
        topic: string,
        groupId: string,
        callback: (message: EachMessagePayload) => Promise<void>,
      ): Promise<void> {
        const consumer = kafka.consumer({
          groupId,
          sessionTimeout: 60000,
          heartbeatInterval: 5000,
          rebalanceTimeout: 60000,
          readUncommitted: false,
          allowAutoTopicCreation: false,
          retry: {
            initialRetryTime: 1000,
            retries: 8,
            maxRetryTime: 30000,
            factor: 2,
            multiplier: 2,
            restartOnFailure: async (error: any) => {
              console.error(
                `Kafka consumer failure — delaying restart: ${JSON.stringify({
                  error,
                  topic,
                  groupId,
                })}`,
              );
              await new Promise((r) => setTimeout(r, 3000));
              return true;
            },
          },
        });

        await consumer.connect();
        await consumer.subscribe({ topic, fromBeginning: false });

        const attemptsMap = new Map<string, number>();

        await consumer.run({
          autoCommit: false,
          partitionsConsumedConcurrently: 1,

          eachMessage: async (payload) => {
            const key = `${payload.topic}-${payload.partition}-${payload.message.offset}`;

            const processWithTimeout = () =>
              Promise.race([
                callback(payload),
                new Promise((_, reject) =>
                  setTimeout(
                    () => reject(new Error('Callback timeout')),
                    CALLBACK_TIMEOUT_MS,
                  ),
                ),
              ]);

            try {
              await processWithTimeout();

              await consumer.commitOffsets([
                {
                  topic: payload.topic,
                  partition: payload.partition,
                  offset: (parseInt(payload.message.offset) + 1).toString(),
                },
              ]);

              attemptsMap.delete(key);
            } catch (error) {
              const attempts = (attemptsMap.get(key) || 0) + 1;
              attemptsMap.set(key, attempts);

              console.error(
                `Error processing message (${attempts}/${MAX_RETRIES}): ${JSON.stringify(
                  {
                    topic,
                    groupId,
                    partition: payload.partition,
                    offset: payload.message.offset,
                    error: error.message,
                  },
                )}`,
              );

              if (attempts >= MAX_RETRIES) {
                console.warn(
                  `Max retries reached — consider DLQ for message ${JSON.stringify(
                    {
                      topic,
                      partition: payload.partition,
                      offset: payload.message.offset,
                    },
                  )}`,
                );
                // TODO: enviar mensagem para DLQ aqui, se necessário
                attemptsMap.delete(key);
              }
              // Sem commit = reprocessa
            }
          },
        });

        consumers.set(`${topic}-${groupId}`, consumer);
      },

      async disconnect(): Promise<void> {
        try {
          for (const [key, consumer] of consumers.entries()) {
            await consumer.disconnect();
            console.log(`Consumer disconnected: ${key}`);
          }
          consumers.clear();

          await producer.disconnect();
          console.log('Kafka producer disconnected');
        } catch (error) {
          console.error(`Error disconnecting Kafka clients: ${error}`);
          throw error;
        }
      },

      async healthCheck(): Promise<boolean> {
        try {
          const admin = kafka.admin();
          await admin.connect();
          await admin.listTopics();
          await admin.disconnect();
          return true;
        } catch (error) {
          console.error(`Kafka health check failed: ${error}`);
          return false;
        }
      },
    };
  },
  inject: [KAFKA_CLIENT],
};

export const KafkaProvider = [KafkaClientProvider, KafkaServiceProvider];
