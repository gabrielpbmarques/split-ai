import { Injectable } from '@nestjs/common';
import { AIInstructions } from 'src/types/AIInstructions';

@Injectable()
export class NormalizePromptInstructionsService {
  constructor() {}

  execute(instructions: AIInstructions): string {
    let text = `${instructions.context}\n\nDiretrizes:\n\n`;

    for (const key in instructions.diretrizes) {
      const diretriz = instructions.diretrizes[key];
      text += `- ${diretriz.descricao}: ${diretriz.detalhes}\n\n`;
    }

    text += `Objetivo:\n\n${instructions.objetivo}`;

    return text;
  }
}
