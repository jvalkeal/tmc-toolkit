import {TmcCli} from '../src/tmc-cli';
import * as tmcExec from '../src/tmc-exec';

describe('tmc-cli tests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('getVersion parses correctly', async () => {
    const cli = new TmcCli();
    jest.spyOn(tmcExec, 'execTmc').mockImplementation(() => {
      const result: tmcExec.ExecResult = {
        success: true,
        stderr: '',
        stdout: 'i tmc version: 0.2.1-7e9c62fc'
      };
      return Promise.resolve(result);
    });
    const version = await cli.getVersion();
    expect(version).toBe('0.2.1-7e9c62fc');
  });

  it('hasPrerequisites met with good version', async () => {
    const cli = new TmcCli();
    jest.spyOn(cli, 'getVersion').mockImplementation(() => {
      return Promise.resolve('0.2.1-7e9c62fc');
    });
    const met = await cli.hasPrerequisites();
    expect(met).toBe(true);
  });

  it('hasPrerequisites met with bad version', async () => {
    const cli = new TmcCli();
    jest.spyOn(cli, 'getVersion').mockImplementation(() => {
      return Promise.resolve('0.2.0-7e9c62fc');
    });
    const met = await cli.hasPrerequisites();
    expect(met).toBe(false);
  });
});
