import type { StaticQuoteResponse } from '@/types/quote';

let latestStaticQuoteResult: StaticQuoteResponse | null = null;

export function setLatestStaticQuoteResult(result: StaticQuoteResponse) {
  latestStaticQuoteResult = result;
}

export function getLatestStaticQuoteResult() {
  return latestStaticQuoteResult;
}

export function clearLatestStaticQuoteResult() {
  latestStaticQuoteResult = null;
}
