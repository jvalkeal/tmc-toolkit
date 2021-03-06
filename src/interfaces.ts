/**
 * Options for action to ease passing those around.
 */
export interface ActionOptions {
  org: string;
  token: string;
  version: string;
  api: string;
  contextName: string;
  managementClusterName: string | undefined;
  provisionerName: string | undefined;
}

/**
 * Keep tmc server setting together.
 */
export interface TmcEnv {
  org: string;
  api: string;
}

/**
 * Api response for available tmc client binaries.
 */
export interface SystemBinariesResponse {
  latestVersion: string;
  versions: {
    [version: string]: {
      darwinX64: string;
      linuxX64: string;
      windowsX64: string;
    };
  };
}
