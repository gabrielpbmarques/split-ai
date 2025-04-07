export type AIInstructions = {
  context: string;
  diretrizes: {
    [key: string]: {
      descricao: string;
      detalhes: string;
    };
  };
  objetivo: string;
};
