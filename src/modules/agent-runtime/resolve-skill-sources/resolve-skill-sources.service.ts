import { Injectable } from '@nestjs/common';

@Injectable()
export class ResolveSkillSourcesService {
  async execute(identifier: string | null): Promise<readonly string[]> {
    const sources: string[] = [];

    if (identifier) {
      sources.push(`/skills/${identifier}/`);
    }

    sources.push('/skills/shared/');
    sources.push('/skills/');

    return sources;
  }
}
