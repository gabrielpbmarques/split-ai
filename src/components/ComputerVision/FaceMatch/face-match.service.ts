import { Injectable } from '@nestjs/common';
import { config } from 'src/config';
import AWS = require('aws-sdk');

/**
 * Interface para resultado de comparação facial
 */
export interface FaceMatchResult {
  isMatch: boolean;
  faceMatchScore: number;
  details?: AWS.Rekognition.CompareFacesResponse;
  documentHasFace: boolean;
  selfieHasFace: boolean;
  errors?: string[];
}

/**
 * Interface para opções de comparação facial
 */
export interface FaceMatchOptions {
  similarityThreshold?: number;
  attributes?: string[];
}

/**
 * Serviço responsável por comparar faces usando AWS Rekognition
 */
@Injectable()
export class FaceMatchService {
  private rekognition: any;

  private readonly DEFAULT_SIMILARITY_THRESHOLD = 80;

  constructor() {
    this.rekognition = new AWS.Rekognition({
      region: 'us-east-1',
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
      const similarityThreshold =
        options?.similarityThreshold || this.DEFAULT_SIMILARITY_THRESHOLD;

      const params: AWS.Rekognition.CompareFacesRequest = {
        SourceImage: {
          Bytes: sourceImageBuffer,
        },
        TargetImage: {
          Bytes: targetImageBuffer,
        },
        SimilarityThreshold: similarityThreshold,
        ...(options?.attributes && { Attributes: options.attributes }),
      };

      const response = await this.rekognition.compareFaces(params).promise();

      const faceMatches = response.FaceMatches || [];
      const isMatch = faceMatches.length > 0;

      const similarity = isMatch
        ? Math.max(...faceMatches.map((match) => match.Similarity || 0))
        : 0;

      return {
        isMatch,
        faceMatchScore: similarity,
        documentHasFace: await this.hasValidFace(sourceImageBuffer),
        selfieHasFace: await this.hasValidFace(targetImageBuffer),
        errors: [],
        details: response,
      };
    } catch (error) {
      return {
        isMatch: false,
        faceMatchScore: 0,
        documentHasFace: false,
        selfieHasFace: false,
        errors: [error.message || 'Erro ao comparar faces'],
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
    const params: AWS.Rekognition.DetectFacesRequest = {
      Image: {
        Bytes: imageBuffer,
      },
      Attributes: ['ALL'],
    };

    return this.rekognition.detectFaces(params).promise();
  }

  /**
   * Verifica se uma imagem contém uma face válida para comparação
   * @param imageBuffer Buffer da imagem
   * @returns True se a imagem contém uma face válida
   */
  async hasValidFace(imageBuffer: Buffer): Promise<boolean> {
    try {
      const result = await this.detectFaces(imageBuffer);

      return (result.FaceDetails || []).length > 0;
    } catch (error) {
      return false;
    }
  }
}
