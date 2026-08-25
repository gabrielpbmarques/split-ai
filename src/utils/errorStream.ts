import { StreamEvent } from 'src/types';

export async function* errorStream(
  message: string,
): AsyncGenerator<StreamEvent> {
  yield { type: 'error', message };
  yield { type: 'done' };
}
