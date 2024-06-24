import util from 'util';

import { State } from '../shared/State';
import { printMessage } from '../utils/Console';
import { IdObjectSkeletonInterface, PagedResult } from './ApiTypes';
import { generateAmApi } from './BaseApi';

const serverURLTemplate = '%s/json/global-config/servers/%s';
const serversURLTemplate = '%s/json/global-config/servers?_queryFilter=true';
const propertiesURLTemplate = serverURLTemplate + '/properties/%s';
const propertyTypes = [
  'advanced',
  'cts',
  'directoryConfiguration',
  'general',
  'sdk',
  'security',
  'session',
  'uma',
];
const apiVersion = 'protocol=2.0,resource=1.0';

function getApiConfig() {
  return {
    apiVersion,
  };
}

export type ServerSkeleton = IdObjectSkeletonInterface & {
  url: string;
  siteName: string;
};

export type ServerPropertiesSkeleton = {
  advanced: object;
  cts: object;
  directoryConfiguration: object;
  general: object;
  sdk: object;
  security: object;
  session: object;
  uma: object;
};

/**
 * Get server
 * @param {string} serverId Server id
 * @returns {Promise<ServerSkeleton>} a promise that resolves to a server object
 */
export async function getServer({
  serverId,
  state,
}: {
  serverId: string;
  state: State;
}): Promise<ServerSkeleton> {
  const urlString = util.format(serverURLTemplate, state.getHost(), serverId);
  const { data } = await generateAmApi({ resource: getApiConfig(), state }).get(
    urlString,
    {
      withCredentials: true,
    }
  );
  return data;
}

/**
 * Get all servers
 * @returns {Promise<PagedResult<ServerSkeleton[]>>} a promise that resolves to an array of server objects
 */
export async function getServers({
  state,
}: {
  state: State;
}): Promise<PagedResult<ServerSkeleton>> {
  const urlString = util.format(serversURLTemplate, state.getHost());
  const { data } = await generateAmApi({
    resource: getApiConfig(),
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Get server properties
 * @param {string} serverId Server id
 * @returns {Promise<ServerPropertiesSkeleton>} a promise that resolves to a server properties object
 */
export async function getServerProperties({
  serverId,
  state,
}: {
  serverId: string;
  state: State;
}): Promise<ServerPropertiesSkeleton> {
  const properties = {};
  for (const property of propertyTypes) {
    const urlString = util.format(
      propertiesURLTemplate,
      state.getHost(),
      serverId,
      property
    );
    try {
      const { data } = await generateAmApi({
        resource: getApiConfig(),
        state,
      }).get(urlString, {
        withCredentials: true,
      });
      properties[property] = data;
    } catch (e) {
      printMessage({
        message: `Error exporting server properties for server with id '${serverId}' from url '${urlString}': ${e.message}`,
        type: 'error',
        state,
      });
    }
  }
  return properties as ServerPropertiesSkeleton;
}
