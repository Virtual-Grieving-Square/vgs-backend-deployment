export const verificationCodeGenerator = (n: number) => {
  const characters =
    "01234567890"
  let randomString = ""

  for (let i = 0; i < n; i++) {
    let index = Math.floor(Math.random() * characters.length)
    randomString += characters.charAt(index)
  }
  return randomString;
};