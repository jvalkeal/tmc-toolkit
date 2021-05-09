// Current base locations for tmc cli binaries
export const DEFAULT_CLI_SERVER_BASE =
  'https://tmc-cli.s3-us-west-2.amazonaws.com/tmc';

// Default tmc api version this action uses,
// NOTE: change text in action.yml and docs if/when you change this
export const DEFAULT_TMC_API_VERSION = 'v1alpha1';

// tmc context name
export const DEFAULT_CONTEXT_NAME = 'ghactions';

// env variable names
export const ENV_TMC_API_TOKEN = 'TMC_API_TOKEN';

// input constants
export const INPUT_ORG = 'org';
export const INPUT_VERSION = 'version';
export const INPUT_API = 'api';
export const INPUT_TOKEN = 'token';
export const INPUT_CONTEXT_NAME = 'context-name';
export const INPUT_MANAGEMENT_CLUSTER_NAME = 'management-cluster-name';
export const INPUT_PROVISIONER_NAME = 'provisioner-name';
