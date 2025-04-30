/**
 * Utilitários para trabalhar com documentos do Mongoose/MongoDB
 */

/**
 * Tipo utilitário para remover campos imutáveis do MongoDB
 */
export type MongooseDocument = {
  _id: any;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
};

import { ObjectId, Binary, Long, Decimal128, BSONType } from 'bson';

type AnyObject = Record<string, any>;

function isMongoSpecialType(value: any): boolean {
  return (
    value instanceof ObjectId ||
    value instanceof Date ||
    value instanceof Binary ||
    value instanceof Long ||
    value instanceof Decimal128 ||
    (value && typeof value === 'object' && typeof value._bsontype === 'string')
  );
}

/**
 * Transforma um objeto aninhado em um objeto plano com chaves usando delimitadores
 * Preserva tipos especiais do MongoDB como ObjectId
 * Inclui proteção contra referências circulares e limita a profundidade da recursão
 */
export function flatten(
  obj: AnyObject,
  prefix = '',
  result: AnyObject = {},
  visited: Set<any> = new Set(),
  depth = 0,
): AnyObject {
  // Casos base: objeto nulo, indefinido ou já visitado
  if (obj === null || obj === undefined) return result;

  // Proteção contra referências circulares
  if (visited.has(obj)) return result;

  // Limita a profundidade da recursão para evitar estouro de pilha
  // 100 níveis é um valor seguro que permite estruturas complexas legítimas
  // mas ainda protege contra recursão infinita
  if (depth > 100) return result;

  // Adiciona o objeto atual ao conjunto de objetos visitados
  visited.add(obj);

  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;

    const value = obj[key];
    const path = prefix ? `${prefix}.${key}` : key;

    // Verifica se é um valor especial do MongoDB ou null/undefined
    if (value === null || value === undefined) {
      result[path] = value;
    }
    // Verifica se é um tipo especial do MongoDB
    else if (isMongoSpecialType(value)) {
      result[path] = value;
    }
    // Verifica se é um objeto que deve ser achatado
    else if (
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0
    ) {
      // Processa recursivamente, passando o conjunto de objetos visitados e incrementando a profundidade
      flatten(value, path, result, visited, depth + 1);
    }
    // Arrays e valores primitivos são copiados diretamente
    else {
      result[path] = value;
    }
  }

  return result;
}

/**
 * Tipo utilitário para remover campos imutáveis de qualquer objeto
 */
export type WithoutMongooseFields<T> = Omit<T, keyof MongooseDocument>;
