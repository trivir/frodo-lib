import { getRealms } from '../ops/RealmOps';
import Constants from '../shared/Constants';
import { State } from '../shared/State';
import { printError, printMessage } from '../utils/Console';
import {
  getRealmPathGlobal,
  getRealmUsingExportFormat,
} from '../utils/ForgeRockUtils';
import { AmConfigEntityInterface, PagedResult } from './ApiTypes';
import { generateAmApi } from './BaseApi';

const ALL_DEPLOYMENTS = [
  Constants.CLASSIC_DEPLOYMENT_TYPE_KEY,
  Constants.CLOUD_DEPLOYMENT_TYPE_KEY,
  Constants.FORGEOPS_DEPLOYMENT_TYPE_KEY,
];
const CLASSIC_DEPLOYMENT = [Constants.CLASSIC_DEPLOYMENT_TYPE_KEY];

const NEXT_DESCENDENTS_ACTION = 'nextdescendents';
const TRUE_QUERY_FILTER = 'true';

/**
 * Consists of all AM entities that are not currently being exported elsewhere in Frodo
 */
const AM_ENTITIES: Record<string, EntityInfo> = {
  agentGroups: {
    realm: { path: '/realm-config/agents/groups', version: '2.0' },
    deployments: ALL_DEPLOYMENTS,
    queryFilter: TRUE_QUERY_FILTER,
  },
  //TODO: Not all agents are currently being exported in AgentOps, just Java, Web, and IG agents. This one exports all of them, including SoapSTS, Shared, RemoteConsent, etc. This can be removed once it's possible to export all agents in AgentOps.
  agents: {
    realm: { path: '/realm-config/agents', version: '2.0' },
    deployments: ALL_DEPLOYMENTS,
    action: NEXT_DESCENDENTS_ACTION,
  },
  applicationTypes: {
    realm: { path: '/applicationtypes', version: '1.0' },
    deployments: ALL_DEPLOYMENTS,
    queryFilter: TRUE_QUERY_FILTER,
  },
  authenticationChains: {
    realm: {
      path: '/realm-config/authentication/chains',
      version: '2.0',
      queryFilter: TRUE_QUERY_FILTER,
    },
    global: {
      path: '/global-config/authentication/chains',
      version: '1.0',
      deployments: CLASSIC_DEPLOYMENT,
    },
    deployments: ALL_DEPLOYMENTS,
  },
  authenticationModules: {
    realm: { path: '/realm-config/authentication/modules', version: '2.0' },
    global: {
      path: '/global-config/authentication/modules',
      version: '1.0',
      deployments: CLASSIC_DEPLOYMENT,
    },
    deployments: ALL_DEPLOYMENTS,
    action: NEXT_DESCENDENTS_ACTION,
  },
  authenticationTreesConfiguration: {
    global: {
      path: '/global-config/authentication/authenticationtrees',
      version: '1.0',
    },
    deployments: CLASSIC_DEPLOYMENT,
  },
  conditionTypes: {
    realm: { path: '/conditiontypes', version: '1.0' },
    deployments: ALL_DEPLOYMENTS,
    queryFilter: TRUE_QUERY_FILTER,
  },
  decisionCombiners: {
    realm: { path: '/decisioncombiners', version: '1.0' },
    deployments: ALL_DEPLOYMENTS,
    queryFilter: TRUE_QUERY_FILTER,
  },
  defaultAdvancedProperties: {
    global: {
      path: '/global-config/servers/server-default/properties/advanced',
      version: '1.0',
    },
    deployments: CLASSIC_DEPLOYMENT,
  },
  defaultCtsDataStoreProperties: {
    global: {
      path: '/global-config/servers/server-default/properties/cts',
      version: '1.0',
    },
    deployments: CLASSIC_DEPLOYMENT,
  },
  defaultDirectoryConfiguration: {
    global: {
      path: '/global-config/servers/server-default/properties/directoryConfiguration',
      version: '1.0',
    },
    deployments: CLASSIC_DEPLOYMENT,
  },
  defaultGeneralProperties: {
    global: {
      path: '/global-config/servers/server-default/properties/general',
      version: '1.0',
    },
    deployments: CLASSIC_DEPLOYMENT,
  },
  defaultSdkProperties: {
    global: {
      path: '/global-config/servers/server-default/properties/sdk',
      version: '1.0',
    },
    deployments: CLASSIC_DEPLOYMENT,
  },
  defaultSecurityProperties: {
    global: {
      path: '/global-config/servers/server-default/properties/security',
      version: '1.0',
    },
    deployments: CLASSIC_DEPLOYMENT,
  },
  defaultSessionProperties: {
    global: {
      path: '/global-config/servers/server-default/properties/session',
      version: '1.0',
    },
    deployments: CLASSIC_DEPLOYMENT,
  },
  defaultUmaDataStoreProperties: {
    global: {
      path: '/global-config/servers/server-default/properties/uma',
      version: '1.0',
    },
    deployments: CLASSIC_DEPLOYMENT,
  },
  libraries: {
    realm: { path: '/libraries', version: '1.0' },
    deployments: ALL_DEPLOYMENTS,
    queryFilter: TRUE_QUERY_FILTER,
  },
  secrets: {
    realm: { path: '/realm-config/secrets', version: '2.0' },
    global: {
      path: '/global-config/secrets',
      version: '1.0',
      deployments: CLASSIC_DEPLOYMENT,
    },
    deployments: ALL_DEPLOYMENTS,
    action: NEXT_DESCENDENTS_ACTION,
  },
  serverInformation: {
    realm: { path: '/serverinfo/*', version: '2.0' },
    deployments: ALL_DEPLOYMENTS,
  },
  serverVersion: {
    realm: { path: '/serverinfo/version', version: '1.0' },
    deployments: ALL_DEPLOYMENTS,
  },
  //TODO: This one gives an HTTP 500 error, but it should work according to the documentation:
  // https://backstage.forgerock.com/docs/amster/7.5/entity-reference/sec-amster-entity-sessions.html#sec-amster-entity-sessions-realm-ops-query
  // Same thing happens in Amster as of version 7.5.0. In the future, if this endpoint gets fixed, uncomment the following code
  /*sessions: {
    realm: { path: '/sessions', version: '5.1' },
    deployments: ALL_DEPLOYMENTS,
    queryFilter: TRUE_QUERY_FILTER,
  },*/
  sites: {
    global: { path: '/global-config/sites', version: '1.0' },
    deployments: CLASSIC_DEPLOYMENT,
    queryFilter: TRUE_QUERY_FILTER,
  },
  //TODO: This one gives an HTTP 500 error, but it should work according to the documentation:
  // https://backstage.forgerock.com/docs/amster/7.5/entity-reference/sec-amster-entity-subjectattributes.html#sec-amster-entity-subjectattributes-realm-ops-query
  // Same thing happens in Amster as of version 7.5.0. In the future, if this endpoint gets fixed, uncomment the following code
  /*subjectAttributes: {
    realm: { path: '/subjectattributes', version: '1.0' },
    deployments: ALL_DEPLOYMENTS,
    queryFilter: TRUE_QUERY_FILTER,
  },*/
  subjectTypes: {
    realm: { path: '/subjecttypes', version: '1.0' },
    deployments: ALL_DEPLOYMENTS,
    queryFilter: TRUE_QUERY_FILTER,
  },
  webhookService: {
    realm: {
      path: '/realm-config/webhooks',
      version: '2.0',
      queryFilter: TRUE_QUERY_FILTER,
    },
    global: {
      path: '/global-config/webhooks',
      version: '1.0',
      deployments: CLASSIC_DEPLOYMENT,
    },
    deployments: ALL_DEPLOYMENTS,
  },
  wsEntity: {
    realm: {
      path: '/realm-config/federation/entityproviders/ws',
      version: '2.0',
    },
    deployments: ALL_DEPLOYMENTS,
    queryFilter: TRUE_QUERY_FILTER,
  },
};

