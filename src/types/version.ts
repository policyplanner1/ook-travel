export type VersionCheckData = {
  updateAvailable: boolean;
  forceUpdate: boolean;
  latestVersion: string;
  latestVersionCode: number;
  updateUrl: string;
  releaseNotes: string;
};

export type VersionCheckResponse = {
  success: boolean;
  message: string;
  data: VersionCheckData;
};
