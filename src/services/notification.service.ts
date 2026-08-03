import axios from 'axios';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { api } from '@/services/api';
import type { AppNotification, NotificationListResponse, UnreadCountResponse } from '@/types/notification';

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallbackMessage;
  }
  return error instanceof Error ? error.message : fallbackMessage;
}

// expo-notifications' PermissionResponse type doesn't resolve cleanly through this project's
// node_modules hoisting, so read `.status` defensively rather than destructuring it directly.
function getPermissionStatus(response: unknown): string {
  return (response as { status?: string })?.status ?? 'undetermined';
}

// Resolves the device's Expo push token. Returns null on simulators/emulators or when the
// agent declines the permission prompt — callers should treat this as best-effort, not fatal.
async function getDevicePushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('[push] Skipping push token — not a physical device.');
    return null;
  }

  let finalStatus = getPermissionStatus(await Notifications.getPermissionsAsync());

  if (finalStatus !== 'granted') {
    finalStatus = getPermissionStatus(await Notifications.requestPermissionsAsync());
  }

  if (finalStatus !== 'granted') {
    console.log('[push] Permission not granted.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.log('[push] Missing EAS projectId — cannot fetch Expo push token.');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  return token;
}

export async function registerPushToken(agentId: number): Promise<void> {
  try {
    const expoPushToken = await getDevicePushToken();
    if (!expoPushToken) return;

    await api.post('/notification/register-token', {
      agent_id: agentId,
      expo_push_token: expoPushToken,
      platform: Platform.OS,
      device_info: Device.modelName ?? undefined,
    });
  } catch (error) {
    // Best-effort — never block login/signup over push registration failing.
    console.log('[push] Failed to register push token:', getErrorMessage(error, 'unknown error'));
  }
}

export async function unregisterPushToken(agentId: number): Promise<void> {
  try {
    const status = getPermissionStatus(await Notifications.getPermissionsAsync());
    if (status !== 'granted' || !Device.isDevice) return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    if (!projectId) return;

    const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync({ projectId });
    await api.delete('/notification/register-token', {
      data: { agent_id: agentId, expo_push_token: expoPushToken },
    });
  } catch (error) {
    console.log('[push] Failed to unregister push token:', getErrorMessage(error, 'unknown error'));
  }
}

export async function getAgentNotifications(
  agentId: number,
  page = 1,
  limit = 20
): Promise<NotificationListResponse> {
  const { data } = await api.get<NotificationListResponse>('/notification', {
    params: { agent_id: agentId, page, limit },
  });
  return data;
}

export async function getUnreadNotificationCount(agentId: number): Promise<number> {
  try {
    const { data } = await api.get<UnreadCountResponse>('/notification/unread-count', {
      params: { agent_id: agentId },
    });
    return data.data.count;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(id: number, agentId: number): Promise<void> {
  await api.patch(`/notification/${id}/read`, { agent_id: agentId });
}

export async function markAllNotificationsRead(agentId: number): Promise<void> {
  await api.patch('/notification/mark-all-read', { agent_id: agentId });
}

export type { AppNotification };
