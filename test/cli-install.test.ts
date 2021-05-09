import * as io from '@actions/io';
import * as fs from 'fs';
import * as path from 'path';
import nock from 'nock';
import {CliInstall} from '../src/cli-install';
import {DEFAULT_TMC_API_VERSION} from '../src/constants';

const toolDir = path.join(__dirname, 'runner', 'tools');
const tempDir = path.join(__dirname, 'runner', 'temp');
const IS_WINDOWS = process.platform === 'win32';

process.env['RUNNER_TOOL_CACHE'] = toolDir;
process.env['RUNNER_TEMP'] = tempDir;

describe('cli installer tests', () => {
  beforeAll(async () => {
    await io.rmRF(toolDir);
    await io.rmRF(tempDir);
  }, 300000);

  afterAll(async () => {
    try {
      await io.rmRF(toolDir);
      await io.rmRF(tempDir);
    } catch {
      console.log('Failed to remove test directories');
    }
  }, 100000);

  beforeEach(() => {
    nock.cleanAll();
  });

  it('Downloads cli with old version given', async () => {
    nock('https://fakeorg.tmc.cloud.vmware.com')
      .persist()
      .get('/v1alpha1/system/binaries')
      .reply(200, {
        latestVersion: '0.2.1-7e9c62fc',
        versions: {
          '0.2.1-7e9c62fc': {
            darwinX64:
              'https://tmc-cli.s3-us-west-2.amazonaws.com/tmc/0.2.1-7e9c62fc/darwin/x64/tmc',
            linuxX64:
              'https://tmc-cli.s3-us-west-2.amazonaws.com/tmc/0.2.1-7e9c62fc/linux/x64/tmc',
            windowsX64:
              'https://tmc-cli.s3-us-west-2.amazonaws.com/tmc/0.2.1-7e9c62fc/windows/x64/tmc.exe'
          }
        }
      });

    const cliInstall = new CliInstall();
    const result1 = await cliInstall.getCli({
      org: 'fakeorg',
      version: '0.2.1-3baebdac',
      api: DEFAULT_TMC_API_VERSION,
      token: '',
      contextName: '',
      managementClusterName: undefined,
      provisionerName: undefined
    });
    expect(result1.cached).toBe(false);
    const cliDir = path.join(toolDir, 'tmc-cli', '0.2.1-3baebdac', 'x64');

    if (IS_WINDOWS) {
      expect(fs.existsSync(path.join(cliDir, 'tmc.exe'))).toBe(true);
    } else {
      expect(fs.existsSync(path.join(cliDir, 'tmc'))).toBe(true);
    }
  }, 100000);

  it('Latest version caches', async () => {
    // there's no public org we could use for a real test, so
    // use a fake org and mock request. Then assume that version
    // used as a time of writing this test never gets removed from
    // public download location.
    nock('https://fakeorg.tmc.cloud.vmware.com')
      .persist()
      .get('/v1alpha1/system/binaries')
      .reply(200, {
        latestVersion: '0.2.1-7e9c62fc',
        versions: {
          '0.2.1-7e9c62fc': {
            darwinX64:
              'https://tmc-cli.s3-us-west-2.amazonaws.com/tmc/0.2.1-7e9c62fc/darwin/x64/tmc',
            linuxX64:
              'https://tmc-cli.s3-us-west-2.amazonaws.com/tmc/0.2.1-7e9c62fc/linux/x64/tmc',
            windowsX64:
              'https://tmc-cli.s3-us-west-2.amazonaws.com/tmc/0.2.1-7e9c62fc/windows/x64/tmc.exe'
          }
        }
      });

    const cliInstall = new CliInstall();

    // take 1, should download
    const result1 = await cliInstall.getCli({
      org: 'fakeorg',
      version: 'latest',
      api: DEFAULT_TMC_API_VERSION,
      token: '',
      contextName: '',
      managementClusterName: undefined,
      provisionerName: undefined
    });

    expect(result1.cached).toBe(false);
    const cliDir1 = path.join(toolDir, 'tmc-cli', '0.2.1-7e9c62fc', 'x64');
    if (IS_WINDOWS) {
      expect(fs.existsSync(path.join(cliDir1, 'tmc.exe'))).toBe(true);
    } else {
      expect(fs.existsSync(path.join(cliDir1, 'tmc'))).toBe(true);
    }

    // take 2, should use tool cache
    const result2 = await cliInstall.getCli({
      org: 'fakeorg',
      version: 'latest',
      api: DEFAULT_TMC_API_VERSION,
      token: '',
      contextName: '',
      managementClusterName: undefined,
      provisionerName: undefined
    });
    expect(result2.cached).toBe(true);
    const cliDir2 = path.join(toolDir, 'tmc-cli', '0.2.1-7e9c62fc', 'x64');
    if (IS_WINDOWS) {
      expect(fs.existsSync(path.join(cliDir2, 'tmc.exe'))).toBe(true);
    } else {
      expect(fs.existsSync(path.join(cliDir2, 'tmc'))).toBe(true);
    }
  }, 100000);
});
