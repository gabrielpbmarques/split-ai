import { Injectable } from '@nestjs/common';

@Injectable()
export class ResolveSkillSourcesService {
  async execute(identifier: string | null): Promise<readonly string[]> {
    return identifier
      ? [`/skills/${identifier}/`, '/skills/shared/', '/skills/']
      : ['/skills/shared/', '/skills/'];
  }
}
