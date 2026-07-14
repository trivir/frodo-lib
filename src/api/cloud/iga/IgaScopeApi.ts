import util from 'util';

import { State } from '../../../shared/State';
import { getApiSearchAll } from '../../../utils/ExportImportUtils';
import { getHostOnlyUrl } from '../../../utils/ForgeRockUtils';
import { Metadata, QueryResult, SearchResult } from '../../ApiTypes';
import { generateGovernanceApi } from '../../BaseApi';
import { CertificationTemplateSkeleton } from './IgaCertificationTemplateApi';

const scopeEndpointURLTemplate = '%s/iga/governance/scope';
const scopeURLTemplate = scopeEndpointURLTemplate + '/%s';
const createScopeURLTemplate = scopeEndpointURLTemplate + '?_action=create';
const scopeEntityEndpointURLTemplate = scopeEndpointURLTemplate + '/entity';
const scopeEntitySchemaEndpointURLTemplate =
  scopeEntityEndpointURLTemplate + '/%s';

const apiVersion = 'protocol=2.1,resource=1.0';

const getApiConfig = () => {
  return {
    apiVersion,
  };
};

export interface ScopeFilterLiteral {
  literal: string | number | boolean;
}

export type ScopeFilter =
  | { equals: { left: string; right: ScopeFilterLiteral } }
  | { not_equals: { left: string; right: ScopeFilterLiteral } }
  | { contains: { in_string: string; search_string: ScopeFilterLiteral } }
  | { not_contains: { in_string: string; search_string: ScopeFilterLiteral } }
  | { starts_with: { value: string; prefix: ScopeFilterLiteral } }
  | { ends_with: { value: string; suffix: ScopeFilterLiteral } }
  | { and: ScopeFilter[] }
  | { or: ScopeFilter[] }
  | Record<string, never>;

export interface ScopePermissions {
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
}

export interface ScopeEntityCondition {
  version: 'v2';
  filter: ScopeFilter;
}

export interface ScopeEntityResponse {
  entities: string[];
}

export interface ScopeEntityAttribute {
  class: string;
  displayName?: string;
  reference?: string;
  type: string | string[];
  format?: string;
  item?: {
    type?: string;
  };
  enumeratedValues?: {
    text: string | number;
    value: string | number;
  }[];
}

export interface ScopeEntitySchemaResponse {
  schema: Record<string, ScopeEntityAttribute>;
}

export interface ScopeConditions {
  user?: ScopeEntityCondition;
  application?: ScopeEntityCondition;
  role?: ScopeEntityCondition;
  entitlement?: ScopeEntityCondition;
}

export interface ScopeSkeleton {
  id: string;
  name: string;
  description: string;
  status?: 'active' | 'inactive';
  sourceCondition: ScopeConditions;
  targetCondition: ScopeConditions;
  permissions?: ScopePermissions;
  entity: ScopeEntityAttribute;
  _rev: number;
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
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}
/**
 * Get a scope by id
 * @param id the scope id
 * @returns {Promise<ScopeSkeleton>}
 */
export async function getScopeName({
  name,
  state,
}: {
  name: string;
  state: State;
}): Promise<ScopeSkeleton> {
  const urlString = util.format(
    scopeURLTemplate,
    getHostOnlyUrl(state.getHost()),
    name
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Get all scopes
 * @returns {Promise<SearchResult<ScopeSkeleton> >} a promise that resolves to a scope object
 */
export async function getScopes({
  state,
}: {
  state: State;
}): Promise<SearchResult<ScopeSkeleton>> {
  const urlString = util.format(
    scopeEndpointURLTemplate,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Get scope Entities
 * @returns {Promise<ScopeEntityResponse>} a promise that resolves to a scope object
 */
export async function getScopeEntity({
  state,
}: {
  state: State;
}): Promise<ScopeEntityResponse> {
  const urlString = util.format(
    scopeEntityEndpointURLTemplate,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Get scope Entities
 * @entityName the entity name
 * @returns {Promise<ScopeEntitySchemaResponse>} a promise that resolves to a scope schema
 */
export async function getScopeEntitySchema({
  entityName,
  state,
}: {
  entityName: string;
  state: State;
}): Promise<ScopeEntitySchemaResponse> {
  const urlString = util.format(
    scopeEntitySchemaEndpointURLTemplate,
    getHostOnlyUrl(state.getHost()),
    entityName
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
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
    resource: {},
    state,
  }).post(urlString, scopeData, {
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
    resource: {},
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
    resource: {},
    state,
  }).delete(urlString, {
    withCredentials: true,
  });
  return data;
}

export async function deleteScopes({
  state,
}: {
  state: State;
}): Promise<ScopeSkeleton> {
  const urlString = util.format(
    scopeURLTemplate,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).delete(urlString, {
    withCredentials: true,
  });
  return data;
}
