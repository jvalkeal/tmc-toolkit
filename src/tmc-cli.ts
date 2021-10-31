import * as semver from 'semver';
// import * as retry from 'async-retry';
import retry from 'async-retry';
import {ENV_TMC_API_TOKEN, REQUIRED_MIN_CLI_VERSION} from './constants';
import {execTmc} from './tmc-exec';
import {logInfo} from './logging';

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

  public async getKubeConfig(name: string): Promise<string> {
    return retry(
      async bail => {
        return await this.getKubeConfigYml(name);
      },
      {
        retries: 5,
        factor: 1,
        minTimeout: 1 * 1000,
        // maxRetryTime: 10 * 1000,
        onRetry: (e, a) => {
          logInfo(`onRetry ${e} ${a}`);
        }
      }
    );
  }

  public async getKubeConfigYml(name: string): Promise<string> {
    return await execTmc(
      'tmc',
      ['cluster', 'auth', 'kubeconfig', 'get', name],
      true
    ).then(response => response.stdout);
  }
}
