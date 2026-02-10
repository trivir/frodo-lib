import util from 'util';

import { AxiosRequestConfig } from 'axios';

import { Callback } from '../ops/CallbackOps';
import { State } from '../shared/State';
import { debugMessage } from '../utils/Console';
import { getRealmPath } from '../utils/ForgeRockUtils';
import { generateAmApi, generateIdmApi } from './BaseApi';

const authenticateUrlTemplate = '%s/json%s/authenticate';
const authenticateWithServiceUrlTemplate = `${authenticateUrlTemplate}?authIndexType=service&authIndexValue=%s`;

const apiVersion = 'resource=2.0, protocol=1.0';
const getApiConfig = () => ({
  apiVersion,
});

export type AuthenticateStep = {
  authId: string;
  callbacks: Callback[];
  template?: string;
  stage?: string;
  header?: string;
  description?: string;
};

export type AuthenticateSuccessResponse = {
  tokenId: string;
  successUrl: string;
  realm: string;
};

export type AuthenticateErrorResponse = {
  code: string;
  reason: string;
  message: string;
};

export type AuthenticateResponse =
  | AuthenticateStep
  | AuthenticateSuccessResponse
  | AuthenticateErrorResponse;

/**
 * Performs an authentication step using the service's authenticate endpoint
 * @param {AuthenticateStep | Record<string, never>} body POST request body
 * @param {AxiosRequestConfig<object>} config request config
 * @param {string} realm realm
 * @param {string} service name of authentication service/journey
 * @returns Promise resolving to the authentication service response
 */
export async function step({
  body = {},
  config = {},
  realm = '/',
  service = undefined,
  state,
}: {
  body?: AuthenticateStep | Record<string, never>;
  config?: AxiosRequestConfig<object>;
  realm?: string;
  service?: string;
  state: State;
}): Promise<AuthenticateResponse> {
  const urlString =
    service || state.getAuthenticationService()
      ? util.format(
          authenticateWithServiceUrlTemplate,
          state.getHost(),
          getRealmPath(realm),
          service || state.getAuthenticationService()
        )
      : util.format(
          authenticateUrlTemplate,
          state.getHost(),
          getRealmPath(realm)
        );
  const { data } = await generateAmApi({
    resource: getApiConfig(),
    state,
  }).post(urlString, body, config);
  return data;
}

/**
 *
 * @param {any} body POST request body
 * @param {any} config request config
 * @returns Promise resolving to the authentication service response
 */
export async function authenticateIdm({
  body = {},
  config = {},
  state,
}: {
  body?: object;
  config?: object;
  realm?: string;
  service?: string;
  state: State;
}): Promise<any> {
  debugMessage({
    message: `AuthenticateApi.authenticateIdm: function start `,
    state,
  });
  const urlString = `${state.getHost()}/authentication?_action=login`;
  const { data } = await generateIdmApi({
    state,
  }).post(urlString, body, config);
  return data;
}
