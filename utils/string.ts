export function isLatinChar(char: string): boolean {
  return /[a-zA-Z]/.test(char);
}
