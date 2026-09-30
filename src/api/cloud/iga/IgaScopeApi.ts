import util from 'util';

import { State } from '../../../shared/State';
import { getApiSearchAll } from '../../../utils/ExportImportUtils';
import { getHostOnlyUrl } from '../../../utils/ForgeRockUtils';
import { Condition, Metadata } from '../../ApiTypes';
import { generateGovernanceApi } from '../../BaseApi';
import Constants from '../../../shared/Constants';

const scopeEndpointURLTemplate = '%s/iga/governance/scope';
const scopeURLTemplate = scopeEndpointURLTemplate + '/%s';
const createScopeURLTemplate = scopeEndpointURLTemplate + '?_action=create';

const apiVersion = 'protocol=2.1,resource=1.0';

const getApiConfig = () => {
  return {
    apiVersion,
  };
};

export interface ScopeSkeleton {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  sourceCondition: {
    user: Condition;
  };
  targetCondition: {
    application?: Condition;
    role?: Condition;
    entitlement?: Condition;
    user?: Condition;
  };
  permissions?: {
    createUser?: boolean;
    modifyUser?: boolean;
    deleteUser?: boolean;
    viewUserAccess?: boolean;
    createRole?: boolean;
    modifyRole?: boolean;
    publishRole?: boolean;
    deleteRole?: boolean;
    createEntitlement?: boolean;
    modifyEntitlement?: boolean;
    viewGrants?: boolean;
  };
  _rev?: number;
  metadata?: Metadata;
}

/**
 * Get a scope by id
 * @param id the scope id
 * @returns {Promise<ScopeSkeleton>}
 */
export async function getScope({
  id,
  state,
}: {
  id: string;
  state: State;
}): Promise<ScopeSkeleton> {
  const urlString = util.format(
    scopeURLTemplate,
    getHostOnlyUrl(state.getHost()),
    id
  );
  const { data } = await generateGovernanceApi({
    resource: getApiConfig(),
    requiredScopes: [Constants.AVAILABLE_SCOPES.IGAFullScope],
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Query scopes
 * @param {string} queryFilter The query filter to query with. Default: 'true'
 * @param {string[]} fields Fields array to specify which fields to return. By default it will return all fields
 * @returns { Promise<ScopeSkeleton[]> } A promise that resolves to an array of scope objects
 */
export async function queryScopes({
  queryFilter = 'true',
  fields = [],
  state,
}: {
  queryFilter?: string;
  fields?: string[];
  state: State;
}): Promise<ScopeSkeleton[]> {
  const urlString = util.format(
    scopeEndpointURLTemplate,
    getHostOnlyUrl(state.getHost())
  );
  return await getApiSearchAll<ScopeSkeleton>({
    url: urlString,
    queryFilter,
    fields,
    state,
  });
}

/**
 * Create scope
 * @param {ScopeSkeleton} scopeData the scope object
 * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
 */
export async function createScope({
  scopeData,
  state,
}: {
  scopeData: ScopeSkeleton;
  state: State;
}): Promise<ScopeSkeleton> {
  const urlString = util.format(
    createScopeURLTemplate,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateGovernanceApi({
    resource: getApiConfig(),
    requiredScopes: [Constants.AVAILABLE_SCOPES.IGAFullScope],
    state,
  }).post(urlString, scopeData, {
    withCredentials: true,
  });
  return data;
}

/**
 * Put scope
 * @param {string} id The scope id
 * @param {ScopeSkeleton} scopeData The scope data
 * @returns {Promise<ScopeSkeleton>} A promise that resolves to a scope object
 */
export async function putScope({
  id,
  scopeData,
  state,
}: {
  id: string;
  scopeData: ScopeSkeleton;
  state: State;
}): Promise<ScopeSkeleton> {
  const urlString = util.format(
    scopeURLTemplate,
    getHostOnlyUrl(state.getHost()),
    id
  );
  const { data } = await generateGovernanceApi({
    resource: getApiConfig(),
    requiredScopes: [Constants.AVAILABLE_SCOPES.IGAFullScope],
    state,
  }).put(urlString, scopeData, {
    withCredentials: true,
  });
  return data;
}

/**
 * Delete scope
 * @param {string} id The scope id
 * @returns {Promise<ScopeSkeleton>} A promise that resolves to a scope object
 */
export async function deleteScope({
  id,
  state,
}: {
  id: string;
  state: State;
}): Promise<ScopeSkeleton> {
  const urlString = util.format(
    scopeURLTemplate,
    getHostOnlyUrl(state.getHost()),
    id
  );
  const { data } = await generateGovernanceApi({
    resource: getApiConfig(),
    requiredScopes: [Constants.AVAILABLE_SCOPES.IGAFullScope],
    state,
  }).delete(urlString, {
    withCredentials: true,
  });
  return data;
}
