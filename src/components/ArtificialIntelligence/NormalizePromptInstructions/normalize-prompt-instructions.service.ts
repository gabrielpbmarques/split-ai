import { Injectable } from '@nestjs/common';
import { AIInstructions } from 'src/types';

@Injectable()
export class NormalizePromptInstructionsService {
  constructor() {}

  execute(instructions: AIInstructions): string {
    let text = `${instructions.context}\n\nDiretrizes:\n\n`;

    const list = instructions.diretrizes || [];
    for (const item of list) {
      text += `- ${item}\n\n`;
    }

    text += `Objetivo:\n\n${instructions.objetivo}`;

    return text;
  }
}
