import * as core from '@actions/core';
import {CliInstall} from './cli-install';
import {
  DEFAULT_TMC_API_VERSION,
  INPUT_API,
  INPUT_ORG,
  INPUT_VERSION
} from './constants';
import {inputNotRequired, inputRequired} from './utils';

/**
 * Main entry point for an action doing real stuff. Separate from action
 * main call point to ease testing inputs.
 */
export async function run() {
  try {
    const org = inputRequired(INPUT_ORG);
    const api = inputNotRequired(INPUT_API) || DEFAULT_TMC_API_VERSION;
    const version = inputNotRequired(INPUT_VERSION) || 'latest';
    const cliInstall = new CliInstall();
    await cliInstall.getCli(org, version, api);
  } catch (error) {
    core.setFailed(error.message);
  }
}
