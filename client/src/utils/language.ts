export type SupportedLanguage = "en" | "te" | "tinglish";

const TINGLISH_PATTERNS = [
  /\bante\b/i,
  /\benti\b/i,
  /\bcheyyava\b/i,
  /\bcheyyara\b/i,
  /\bcheyali\b/i,
  /\bcheyyandi\b/i,
  /\bundi\b/i,
  /\bledu\b/i,
  /\bnaaku\b/i,
  /\bnaku\b/i,
  /\bela\b/i,
  /\beppudu\b/i,
  /\bkuda\b/i,
  /\bchala\b/i,
  /\bmeeru\b/i,
  /\bgurinchi\b/i,
  /\bchesi\b/i,
  /\bkaavali\b/i,
  /\bavuthundi\b/i,
  /\bavasaram\b/i,
  /\bkadupu\b/i,
  /\bnoppi\b/i,
  /\braktasravam\b/i,
  /\bivvandi\b/i,
  /\bcheppandi\b/i,
  /\btelusukovali\b/i,
  /\bpillalu\b/i,
  /\bgarbham\b/i,
  /\btwaraga\b/i,
  /\bayindi\b/i,
  /\bga\b/i,
  /\bcheppava\b/i,
  /\bkani\b/i,
  /\bkaani\b/i,
  /\bayyo\b/i,
  /\bchesukovale\b/i,
  /\bcheppandi\b/i,
];

export function detectScript(s: string): SupportedLanguage {
  if (/[\u0C00-\u0C7F]/.test(s)) return "te";
  if (TINGLISH_PATTERNS.some((pattern) => pattern.test(s))) return "tinglish";
  return "en";
}
