import util from 'util';
import Constants from '../shared/Constants';
import { State } from '../shared/State';
import { getHostOnlyUrl } from '../utils/ForgeRockUtils';
import {
  generateAmApi,
  generateEnvApi,
  generateGovernanceApi,
  generateIdmApi,
  generateLogApi,
  generateLogKeysApi,
  generateWSFedApi,
} from './BaseApi';

const urlTemplate: string = '%s/%s';

export type ApiVersion = {
  protocol: string;
  resource: string;
};

function getApiConfig(
  apiVersion: ApiVersion = {
    protocol: '2.0',
    resource: '1.0',
  }
): { apiVersion: string } {
  return {
    apiVersion: `protocol=${apiVersion.protocol},resource=${apiVersion.resource}`,
  };
}

/**
 * Performs a get request against the specified AM endpoint
 * @param {string} endpoint The AM endpoint
 * @param {ApiVersion} apiVersion The API version to use. Defaults to 2.0 for protocol and 1.0 for resource.
 * @returns {Promise<any>} The response data from the endpoint
 */
export async function getRawAm({
  endpoint,
  apiVersion,
  state,
}: {
  endpoint: string;
  apiVersion?: ApiVersion;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateAmApi({
    resource: getApiConfig(apiVersion),
    requiredScopes: [Constants.AVAILABLE_SCOPES.AmFullScope],
    state,
  }).get(urlString, { withCredentials: true });

  return data;
}

/**
 * Performs a get request against the specified IDM endpoint
 * @param {string} endpoint The IDM endpoint
 * @returns {Promise<any>} The response data from the endpoint
 */
export async function getRawIdm({
  endpoint,
  state,
}: {
  endpoint: string;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateIdmApi({
    requiredScopes: [Constants.AVAILABLE_SCOPES.IdmFullScope],
    state,
  }).get(urlString);

  return data;
}

/**
 * Retrieves raw IGA data from the specified endpoint.
 * @param endpoint - The endpoint to send the GET request to.
 * @param apiVersion - Optional API version used to configure the request.
 * @returns A promise that resolves to the raw API response data.
 */

export async function getRawIga({
  endpoint,
  apiVersion,
  state,
}: {
  endpoint: string;
  apiVersion?: ApiVersion;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateGovernanceApi({
    resource: getApiConfig(apiVersion),
    requiredScopes: [Constants.AVAILABLE_SCOPES.IGAFullScope],
    state,
  }).get(urlString, { withCredentials: true });

  return data;
}

/**
 * Retrieves raw log key data from the specified endpoint.
 * @param endpoint - The endpoint to send the GET request to.
 * @returns A promise that resolves to the raw API response data.
 */
export async function getRawKeys({
  endpoint,
  state,
}: {
  endpoint: string;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateLogKeysApi({
    state,
  }).get(urlString);

  return data;
}

/**
 * Retrieves raw monitoring log data from the specified endpoint.
 * @param endpoint - The endpoint to send the GET request to.
 * @returns A promise that resolves to the raw monitoring log response data.
 */
export async function getRawMonitoringLogs({
  endpoint,
  state,
}: {
  endpoint: string;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateLogApi({
    state,
  }).get(urlString, { withCredentials: true });

  return data;
}

/**
 * Retrieves raw WS-Federation data from the specified endpoint.
 * @param endpoint - The endpoint to send the GET request to.
 * @returns A promise that resolves to the raw API response data.
 */
export async function getRawWs({
  endpoint,
  state,
}: {
  endpoint: string;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateWSFedApi({
    requiredScopes: [Constants.AVAILABLE_SCOPES.WSFedAdminScope],
    state,
  }).get(urlString, { withCredentials: true });

  return data;
}

/**
 * Performs a get request against the specified Environment endpoint
 * @param {string} endpoint The Environment endpoint
 * @param {ApiVersion} apiVersion The API version to use. Defaults to 2.0 for protocol and 1.0 for resource.
 * @returns {Promise<any>} The response data from the endpoint
 */
export async function getRawEnv({
  endpoint,
  apiVersion,
  state,
}: {
  endpoint: string;
  apiVersion?: ApiVersion;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateEnvApi({
    resource: getApiConfig(apiVersion),
    // No single umbrella scope covers arbitrary cloud environment paths —
    // deliberately empty, meaning "nothing to check", not an oversight.
    requiredScopes: [],
    state,
  }).get(urlString, { withCredentials: true });

  return data;
}

/**
 * Performs a put request against the specified AM endpoint
 * @param {string} endpoint The AM endpoint
 * @param {object} payload The AM object data to write to the specified endpoint
 * @param {ApiVersion} apiVersion The API version to use. Defaults to 2.0 for protocol and 1.0 for resource.
 * @returns {Promise<any>} The response data from the endpoint
 */
export async function putRawAm({
  endpoint,
  payload,
  apiVersion,
  state,
}: {
  endpoint: string;
  payload: object;
  apiVersion?: ApiVersion;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateAmApi({
    resource: getApiConfig(apiVersion),
    requiredScopes: [Constants.AVAILABLE_SCOPES.AmFullScope],
    state,
  }).put(urlString, payload, { withCredentials: true });
  return data;
}

/**
 * Performs a put request against the specified IDM endpoint
 * @param {string} endpoint The IDM endpoint
 * @param {object} payload The IDM object data to write to the specified endpoint
 * @returns {Promise<any>} The response data from the endpoint
 */
export async function putRawIdm({
  endpoint,
  payload,
  state,
}: {
  endpoint: string;
  payload: object;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateIdmApi({
    requiredScopes: [Constants.AVAILABLE_SCOPES.IdmFullScope],
    state,
  }).put(urlString, payload);
  return data;
}

/**
 * Performs a put request against the specified Environment endpoint
 * @param {string} endpoint The Environment endpoint
 * @param {object} payload The object data to write to the specified endpoint
 * @param {ApiVersion} apiVersion The API version to use. Defaults to 2.0 for protocol and 1.0 for resource.
 * @returns {Promise<any>} The response data from the endpoint
 */
export async function putRawEnv({
  endpoint,
  payload,
  apiVersion,
  state,
}: {
  endpoint: string;
  payload: object;
  apiVersion?: ApiVersion;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateEnvApi({
    resource: getApiConfig(apiVersion),
    // No single umbrella scope covers arbitrary cloud environment paths —
    // deliberately empty, meaning "nothing to check", not an oversight.
    requiredScopes: [],
    state,
  }).put(urlString, payload, { withCredentials: true });
  return data;
}

/**
 * Updates IGA data at the specified endpoint using a PUT request.
 * @param endpoint - The endpoint to send the PUT request to.
 * @param payload - The data to include in the request body.
 * @param apiVersion - Optional API version used to configure the request.
 * @returns A promise that resolves to the raw API response data.
 */
export async function putRawIga({
  endpoint,
  payload,
  apiVersion,
  state,
}: {
  endpoint: string;
  payload: object;
  apiVersion?: ApiVersion;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateGovernanceApi({
    resource: getApiConfig(apiVersion),
    requiredScopes: [Constants.AVAILABLE_SCOPES.IGAFullScope],
    state,
  }).put(urlString, payload, { withCredentials: true });

  return data;
}

/**
 * Updates log key data at the specified endpoint using a PUT request.
 * @param endpoint - The endpoint to send the PUT request to.
 * @param payload - The data to include in the request body.
 * @returns A promise that resolves to the raw API response data.
 */
export async function putRawKeys({
  endpoint,
  payload,
  state,
}: {
  endpoint: string;
  payload: object;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateLogKeysApi({
    state,
  }).put(urlString, payload, { withCredentials: true });

  return data;
}

/**
 * Updates monitoring log data at the specified endpoint using a PUT request.
 * @param endpoint - The endpoint to send the PUT request to.
 * @param payload - The data to include in the request body.
 * @returns A promise that resolves to the raw monitoring log response data.
 */
export async function putRawMonitoringLogs({
  endpoint,
  payload,
  state,
}: {
  endpoint: string;
  payload: object;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateLogApi({
    state,
  }).put(urlString, payload, { withCredentials: true });

  return data;
}

/**
 * Updates WS-Fed data at the specified endpoint using a PUT request.
 * @param endpoint - The endpoint to send the PUT request to.
 * @param payload - The data to include in the request body.
 * @returns A promise that resolves to the raw API response data.
 */
export async function putRawWs({
  endpoint,
  payload,
  state,
}: {
  endpoint: string;
  payload: object;
  state: State;
}): Promise<any> {
  const urlString = util.format(
    urlTemplate,
    getHostOnlyUrl(state.getHost()),
    endpoint
  );
  const { data } = await generateWSFedApi({
    requiredScopes: [Constants.AVAILABLE_SCOPES.WSFedAdminScope],
    state,
  }).put(urlString, payload, { withCredentials: true });

  return data;
}
