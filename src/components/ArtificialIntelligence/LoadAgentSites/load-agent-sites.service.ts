import { SitemapLoader } from '@langchain/community/document_loaders/web/sitemap';
import { Document } from '@langchain/core/documents';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { Injectable, Inject } from '@nestjs/common';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { VERTEX_AI_EMBEDDINGS } from 'src/infrastructure/providers/vertex-ai.provider';

@Injectable()
export class LoadAgentSitesService {
  constructor(
    @Inject(VERTEX_AI_EMBEDDINGS)
    private readonly embeddings: VertexAIEmbeddings,
  ) {}

  async execute(question: string, sites: string[]): Promise<Document[]> {
    if (!sites?.length) return [];

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1200,
      chunkOverlap: 150,
    });

    const allDocs: Document[] = [];

    for (const site of sites) {
      try {
        const sitemapUrl = site.endsWith('sitemap.xml')
          ? site
          : `${site.replace(/\/$/, '')}/sitemap.xml`;
        const loader = new SitemapLoader(sitemapUrl);

        const rawDocs = await loader.load();
        const docs = await splitter.splitDocuments(rawDocs);

        allDocs.push(...docs);
      } catch (err) {
        continue;
      }
    }

    if (!allDocs.length) return [];

    const memStore = await MemoryVectorStore.fromDocuments(
      allDocs,
      this.embeddings,
    );

    const k = 20;
    const relevant = await memStore.similaritySearch(question, k);
    return relevant;
  }
}
