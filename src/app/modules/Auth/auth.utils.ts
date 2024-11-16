// CODE GENERATOR
export const generateCode = (): number => {
  const code = Math.floor(Math.random() * 10000);
  if (code < 1000) {
    return generateCode();
  }
  return code;
};
