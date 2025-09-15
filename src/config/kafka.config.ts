import { KafkaConfig, SASLOptions } from 'kafkajs';

import { config } from '../config';

// Validação de configurações obrigatórias do Kafka
if (config.kafka) {
  const requiredKafkaVars = {
    brokers: config.kafka.brokers,
    saslUsername: config.kafka.saslUsername,
    saslPassword: config.kafka.saslPassword,
  };

  for (const [key, value] of Object.entries(requiredKafkaVars)) {
    if (!value) {
      throw new Error(`Missing required Kafka configuration: ${key}`);
    }
  }
}

export const kafkaConfig: KafkaConfig = {
  clientId: 'anthor-missions-service',
  brokers: config.kafka?.brokers?.split(',').map((broker) => broker.trim()) || [
    'localhost:9092',
  ],

  // Configurações SSL/TLS
  ssl: config.kafka?.ssl
    ? {
        rejectUnauthorized: process.env.NODE_ENV === 'production', // Mais rigoroso em produção
      }
    : false,

  // Configurações SASL
  sasl: config.kafka?.sasl
    ? ({
        mechanism: (config.kafka?.saslMechanism || 'plain') as any,
        username: config.kafka?.saslUsername || '',
        password: config.kafka?.saslPassword || '',
      } as SASLOptions)
    : undefined,

  // Timeouts otimizados
  connectionTimeout: 30000, // 30 segundos
  authenticationTimeout: 10000, // 10 segundos (reduzido)
  requestTimeout: 30000, // Timeout para requests

  // Configurações de retry otimizadas
  retry: {
    initialRetryTime: 1000,
    retries: 8, // Reduzido para falhar mais rápido
    maxRetryTime: 30000, // Reduzido
    factor: 2, // Backoff mais agressivo
    multiplier: 2,
    restartOnFailure: async (error: any) => {
      console.error(
        `Kafka client connection failure: ${JSON.stringify({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
        })}`,
      );
      return true;
    },
  },

  // Configurações de log (opcional)
  logLevel: (process.env.KAFKA_LOG_LEVEL as any) || 'info',
};

export const kafkaTopics = {
  validateDocuments: `${config.kafka?.topicPrefix || 'prod-'}validate-documents`,
};
