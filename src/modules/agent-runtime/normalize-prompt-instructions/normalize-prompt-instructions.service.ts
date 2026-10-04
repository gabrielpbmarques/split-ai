import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from 'langchain';

import { AIInstructions } from 'src/shared/contracts';

@Injectable()
export class NormalizePromptInstructionsService {
  constructor() {}

  execute(
    instructions: AIInstructions,
    tools: DynamicStructuredTool[],
    promptVariables?: Record<string, any>,
  ): string {
    const summary =
      'OBJ = Objetivo | CTX = Contexto | DIR = Diretrizes | VRS=variáveis | CTX=contexto | MEM=memória curta | TOOLS=ferramentas | OUT=saída';
    const formattedVariables = Object.entries(promptVariables || {})
      .map(([key, value]) => `${key}: ${value}\n`)
      .join('');

    const text = `
    ${summary}\n\n
    OBJ: ${instructions.objetivo}\n
    CTX: ${instructions.context}\n
    VRS:\n${formattedVariables}\n
    DIR:\n${instructions.diretrizes.flatMap((item) => `- ${item}\n`)}\n
    TOOLS:\n${tools.flatMap((item) => `Name: ${item.name}\nDescription: ${item.description}\n`)}\n
    `;

    return text;
  }
}
