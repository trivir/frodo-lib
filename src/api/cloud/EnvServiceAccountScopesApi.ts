import util from 'node:util';

import { type State } from '../../shared/State.ts';
import { getHostOnlyUrl } from '../../utils/ForgeRockUtils.ts';
import { generateEnvApi } from '../BaseApi.ts';

const serviceAccountScopes = '%s/environment/scopes/service-accounts';

const apiVersion = 'protocol=1.0,resource=1.0';
const getApiConfig = () => {
  return {
    apiVersion,
  };
};

/**
 * Service Account Scopes object
 */
export type ServiceAccountScope = {
  scope: string;
  description?: string;
  childScopes?: ServiceAccountScope[];
};

/**
 * Get available service account scopes
 * @returns {Promise<ServiceAccountScope>} a promise that resolves to an array of ServiceAccountScope objects
 */
export async function getServiceAccountScopes({
  state,
}: {
  state: State;
}): Promise<ServiceAccountScope[]> {
  const urlString = util.format(
    serviceAccountScopes,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateEnvApi({
    resource: getApiConfig(),
    requestOverride: state.getCookieValue()
      ? {
          headers: {
            Cookie: `${state.getCookieName()}=${state.getCookieValue()}`,
          },
        }
      : undefined,
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}
