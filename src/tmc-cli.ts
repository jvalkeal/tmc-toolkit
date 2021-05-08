import {ENV_TMC_API_TOKEN} from './constants';
import { logError, logInfo } from './logging';
import {execTmc} from './tmc-exec';

export class TmcCli {
  constructor() {}

  public async getVersion(): Promise<string> {
    const version = await execTmc(`tmc`, ['version'], true).then(response => {
      return response.stdout;
    });
    return version;
    // return new Promise((resolve, reject) => {
    //   resolve('');
    // });
  }

  public async login(token: string): Promise<void> {
    await execTmc('tmc', ['login', '--name githubactions', '--no-configure'], false, {
      [ENV_TMC_API_TOKEN]: token
    })
    .then(response => {
      logInfo(`Login Response: ${response}`)
    })
    .catch(reason => {
      logError(`Login Error: ${reason}`);
    })
    ;
  }

  public async configure(
    managementClusterName: string,
    provisionerName: string
  ): Promise<void> {
    await execTmc(
      'tmc',
      [
        'configure',
        '--management-cluster-name',
        managementClusterName,
        '--provisioner-name',
        provisionerName
      ],
      true
    )
    .then(response => {
      logInfo(`Configure Response: ${response}`)
    })
    .catch(reason => {
      logError(`Configure Error: ${reason}`);
    })
    ;
  }
}
