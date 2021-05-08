import {endGroup, startGroup} from './logging';
import {TmcCli} from './tmc-cli';

export class TmcLogin {
  private tmcCli: TmcCli;

  constructor() {
    this.tmcCli = new TmcCli();
  }

  public async login(
    token: string,
    managementClusterName: string,
    provisionerName: string,
    contextName: string
  ): Promise<string> {
    startGroup('TMC login');
    const contextNameCreated = await this.tmcCli.login(token, contextName);
    await this.tmcCli.configure(managementClusterName, provisionerName);
    endGroup();
    return contextNameCreated;
  }
}
