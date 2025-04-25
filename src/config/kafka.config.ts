import { config } from '../config';
import { SASLOptions } from 'kafkajs';

export const kafkaConfig = {
  clientId: 'anthor-agi',
  brokers: config.kafka?.brokers?.split(',') || ['localhost:9092'],
  ssl: config.kafka?.ssl === 'true',
  sasl: config.kafka?.sasl
    ? ({
        mechanism: 'plain',
        username: config.kafka?.saslUsername || '',
        password: config.kafka?.saslPassword || '',
      } as SASLOptions)
    : undefined,
};

export const kafkaTopics = {
  validateDocuments: 'validate-documents',
};
