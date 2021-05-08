import {ENV_TMC_API_TOKEN} from './constants';
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
    await execTmc('tmc', ['--name githubactions', '--no-configure'], true, {
      [ENV_TMC_API_TOKEN]: token
    });
  }

  public async configure(
    managementClusterName: string,
    provisionerName: string
  ): Promise<void> {
    await execTmc(
      'tmc',
      [
        '--management-cluster-name',
        managementClusterName,
        '--provisioner-name',
        provisionerName
      ],
      true
    );
  }
}
