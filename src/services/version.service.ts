import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { api } from '@/services/api';
import type { VersionCheckResponse } from '@/types/version';

export function getCurrentVersionCode() {
  return Platform.OS === 'ios'
    ? Number(Constants.expoConfig?.ios?.buildNumber) || 0
    : Number(Constants.expoConfig?.android?.versionCode) || 0;
}

export async function checkAppVersion() {
  const { data } = await api.get<VersionCheckResponse>('/version/check', {
    params: {
      platform: Platform.OS,
      versionCode: getCurrentVersionCode(),
    },
  });

  return data.data;
}
