/**
 * Utilitários para trabalhar com documentos do Mongoose/MongoDB
 */

/**
 * Remove campos imutáveis do MongoDB de um objeto (recursivamente)
 * @param obj Objeto a ser limpo
 * @returns Objeto sem campos imutáveis do MongoDB
 */
export function removeMongooseFields<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Se for um array, processa cada item
  if (Array.isArray(obj)) {
    return obj.map((item) => removeMongooseFields(item)) as unknown as T;
  }

  // Se for uma data, retorna sem modificar
  if (obj instanceof Date) {
    return obj;
  }

  // Remove campos imutáveis
  const { _id, __v, createdAt, updatedAt, ...cleanObj } = obj as any;

  // Processa recursivamente objetos aninhados
  Object.keys(cleanObj).forEach((key) => {
    if (cleanObj[key] && typeof cleanObj[key] === 'object') {
      cleanObj[key] = removeMongooseFields(cleanObj[key]);
    }
  });

  return cleanObj as T;
}

/**
 * Tipo utilitário para remover campos imutáveis do MongoDB
 */
export type MongooseDocument = {
  _id: any;
  __v: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Tipo utilitário para remover campos imutáveis de qualquer objeto
 */
export type WithoutMongooseFields<T> = Omit<T, keyof MongooseDocument>;
