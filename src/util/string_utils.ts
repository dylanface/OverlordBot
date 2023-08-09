// Generate a random alphanumeric string of a given length
// The string will be a minimum of 4 and a maximum of 32 characters long
// Available characters are numbers 1-10 and capital letters A-Z
export const generateAlphaNumericString = (length: number) => {
  if (length < 4) length = 4;
  if (length > 32) length = 32;

  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = length; i > 0; --i) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};
