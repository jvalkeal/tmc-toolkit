import * as https from 'https';
import axios, {AxiosInstance} from 'axios';
import {SystemBinariesResponse, TmcEnv} from './interfaces';

/**
 * Client for tmc api operations.
 */
export class TmcClient {
  private instance: AxiosInstance;

  constructor(private tmcEnv: TmcEnv) {
    this.instance = axios.create({
      timeout: tmcEnv.timeout,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      httpsAgent: new https.Agent({})
    });
  }

  public getSystemBinaries(): Promise<SystemBinariesResponse> {
    return new Promise(async (resolve, reject) => {
      this.instance
        .get(this.getServerUrl())
        .then(r => {
          resolve(r.data as SystemBinariesResponse);
        })
        .catch(e => {
          reject(e);
        });
    });
  }

  private getServerUrl(): string {
    return `https://${this.tmcEnv.org}.tmc.cloud.vmware.com/${this.tmcEnv.api}/system/binaries`;
  }
}
