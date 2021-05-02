import * as path from 'path';
import * as core from '@actions/core';
import * as io from '@actions/io';
import * as tc from '@actions/tool-cache';
import * as fs from 'fs';
import {TmcClient} from './tmc-client';

export interface GetCliResult {
  dir: string;
  cached: boolean;
}

export class CliInstall {
  private tempDirectory = process.env['RUNNER_TEMP'] || '';
  private IS_WINDOWS = process.platform === 'win32';

  constructor() {
    if (!this.tempDirectory) {
      let baseLocation;
      if (this.IS_WINDOWS) {
        // On windows use the USERPROFILE env variable
        baseLocation = process.env['USERPROFILE'] || 'C:\\';
      } else {
        if (process.platform === 'darwin') {
          baseLocation = '/Users';
        } else {
          baseLocation = '/home';
        }
      }
      this.tempDirectory = path.join(baseLocation, 'actions', 'temp');
    }
  }

  public async getCli(
    org: string,
    versionIn: string,
    apiVersion: string
  ): Promise<GetCliResult> {
    const latestVersion = await this.getLatestVersion(org, apiVersion);
    core.debug(`Latest version is ${latestVersion}`);
    const version = versionIn === 'latest' ? latestVersion : versionIn;
    let arch: string;
    const toolName = 'tmc-cli';
    let toolPath = tc.find(toolName, version);

    if (this.IS_WINDOWS) {
      arch = 'windows';
    } else {
      if (process.platform === 'darwin') {
        arch = 'darwin';
      } else {
        arch = 'linux';
      }
    }

    let cached = false;
    if (toolPath) {
      core.debug(`Tool found in cache ${toolPath}`);
      cached = true;
    } else {
      core.debug('Downloading CLI from tmc-cli.s3-us-west-2.amazonaws.com');

      const downloadInfo = this.getDownloadInfo(version, arch);
      core.debug(`DownloadInfo ${downloadInfo.version} ${downloadInfo.url}`);

      const cliFile = await tc.downloadTool(downloadInfo.url);
      core.debug(`cliFile ${cliFile}`);
      const cliVersion = downloadInfo.version;

      let tempDir: string = path.join(
        this.tempDirectory,
        'temp_' + Math.floor(Math.random() * 2000000000)
      );
      core.debug(`tempDir ${tempDir}`);

      const cliDir = await this.makeExecutable(cliFile, tempDir);
      core.debug(`cli extracted to ${cliDir}`);
      toolPath = await tc.cacheDir(
        cliDir,
        toolName,
        this.getCacheVersionString(cliVersion)
      );
    }
    core.addPath(toolPath);
    return {dir: toolPath, cached};
  }

  private async makeExecutable(cliFile: string, tempDir: string) {
    await io.mkdirP(tempDir);
    const cliFilePath = path.normalize(cliFile);
    const stats = fs.statSync(cliFilePath);
    if (stats.isFile()) {
      const exe = this.IS_WINDOWS ? 'tmc.exe' : 'tmc';
      const exePath = path.join(tempDir, exe);
      fs.copyFileSync(cliFilePath, exePath);
      fs.chmodSync(exePath, 0o755);
      return tempDir;
    } else {
      throw new Error(`CLI argument ${cliFile} is not a file`);
    }
  }

  private async getLatestVersion(org: string, api: string): Promise<string> {
    const tmcClient = new TmcClient({
      org,
      timeout: 9999,
      api
    });
    return (await tmcClient.getSystemBinaries()).latestVersion;
  }

  private getCacheVersionString(version: string) {
    const versionArray = version.split('.');
    const major = versionArray[0];
    const minor = versionArray.length > 1 ? versionArray[1] : '0';
    const patch = versionArray.length > 2 ? versionArray[2] : '0';
    return `${major}.${minor}.${patch}`;
  }

  private getDownloadInfo(
    version: string,
    arch: string
  ): {version: string; url: string} {
    if (!version || version.length === 0) {
      throw new Error('Cli version missing');
    }
    const release = arch === 'windows' ? 'tmc.exe' : 'tmc';
    const curUrl = `https://tmc-cli.s3-us-west-2.amazonaws.com/tmc/${version}/${arch}/x64/${release}`;
    return {version: version, url: curUrl};
  }
}
