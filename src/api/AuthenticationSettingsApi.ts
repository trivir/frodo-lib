import util from 'util';

import { State } from '../shared/State';
import { debugMessage } from '../utils/Console';
import {
  getConfigPath,
  getCurrentRealmPath,
  getRealmPathGlobal,
} from '../utils/ForgeRockUtils';
import { type IdObjectSkeletonInterface } from './ApiTypes';
import { generateAmApi } from './BaseApi';

const authenticationSettingsURLTemplate = '%s/json%s/%s/authentication';
const apiVersion = 'resource=1.0';
const getApiConfig = () => {
  return {
    apiVersion,
  };
};

export type AuthenticationSettingsSkeleton = IdObjectSkeletonInterface & {
  _id: '';
  _type: {
    _id: 'EMPTY';
    name: 'Core';
    collection: false;
  };
};

/**
 * Get authentication settings
 * @param {boolean} globalConfig true if global agent is the target of the operation, false otherwise. Default: false.
 * @returns {Promise<AuthenticationSettingsSkeleton>} a promise that resolves to an authentication settings object
 */
export async function getAuthenticationSettings({
  state,
  globalConfig = false,
}: {
  state: State;
  globalConfig: boolean;
}): Promise<AuthenticationSettingsSkeleton> {
  debugMessage({
    message: `AuthenticationSettingsApi.getAuthenticationSettings: start`,
    state,
  });
  const urlString = util.format(
    authenticationSettingsURLTemplate,
    state.getHost(),
    getRealmPathGlobal(globalConfig, state),
    getConfigPath(globalConfig)
  );
  const { data } = await generateAmApi({ resource: getApiConfig(), state }).get(
    urlString,
    {
      withCredentials: true,
    }
  );
  debugMessage({
    message: `AuthenticationSettingsApi.getAuthenticationSettings: end`,
    state,
  });
  return data;
}

/**
 * Put authentication settings
 * @param {AuthenticationSettingsSkeleton} settings authentication settings object
 * @returns {Promise<AuthenticationSettingsSkeleton>} a promise that resolves to an authentiction settings object
 */
export async function putAuthenticationSettings({
  settings,
  state,
}: {
  settings: AuthenticationSettingsSkeleton;
  state: State;
}): Promise<AuthenticationSettingsSkeleton> {
  debugMessage({
    message: `AuthenticationSettingsApi.putAuthenticationSettings: start`,
    state,
  });
  const urlString = util.format(
    authenticationSettingsURLTemplate,
    state.getHost(),
    getRealmPathGlobal(false, state),
    getCurrentRealmPath(state)
  );
  const { data } = await generateAmApi({ resource: getApiConfig(), state }).put(
    urlString,
    settings,
    {
      withCredentials: true,
    }
  );
  debugMessage({
    message: `AuthenticationSettingsApi.putAuthenticationSettings: end`,
    state,
  });
  return data;
}