function getApiConfig(version: string) {
  return {
    apiVersion: `protocol=2.0,resource=${version}`,
  };
}

export type ConfigSkeleton = {
  global: Record<string, ConfigEntitySkeleton>;
  realm: Record<string, Record<string, ConfigEntitySkeleton>>;
};

/**
 * Contains information about how to get a config entity.
 */
export type EntityInfo = {
  realm?: EntitySubInfo;
  global?: EntitySubInfo;
  deployments?: string[];
  queryFilter?: string;
  action?: string;
};

/**
 * Contains realm or global specific information about how to get a config entity. Settings like deployments, queryFilter, and action will override the values contained in the parent EntityInfo object if they are provided.
 */
export type EntitySubInfo = {
  path: string;
  version: string;
  deployments?: string[];
  queryFilter?: string;
  action?: string;
};

export type ConfigEntitySkeleton =
  | PagedResult<AmConfigEntityInterface>
  | AmConfigEntityInterface
  | undefined;

/**
 * Gets a single am config entity at the given realm and path
 * @param {string} path path to the entity
 * @param {string} version the api resource version
 * @param {string} realm realm that the entity is in (or leave undefined to get global entity)
 * @param {string} queryFilter the query filter
 * @param {string} action the action
 * @returns {Promise<ConfigEntitySkeleton>} the config entity data
 */
