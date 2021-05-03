import {run, cleanup} from './tmc-toolkit';
import * as stateHelper from './state-helper';

if (!stateHelper.IsPost) {
  run();
} else {
  cleanup();
}
