import * as core from '@actions/core';
import {CliInstall} from './cli-install';
import {
  DEFAULT_CONTEXT_NAME,
  DEFAULT_TMC_API_VERSION,
  INPUT_API,
  INPUT_MANAGEMENT_CLUSTER_NAME,
  INPUT_ORG,
  INPUT_CONTEXT_NAME,
  INPUT_PROVISIONER_NAME,
  INPUT_TOKEN,
  INPUT_VERSION
} from './constants';
import {logInfo, logWarn} from './logging';
import {inputNotRequired, inputRequired} from './utils';
import * as stateHelper from './state-helper';
import {TmcLogin} from './login';
import {TmcCli} from './tmc-cli';
import {ActionOptions} from './interfaces';

/**
 * Main entry point for an action doing real stuff. Separate from action
 * main call point to ease testing inputs.
 */
export async function run() {
  try {
    const org = inputRequired(INPUT_ORG);
    const api = inputNotRequired(INPUT_API) || DEFAULT_TMC_API_VERSION;
    const version = inputNotRequired(INPUT_VERSION) || 'latest';
    const token = inputRequired(INPUT_TOKEN);
    const contextName =
      inputNotRequired(INPUT_CONTEXT_NAME) || DEFAULT_CONTEXT_NAME;
    const managementClusterName = inputRequired(INPUT_MANAGEMENT_CLUSTER_NAME);
    const provisionerName = inputRequired(INPUT_PROVISIONER_NAME);

    const actionOptions: ActionOptions = {
      org,
      token,
      api,
      version,
      contextName,
      managementClusterName,
      provisionerName
    };

    // Install cli
    const cliInstall = new CliInstall();
    await cliInstall.getCli(actionOptions);

    // login and context setup
    const tmcLogin = new TmcLogin();
    const contextNameCreated = await tmcLogin.login(
      token,
      managementClusterName,
      provisionerName,
      contextName
    );
    stateHelper.setCurrentContextName(contextNameCreated);
  } catch (error) {
    core.setFailed(`${(error as any)?.message ?? error}`);
  }
}

export async function cleanup() {
  if (stateHelper.currentContextName.length > 0) {
    logInfo('Removing context');
    const tmcCli = new TmcCli();
    try {
      await tmcCli.deleteContext(stateHelper.currentContextName);
    } catch (error) {
      logWarn(`Unable to delete context ${(error as any)?.message ?? error}`);
    }
  }
}
