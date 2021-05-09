import * as semver from 'semver';
import {ENV_TMC_API_TOKEN, REQUIRED_MIN_CLI_VERSION} from './constants';
import {execTmc} from './tmc-exec';

export class TmcCli {
  constructor() {}

  public async getVersion(): Promise<string> {
    const versionRaw = await execTmc(`tmc`, ['version'], true).then(
      response => {
        return response.stdout;
      }
    );
    return versionRaw.split(' ').slice(-1)[0];
  }

  public async hasPrerequisites(): Promise<boolean> {
    const versionRaw = await this.getVersion();
    const version = semver.coerce(versionRaw);
    if (version) {
      return semver.satisfies(version, REQUIRED_MIN_CLI_VERSION);
    } else {
      return false;
    }
  }

  public async login(token: string, contextName: string): Promise<string> {
    await execTmc(
      'tmc',
      ['login', '--name', contextName, '--no-configure'],
      false,
      {
        [ENV_TMC_API_TOKEN]: token
      }
    );
    return contextName;
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
    );
  }

  public async deleteContext(name: string): Promise<void> {
    await execTmc('tmc', ['system', 'context', 'delete', name], true);
  }
}
