import * as fs from 'fs';
import * as core from '@actions/core';
import {CliInstall} from './cli-install';
import {
  DEFAULT_TMC_API_VERSION,
  INPUT_API,
  INPUT_MANAGEMENT_CLUSTER_NAME,
  INPUT_ORG,
  INPUT_CONTEXT_NAME,
  INPUT_PROVISIONER_NAME,
  INPUT_TOKEN,
  INPUT_VERSION
} from './constants';
import {logInfo} from './logging';
import {inputNotRequired, inputRequired} from './utils';
import * as stateHelper from './state-helper';
import {execTmc} from './tmc-exec';
import {TmcLogin} from './login';
import { TmcCli } from './tmc-cli';

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
    const contextName = inputNotRequired(INPUT_CONTEXT_NAME);
    const managementClusterName = inputNotRequired(INPUT_MANAGEMENT_CLUSTER_NAME);
    const provisionerName = inputNotRequired(INPUT_PROVISIONER_NAME);

    const cliInstall = new CliInstall();
    await cliInstall.getCli(org, version, api);

    const tmcLogin = new TmcLogin();
    const contextNameCreated = await tmcLogin.login(token, managementClusterName, provisionerName, contextName);
    stateHelper.setCurrentContextName(contextNameCreated);
  } catch (error) {
    core.setFailed(error.message);
  }
}

export async function cleanup() {
  logInfo('doing clean');
  if (stateHelper.currentContextName.length > 0) {
    core.startGroup(`Removing context`);
    const tmcCli = new TmcCli();
    await tmcCli.deleteContext(stateHelper.currentContextName);
    core.endGroup();
  }
}