export async function getConfigEntity({
  state,
  path,
  version,
  realm,
  queryFilter,
  action,
}: {
  state: State;
  path: string;
  version: string;
  realm?: string;
  queryFilter?: string;
  action?: string;
}): Promise<ConfigEntitySkeleton> {
  const currentRealm = state.getRealm();
  if (realm) {
    state.setRealm(realm);
  }
  const urlString = `${state.getHost()}/json${getRealmPathGlobal(
    !realm,
    state
  )}${path}${queryFilter ? '?_queryFilter=' + queryFilter : ''}${
    action ? '?_action=' + action : ''
  }`;
  try {
    const axios = generateAmApi({
      resource: getApiConfig(version),
      state,
    });
    let data;
    if (action) {
      data = (
        await axios.post(
          urlString,
          {},
          {
            withCredentials: true,
          }
        )
      ).data;
    } else {
      data = (
        await axios.get(urlString, {
          withCredentials: true,
        })
      ).data;
    }
    state.setRealm(currentRealm);
    return data;
  } catch (error) {
    if (error.httpStatus === 404 || error.response?.status === 404) {
      //Ignore case when the entity is not found
    } else {
      printError({
        error,
        message: `Error exporting config entity from resource path '${urlString}'`,
        state,
      });
    }
  }
}

/**
 * Get all other AM config entities
 * @returns {Promise<ConfigSkeleton>} a promise that resolves to a config object containing global and realm config entities
 */
export async function getConfigEntities({
  state,
}: {
  state: State;
}): Promise<ConfigSkeleton> {
  const realms = (await getRealms({ state })).map((r) =>
    !r.name || r.name === '/' || !r.parentPath
      ? 'root'
      : `root${r.parentPath.replace('/', '-')}${
          r.parentPath !== '/' ? '-' : ''
        }${r.name}`
  );
  const stateRealms = realms.map(getRealmUsingExportFormat);
  const entities = {
    global: {},
    realm: Object.fromEntries(realms.map((r) => [r, {}])),
  } as ConfigSkeleton;
  for (const [key, entityInfo] of Object.entries(AM_ENTITIES)) {
    const deploymentAllowed =
      entityInfo.deployments &&
      entityInfo.deployments.includes(state.getDeploymentType());
    if (
      entityInfo.global &&
      ((entityInfo.global.deployments &&
        entityInfo.global.deployments.includes(state.getDeploymentType())) ||
        (entityInfo.global.deployments == undefined && deploymentAllowed))
    ) {
      try {
        entities.global[key] = await getConfigEntity({
          state,
          path: entityInfo.global.path,
          version: entityInfo.global.version,
          queryFilter: entityInfo.global.queryFilter
            ? entityInfo.global.queryFilter
            : entityInfo.queryFilter,
          action: entityInfo.global.action
            ? entityInfo.global.action
            : entityInfo.action,
        });
      } catch (e) {
        printMessage({
          message: `Error exporting '${key}' from resource path '${entityInfo.global.path}': ${e.message}`,
          type: 'error',
          state,
        });
      }
    }
    if (
      entityInfo.realm &&
      ((entityInfo.realm.deployments &&
        entityInfo.realm.deployments.includes(state.getDeploymentType())) ||
        (entityInfo.realm.deployments == undefined && deploymentAllowed))
    ) {
      for (let i = 0; i < realms.length; i++) {
        try {
          entities.realm[realms[i]][key] = await getConfigEntity({
            state,
            path: entityInfo.realm.path,
            version: entityInfo.realm.version,
            realm: stateRealms[i],
            queryFilter: entityInfo.realm.queryFilter
              ? entityInfo.realm.queryFilter
              : entityInfo.queryFilter,
            action: entityInfo.realm.action
              ? entityInfo.realm.action
              : entityInfo.action,
          });
        } catch (e) {
          printMessage({
            message: `Error exporting '${key}' from resource path '${entityInfo.realm.path}': ${e.message}`,
            type: 'error',
            state,
          });
        }
      }
    }
  }
  return entities;
}
