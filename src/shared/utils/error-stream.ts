import { StreamEvent } from 'src/shared/contracts';

export async function* errorStream(
  message: string,
): AsyncGenerator<StreamEvent> {
  yield { type: 'error', message };
  yield { type: 'done' };
}
