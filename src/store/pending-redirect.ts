import type { Href } from 'expo-router';

let pendingRedirect: Href | null = null;

export function setPendingRedirect(path: Href) {
  pendingRedirect = path;
}

export function consumePendingRedirect(): Href | null {
  const path = pendingRedirect;
  pendingRedirect = null;
  return path;
}
