import * as core from '@actions/core';
import {exec} from '@actions/exec';

export async function runCli(cliPath: string, args: string[] | undefined) {
  let res: number = await exec(cliPath, args);
  if (res !== core.ExitCode.Success) {
    throw new Error('CLI exited with exit code ' + res);
  }
}

export function inputRequired(id: string): string {
  return core.getInput(id, {required: true});
}

export function inputNotRequired(id: string): string {
  return core.getInput(id, {required: false});
}
