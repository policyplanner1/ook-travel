import type { QuoteResponse } from '@/types/quote';

let latestQuoteResult: QuoteResponse | null = null;

export function setLatestQuoteResult(result: QuoteResponse) {
  latestQuoteResult = result;
}

export function getLatestQuoteResult() {
  return latestQuoteResult;
}

export function clearLatestQuoteResult() {
  latestQuoteResult = null;
}
