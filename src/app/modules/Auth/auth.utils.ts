// CODE GENERATOR
export const generateCode = async (): Promise<string> => {
  const code = Math.floor(Math.random() * 10000);
  if (code < 1000) {
    return generateCode();
  }
  return code.toString();
};
