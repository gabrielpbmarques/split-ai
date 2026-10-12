import { Injectable } from '@nestjs/common';

import { AVAILABLE_TOOLS } from 'src/modules/retrieval/tools-catalog';
import type { AvailableTool } from 'src/shared/contracts';

@Injectable()
export class ListAvailableToolsService {
  execute(): AvailableTool[] {
    return [...AVAILABLE_TOOLS];
  }
}
