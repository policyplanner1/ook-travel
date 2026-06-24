import type { StoredQuoteResult } from '@/types/quote';

let storedQuote: StoredQuoteResult | null = null;

export function setLatestQuoteResult(result: StoredQuoteResult) {
  storedQuote = result;
}

export function getLatestQuoteResult() {
  return storedQuote;
}

export function clearLatestQuoteResult() {
  storedQuote = null;
}
