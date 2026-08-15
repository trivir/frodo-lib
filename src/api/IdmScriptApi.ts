import util from 'node:util';

import { State } from '../shared/State.ts';
import { getIdmBaseUrl } from '../utils/ForgeRockUtils.ts';
import { generateIdmApi } from './BaseApi.ts';

const scriptActionsUrlTemplate = '%s/script?_action=%s';

/**
 * Test connector servers
 * @returns {Promise<TestConnectorServersInterface>} a promise that resolves to a TestConnectorServersInterface object
 */
export async function compileScript({
  script,
  state,
}: {
  script: string;
  state: State;
}): Promise<string | object> {
  const urlString = util.format(
    scriptActionsUrlTemplate,
    getIdmBaseUrl(state),
    'compile'
  );
  const postData = {
    type: 'text/javascript',
    source: script,
  };
  const { data } = await generateIdmApi({ state, requestOverride: {} }).post(
    urlString,
    postData
  );
  return data;
}

export async function evaluateScript({
  script,
  globals = {},
  state,
}: {
  script: string;
  globals?: { [key: string]: any };
  state: State;
}): Promise<any> {
  const urlString = util.format(
    scriptActionsUrlTemplate,
    getIdmBaseUrl(state),
    'eval'
  );
  const postData = {
    type: 'text/javascript',
    globals,
    source: script,
  };
  const { data } = await generateIdmApi({ requestOverride: {}, state }).post(
    urlString,
    postData
  );
  return data;
}
