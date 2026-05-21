import { Provider } from '@nestjs/common';
import { config } from 'src/config';

export const BRAVOHUB_ANALYTICS_SERVICE = 'BRAVOHUB_ANALYTICS_SERVICE';

export type SqlExecParams = {
  query: string;
  companyId: number;
  maxRows?: number;
  timeoutMs?: number;
  source?: string;
};

export type SqlExecSuccess = {
  rows: unknown[];
  columns: { name: string }[];
  rowCount: number;
  executionTimeMs: number;
  warnings: string[];
};

export type SqlExecError = {
  error: { code: string; message: string; hint?: string };
};

export type SqlExecResult = SqlExecSuccess | SqlExecError;

const DEFAULT_TIMEOUT_MS = 12000;
const MAX_RETRIES = 1;

export class BravohubAnalyticsService {
  constructor(
    private readonly baseUrl: string,
    private readonly apiKey: string,
  ) {}

  async executeSql(params: SqlExecParams): Promise<SqlExecResult> {
    const url = `${this.baseUrl.replace(/\/$/, '')}/api/sql/exec`;
    const body = JSON.stringify({
      query: params.query,
      companyId: params.companyId,
      maxRows: params.maxRows,
      timeoutMs: params.timeoutMs,
      source: params.source ?? 'split-ai-oracle',
    });

    let lastError: unknown;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `ApiKey ${this.apiKey}`,
            },
            body,
            signal: controller.signal,
          });
          const payload = (await res.json().catch(() => null)) as unknown;
          if (res.status >= 500 && attempt < MAX_RETRIES) {
            lastError = new Error(`upstream ${res.status}`);
            continue;
          }
          if (!res.ok) {
            if (payload && typeof payload === 'object' && 'error' in payload) {
              return payload as SqlExecError;
            }
            return {
              error: {
                code: 'UPSTREAM_ERROR',
                message: `bravohub-analytics retornou ${res.status}`,
              },
            };
          }
          return payload as SqlExecSuccess;
        } finally {
          clearTimeout(timer);
        }
      } catch (err) {
        lastError = err;
        if (attempt >= MAX_RETRIES) break;
      }
    }
    const detail = lastError instanceof Error ? lastError.message : 'unknown';
    return {
      error: {
        code: 'NETWORK',
        message: `Falha ao contatar bravohub-analytics: ${detail}`,
      },
    };
  }
}

export const BravohubAnalyticsProvider: Provider[] = [
  {
    provide: BRAVOHUB_ANALYTICS_SERVICE,
    useFactory: (): BravohubAnalyticsService => {
      const baseUrl = config.bravohubAnalyticsBaseUrl;
      const apiKey = config.bravohubSqlGatewayApiKey;
      if (!baseUrl || !apiKey) {
        throw new Error(
          'BRAVOHUB_ANALYTICS_BASE_URL e BRAVOHUB_SQL_GATEWAY_API_KEY são obrigatórios',
        );
      }
      return new BravohubAnalyticsService(baseUrl, apiKey);
    },
  },
];
