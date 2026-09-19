export function isLatinChar(char: string): boolean {
  return /[a-zA-Z]/.test(char);
}

/** "wang.ming@gmail.com" → "wa***@gmail.com" */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.split("@");
  if (!domain) return email;
  return `${localPart.slice(0, 2)}***@${domain}`;
}
