import * as core from '@actions/core';

export const IsPost = !!process.env['STATE_isPost'];
export const currentContextName = process.env['STATE_currentContextName'] || '';

export function setCurrentContextName(name: string) {
  core.saveState('currentContextName', name);
}

if (!IsPost) {
  core.saveState('isPost', 'true');
}
