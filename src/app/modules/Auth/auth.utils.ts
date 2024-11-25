// CODE GENERATOR
export const generateCode = (): string => {
  const code = Math.floor(Math.random() * 10000);
  if (code < 1000) {
    return generateCode().toString();
  }
  return code.toString();
};
