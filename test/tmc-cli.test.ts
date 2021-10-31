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

  it('kubeconfig', async () => {
    const cli = new TmcCli();
    let count = 0;
    jest.spyOn(cli, 'getKubeConfigYml').mockImplementation(() => {
      // console.log(`T00 ${count}`);
      if (count++ < 3) {
        // console.log(`T01 ${count}`);
        throw new Error();
      }
      // console.log(`T02 ${count}`);
      return Promise.resolve('xxx');
    });
    // console.log('T1');
    const met = await cli.getKubeConfig('');
    // console.log('T2');
    expect(met).toBe('xxx');
    // console.log('T3');
  }, 20000);
});
