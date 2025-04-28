export const getUrlBuffer = async (url: string): Promise<Buffer> => {
  try {
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    throw new Error(`Failed to fetch URL: ${error.message}`);
  }
};
