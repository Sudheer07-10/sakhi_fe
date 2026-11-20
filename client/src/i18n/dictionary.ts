import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';

export type Lang = "en" | "hi" | "te";

// We cast the dict elements to an Record<string, string> if needed, 
// but since typescript parses json as objects, it should work fine.
export const dict = {
  en,
  hi,
  te
};