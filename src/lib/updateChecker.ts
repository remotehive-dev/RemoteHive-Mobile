import Constants from 'expo-constants';
import * as Application from 'expo-application';

const VERSION_URL = 'https://dl.remotehive.in/version.json';

interface VersionInfo {
  version: string;
  versionCode: number;
  apkUrl: string;
  releaseNotes?: string;
}

export async function checkForUpdate(): Promise<VersionInfo | null> {
  try {
    const res = await fetch(VERSION_URL, { cache: 'no-cache' });
    if (!res.ok) return null;
    const remote: VersionInfo = await res.json();

    const currentVersionCode = Application.nativeBuildVersion
      ? parseInt(Application.nativeBuildVersion, 10)
      : 1;

    if (remote.versionCode > currentVersionCode) {
      return remote;
    }
    return null;
  } catch {
    return null;
  }
}
