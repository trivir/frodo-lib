import util from 'util';

import { State } from '../shared/State';
import { getConfigPath, getRealmPathGlobal } from '../utils/ForgeRockUtils';
import {
  AmConfigEntityInterface,
  IdObjectSkeletonInterface,
  PagedResult,
} from './ApiTypes';
import { generateAmApi } from './BaseApi';

const secretStoresURLTemplate =
  '%s/json%s/%s/secrets/stores?_action=nextdescendents';
const secretStoresMappingURLTemplate =
  '%s/json%s/%s/secrets/stores/%s/%s/mappings?_queryFilter=true';

const apiVersion = 'protocol=2.0,resource=1.0';

function getApiConfig() {
  return {
    apiVersion,
  };
}

export type SecretStoreSkeleton = AmConfigEntityInterface;

export type SecretStoreMappingSkeleton = IdObjectSkeletonInterface & {
  secretId: string;
  aliases: string[];
};

/**
 * Get all secret stores
 * @param {boolean} globalConfig true if the secret store is global, false otherwise. Default: false.
 * @returns {Promise<PagedResult<SecretStoreSkeleton>>} a promise that resolves to an array of secret store objects
 */
export async function getSecretStores({
  globalConfig = false,
  state,
}: {
  globalConfig: boolean;
  state: State;
}): Promise<PagedResult<SecretStoreSkeleton>> {
  const urlString = util.format(
    secretStoresURLTemplate,
    state.getHost(),
    getRealmPathGlobal(globalConfig, state),
    getConfigPath(globalConfig)
  );
  const { data } = await generateAmApi({
    resource: getApiConfig(),
    state,
  }).post(
    urlString,
    {},
    {
      withCredentials: true,
    }
  );
  return data;
}

/**
 * Get secret store mappings
 * @param {string} secretStoreId Secret store id
 * @param {string} secretStoreTypeId Secret store type id
 * @param {boolean} globalConfig true if the secret store is global, false otherwise. Default: false.
 * @returns {Promise<SecretStoreMappingSkeleton[]>} a promise that resolves to an array of secret store mapping objects
 */
export async function getSecretStoreMappings({
  secretStoreId,
  secretStoreTypeId,
  globalConfig = false,
  state,
}: {
  secretStoreId: string;
  secretStoreTypeId: string;
  globalConfig: boolean;
  state: State;
}): Promise<PagedResult<SecretStoreMappingSkeleton>> {
  const urlString = util.format(
    secretStoresMappingURLTemplate,
    state.getHost(),
    getRealmPathGlobal(globalConfig, state),
    getConfigPath(globalConfig),
    secretStoreTypeId,
    secretStoreId
  );
  const { data } = await generateAmApi({
    resource: getApiConfig(),
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}
