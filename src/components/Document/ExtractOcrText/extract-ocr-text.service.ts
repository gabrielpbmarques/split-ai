import { Injectable } from '@nestjs/common';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import { DocumentData } from 'src/models/Worker.model';

@Injectable()
export class ExtractOcrTextService {
  constructor(private client: ImageAnnotatorClient) {}

  async execute(buffers: Buffer[]): Promise<DocumentData> {
    const requests: any = buffers.map((buffer) => ({
      image: { content: buffer.toString('base64') },
      features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
    }));

    const [response] = await this.client.batchAnnotateImages({ requests });

    const texts = response.responses.map((res) => {
      const [annotation] = res.textAnnotations || [];
      return annotation ? annotation.description.trim() : '';
    });

    const fullText = texts.join(' ');
    return this.extractDocumentData(fullText);
  }

  private extractDocumentData(text: string): DocumentData {
    const result: DocumentData = {
      documentNumber: '',
      cpf: '',
      name: '',
      birthDate: '',
      issueDate: '',
      faceMatchScore: 0,
      errors: [],
    };

    // Extrair número do RG (padrões comuns)
    // Formato: XX.XXX.XXX-X ou XXXXXXXX
    const rgPatterns = [
      /RG[:\s]*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{1}|\d{7,9})/i,
      /REGISTRO[\s:]*GERAL[\s:]*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{1}|\d{7,9})/i,
      /IDENTIDADE[\s:]*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{1}|\d{7,9})/i,
      /CARTEIRA[\s:]*IDENTIDADE[\s:]*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}[-\s]?\d{1}|\d{7,9})/i,
      /(\d{1,2}[.]\d{3}[.]\d{3}[-]\d{1})/, // Formato XX.XXX.XXX-X
    ];

    for (const pattern of rgPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        result.documentNumber = match[1].replace(/[^\d]/g, '');
        break;
      }
    }

    // Extrair CPF
    const cpfPattern =
      /CPF[:\s]*([\d]{3}[\s\.]{1}[\d]{3}[\s\.]{1}[\d]{3}[\s\.]{1}[\d]{2})/i;
    const cpfMatch = text.match(cpfPattern);
    if (cpfMatch && cpfMatch[1]) {
      result.cpf = cpfMatch[1].replace(/[^\d]/g, '');
    }

    // Extrair nome (geralmente após "NOME:" ou no início do documento)
    const namePattern = /NOME[:\s]*([^\d\n]{5,50})/i;
    const nameMatch = text.match(namePattern);
    if (nameMatch && nameMatch[1]) {
      result.name = nameMatch[1].trim();
    }

    // Extrair data de nascimento
    const birthDatePattern =
      /NASC[A-Z]*[:\s]*(\d{2}[\/\s]\d{2}[\/\s]\d{4}|\d{2}[\/\s]\d{2}[\/\s]\d{2})/i;
    const birthMatch = text.match(birthDatePattern);
    if (birthMatch && birthMatch[1]) {
      result.birthDate = birthMatch[1];
    }

    // Extrair data de emissão
    const issueDatePattern =
      /EMISS[A-Z]*[:\s]*(\d{2}[\/\s]\d{2}[\/\s]\d{4}|\d{2}[\/\s]\d{2}[\/\s]\d{2})/i;
    const issueMatch = text.match(issueDatePattern);
    if (issueMatch && issueMatch[1]) {
      result.issueDate = issueMatch[1];
    }

    return result;
  }
}
