import axios from 'axios';
import { CFEnvironment } from 'cashfree-pg-api-contract';

const API_BASE_URLS = {
  // local: 'http://192.168.1.208:1200',
  local: 'http://192.168.1.183:5000/api/app',
  prod: 'https://dev.ooktravel.in/api/app',
} as const;

const apiMode = process.env.EXPO_PUBLIC_API_MODE === 'prod' ? 'prod' : 'local';
const cashfreeMode = process.env.EXPO_PUBLIC_CASHFREE_MODE === 'prod' ? 'prod' : 'local';

export const baseURL = API_BASE_URLS[apiMode];
export const cashfreeEnvironment = cashfreeMode === 'prod' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

// Uploaded files (e.g. /uploads/profiles/xxx.jpg) are served from the server's
// root, not under the /api/app prefix, so assets must resolve against the origin.
const assetBaseURL = baseURL.match(/^[a-z]+:\/\/[^/]+/i)?.[0] ?? baseURL;

export function resolveApiAssetUrl(url?: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith('/')) {
    return `${assetBaseURL}${url}`;
  }

  if (url.startsWith('http://192.168.1.244:5000')) {
    return url.replace('http://192.168.1.244:5000', assetBaseURL);
  }

  return url;
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 15000,
});
