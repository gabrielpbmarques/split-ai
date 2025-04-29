import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import AWS = require('aws-sdk');

/**
 * Interface para resultado de comparação facial
 */
export interface FaceMatchResult {
  // Indica se as faces correspondem
  isMatch: boolean;
  // Pontuação de similaridade (0-100)
  similarity: number;
  // Detalhes adicionais da comparação
  details?: AWS.Rekognition.CompareFacesResponse;
  // Mensagem de erro, se houver
  error?: string;
}

/**
 * Interface para opções de comparação facial
 */
export interface FaceMatchOptions {
  // Limite mínimo de similaridade para considerar um match (0-100)
  similarityThreshold?: number;
  // Atributos faciais a serem comparados
  attributes?: string[];
}

/**
 * Serviço responsável por comparar faces usando AWS Rekognition
 */
@Injectable()
export class FaceMatchService {
  // Cliente Rekognition da AWS
  private rekognition: any;

  // Limite padrão de similaridade
  private readonly DEFAULT_SIMILARITY_THRESHOLD = 80;

  constructor() {
    // Inicializa o cliente Rekognition com as configurações da AWS
    this.rekognition = new AWS.Rekognition({
      region: config.awsRegion,
      credentials: {
        accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey,
      },
    });
  }

  /**
   * Compara duas imagens para verificar se contêm a mesma face
   * @param sourceImageBuffer Buffer da imagem fonte
   * @param targetImageBuffer Buffer da imagem alvo
   * @param options Opções de comparação
   * @returns Resultado da comparação facial
   */
  async compareFaces(
    sourceImageBuffer: Buffer,
    targetImageBuffer: Buffer,
    options?: FaceMatchOptions,
  ): Promise<FaceMatchResult> {
    try {
      // Define o limite de similaridade (padrão ou personalizado)
      const similarityThreshold =
        options?.similarityThreshold || this.DEFAULT_SIMILARITY_THRESHOLD;

      // Prepara os parâmetros para a API do Rekognition
      const params: AWS.Rekognition.CompareFacesRequest = {
        SourceImage: {
          Bytes: sourceImageBuffer,
        },
        TargetImage: {
          Bytes: targetImageBuffer,
        },
        SimilarityThreshold: similarityThreshold,
        // Adiciona atributos se fornecidos nas opções
        ...(options?.attributes && { Attributes: options.attributes }),
      };

      // Chama a API do Rekognition para comparar as faces
      const response = await this.rekognition.compareFaces(params).promise();

      // Verifica se foram encontradas correspondências
      const faceMatches = response.FaceMatches || [];
      const isMatch = faceMatches.length > 0;

      // Calcula a similaridade (a maior pontuação se houver múltiplas correspondências)
      const similarity = isMatch
        ? Math.max(...faceMatches.map((match) => match.Similarity || 0))
        : 0;

      return {
        isMatch,
        similarity,
        details: response,
      };
    } catch (error) {
      // Retorna resultado com erro em caso de falha
      return {
        isMatch: false,
        similarity: 0,
        error: error.message || 'Erro ao comparar faces',
      };
    }
  }

  /**
   * Detecta faces em uma imagem
   * @param imageBuffer Buffer da imagem
   * @returns Informações sobre as faces detectadas
   */
  async detectFaces(
    imageBuffer: Buffer,
  ): Promise<AWS.Rekognition.DetectFacesResponse> {
    // Prepara os parâmetros para a API do Rekognition
    const params: AWS.Rekognition.DetectFacesRequest = {
      Image: {
        Bytes: imageBuffer,
      },
      // Solicita todos os atributos faciais disponíveis
      Attributes: ['ALL'],
    };

    // Chama a API do Rekognition para detectar faces
    return this.rekognition.detectFaces(params).promise();
  }

  /**
   * Verifica se uma imagem contém uma face válida para comparação
   * @param imageBuffer Buffer da imagem
   * @returns True se a imagem contém uma face válida
   */
  async hasValidFace(imageBuffer: Buffer): Promise<boolean> {
    try {
      // Detecta faces na imagem
      const result = await this.detectFaces(imageBuffer);

      // Verifica se pelo menos uma face foi detectada
      return (result.FaceDetails || []).length > 0;
    } catch (error) {
      return false;
    }
  }
}
