/** Normalizon numrat shqiptarë në formatin E.164. */
export function normalizoTelefonin(input: string): string | null {
  const pastruar = input.trim().replace(/[\s().-]/g, '');

  if (/^\+3556\d{8}$/.test(pastruar)) return pastruar;
  if (/^003556\d{8}$/.test(pastruar)) return `+${pastruar.slice(2)}`;
  if (/^06\d{8}$/.test(pastruar)) return `+355${pastruar.slice(1)}`;

  return null;
}
