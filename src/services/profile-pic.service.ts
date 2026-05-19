import axios from 'axios';

import { api, baseURL, resolveApiAssetUrl } from '@/services/api';

type ProfilePicUploadFile = {
  uri: string;
  name: string;
  type: string;
};

type ProfilePicUploadPayload = {
  agent_id: number;
  profile_pic: ProfilePicUploadFile;
};

type ProfilePicUploadResponse = {
  ok: boolean;
  message: string;
  data?: {
    id: number;
    profile_pic_url?: string | null;
    created_at?: string;
    updated_at?: string;
  };
};

const PROFILE_PIC_SAVE_PATH = '/agent/profile-pic/save';
const PROFILE_PIC_EDIT_PATH = '/agent/profile-pic/edit';

function getProfilePicErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || error.message || fallbackMessage;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

async function uploadProfilePic(path: string, payload: ProfilePicUploadPayload) {
  const formData = new FormData();

  formData.append('agent_id', String(payload.agent_id));
  formData.append(
    'profile_pic',
    {
      uri: payload.profile_pic.uri,
      name: payload.profile_pic.name,
      type: payload.profile_pic.type,
    } as never
  );

  try {
    const { data } = await api.put<ProfilePicUploadResponse>(path, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      message: data.message,
      profileImageUri: resolveApiAssetUrl(data.data?.profile_pic_url ?? null),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('Profile pic upload error:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        url: `${baseURL}${path}`,
      });
    }

    throw new Error(getProfilePicErrorMessage(error, 'Unable to upload profile picture right now.'));
  }
}

export async function saveProfilePic(payload: ProfilePicUploadPayload) {
  return uploadProfilePic(PROFILE_PIC_SAVE_PATH, payload);
}

export async function editProfilePic(payload: ProfilePicUploadPayload) {
  return uploadProfilePic(PROFILE_PIC_EDIT_PATH, payload);
}
