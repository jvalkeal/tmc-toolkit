import {endGroup, startGroup} from './logging';

export class TmcLogin {
  constructor() {}

  public async login(): Promise<void> {
    startGroup('TMC login');
    endGroup();
  }
}
