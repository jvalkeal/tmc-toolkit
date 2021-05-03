import * as fs from 'fs';
import * as core from '@actions/core';
import {CliInstall} from './cli-install';
import {
  DEFAULT_TMC_API_VERSION,
  INPUT_API,
  INPUT_ORG,
  INPUT_TOKEN,
  INPUT_VERSION
} from './constants';
import {logInfo} from './logging';
import {inputNotRequired, inputRequired} from './utils';
import * as stateHelper from './state-helper';
import {execTmc} from './tmc-exec';

/**
 * Main entry point for an action doing real stuff. Separate from action
 * main call point to ease testing inputs.
 */
export async function run() {
  try {
    const org = inputRequired(INPUT_ORG);
    const api = inputNotRequired(INPUT_API) || DEFAULT_TMC_API_VERSION;
    const version = inputNotRequired(INPUT_VERSION) || 'latest';
    const token = inputNotRequired(INPUT_TOKEN);
    const cliInstall = new CliInstall();
    await cliInstall.getCli(org, version, api);
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function cleanup() {
  logInfo('doing clean');
  const res = await execTmc(
    `tmc`,
    ['system', 'context', 'list'],
    true
  ).then(res => {
    return res.stdout;
  });
  logInfo(`result: ${res}`);
  // if (stateHelper.tmpDir.length > 0) {
  //   core.startGroup(`Removing temp folder ${stateHelper.tmpDir}`);
  //   fs.rmdirSync(stateHelper.tmpDir, {recursive: true});
  //   core.endGroup();
  // }
}
