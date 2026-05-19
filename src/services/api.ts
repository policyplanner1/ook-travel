import axios from 'axios';

const API_BASE_URLS = {
  local: 'http://192.168.1.198:1200',
  prod: 'https://policyplanner.com/travel-insurance',
} as const;

const CASHFREE_CHECKOUT_URLS = {
  local: 'https://sandbox.cashfree.com/pg/view/sessions/checkout',
  prod: 'https://api.cashfree.com/pg/view/sessions/checkout',
} as const;

const apiMode = process.env.EXPO_PUBLIC_API_MODE === 'prod' ? 'prod' : 'local';
const cashfreeMode = process.env.EXPO_PUBLIC_CASHFREE_MODE === 'prod' ? 'prod' : 'local';

export const baseURL = API_BASE_URLS[apiMode];
export const cashfreeCheckoutURL = CASHFREE_CHECKOUT_URLS[cashfreeMode];

export function resolveApiAssetUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (!url.startsWith('http://localhost:1200')) {
    return url;
  }

  return url.replace('http://localhost:1200', baseURL);
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 15000,
});
