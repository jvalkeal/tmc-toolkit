import * as exec from '@actions/exec';
import {ExecOptions} from '@actions/exec';

export interface ExecResult {
  success: boolean;
  stdout: string;
  stderr: string;
}

export const execTmc = async (
  command: string,
  args: string[] = [],
  silent?: boolean
): Promise<ExecResult> => {
  let stdout: string = '';
  let stderr: string = '';

  const options: ExecOptions = {
    silent: silent,
    ignoreReturnCode: true
  };
  options.listeners = {
    stdout: (data: Buffer) => {
      stdout += data.toString();
    },
    stderr: (data: Buffer) => {
      stderr += data.toString();
    }
  };

  const returnCode: number = await exec.exec(command, args, options);

  return {
    success: returnCode === 0,
    stdout: stdout.trim(),
    stderr: stderr.trim()
  };
};
