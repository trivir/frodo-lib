import util from 'util';

import Constants from '../shared/Constants';
import { State } from '../shared/State';
import { printMessage } from '../utils/Console';
import { getCurrentRealmPath } from '../utils/ForgeRockUtils';
import { IdObjectSkeletonInterface, PagedResult } from './ApiTypes';
import { generateAmApi } from './BaseApi';

const userURLTemplate = '%s/json%s/users/%s';
const usersURLTemplate = '%s/json%s/users?_queryFilter=true';
const userServicesURLTemplate =
  '%s/json%s/users/%s/services?_action=nextdescendents';
const userConfigURL = '%s/json%s/users/%s/%s?_queryFilter=true';
const userConfigPaths = [
  'devices/2fa/binding',
  'devices/2fa/oath',
  'devices/2fa/push',
  'devices/2fa/webauthn',
  'devices/profile',
  'devices/trusted',
  'groups',
  'oauth2/applications',
  'oauth2/resources/labels',
  'oauth2/resources/sets',
  'policies',
  'uma/auditHistory',
  'uma/pendingrequests',
  'uma/policies',
];

const apiVersion = 'protocol=2.0,resource=1.0';

function getApiConfig() {
  return {
    apiVersion,
  };
}

export type UserSkeleton = IdObjectSkeletonInterface & {
  realm: string;
  username: string;
  mail: string[];
  givenName: string[];
  objectClass: string[];
  dn: string[];
  cn: string[];
  createTimestamp: string[];
  employeeNumber: string[];
  uid: string[];
  universalid: string[];
  inetUserStatus: string[];
  sn: string[];
  telephoneNumber?: string[];
  modifyTimestamp?: string[];
  postalAddress?: string[];
};

export type UserConfigSkeleton = {
  devices: {
    profile: Record<string, IdObjectSkeletonInterface>;
    trusted: Record<string, IdObjectSkeletonInterface>;
    '2fa': {
      binding: Record<string, IdObjectSkeletonInterface>;
      oath: Record<string, IdObjectSkeletonInterface>;
      push: Record<string, IdObjectSkeletonInterface>;
      webauthn: Record<string, IdObjectSkeletonInterface>;
    };
  };
  groups: Record<string, IdObjectSkeletonInterface>;
  oauth2: {
    applications: Record<string, IdObjectSkeletonInterface>;
    resources: {
      labels: Record<string, IdObjectSkeletonInterface>;
      sets: Record<string, IdObjectSkeletonInterface>;
    };
  };
  policies: Record<string, IdObjectSkeletonInterface>;
  services: Record<string, IdObjectSkeletonInterface>;
  uma: {
    auditHistory: Record<string, IdObjectSkeletonInterface>;
    pendingrequests: Record<string, IdObjectSkeletonInterface>;
    policies: Record<string, IdObjectSkeletonInterface>;
  };
};

/**
 * Get user by id
 * @returns {Promise<PagedResult<UserSkeleton>>} a promise that resolves to a user object
 */
export async function getUser({
  userId,
  state,
}: {
  userId: string;
  state: State;
}): Promise<UserSkeleton> {
  const urlString = util.format(
    userURLTemplate,
    state.getHost(),
    getCurrentRealmPath(state),
    userId
  );
  const { data } = await generateAmApi({
    resource: getApiConfig(),
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Get all users
 * @returns {Promise<PagedResult<UserSkeleton>>} a promise that resolves to an array of user objects
 */
export async function getUsers({
  state,
}: {
  state: State;
}): Promise<PagedResult<UserSkeleton>> {
  const urlString = util.format(
    usersURLTemplate,
    state.getHost(),
    getCurrentRealmPath(state)
  );
  const { data } = await generateAmApi({
    //Do not provide API version here, otherwise it will return an HTTP 500 error
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Get user configurations
 * @param {string} userId the user id
 * @returns {Promise<UserConfigSkeleton>} a promise that resolves to an object containing all the user configuration
 */
export async function getUserConfig({
  userId,
  state,
}: {
  userId: string;
  state: State;
}): Promise<UserConfigSkeleton> {
  const userConfig = {} as UserConfigSkeleton;
  //Get user services
  const serviceUrlString = util.format(
    userServicesURLTemplate,
    state.getHost(),
    getCurrentRealmPath(state),
    userId
  );
  try {
    const { data } = await generateAmApi({
      resource: getApiConfig(),
      state,
    }).post(serviceUrlString, undefined, {
      withCredentials: true,
    });
    userConfig.services = data.result;
  } catch (e) {
    printMessage({
      message: `Error exporting service config for user with id '${userId}' from url '${serviceUrlString}': ${e.message}`,
      type: 'error',
      state,
    });
  }
  //Get the rest of the config
  for (const configPath of userConfigPaths) {
    // policies configuration has forbidden access in cloud platform deployments, so only export it when exporting from classic deployments.
    if (
      configPath === 'policies' &&
      state.getDeploymentType() !== Constants.CLASSIC_DEPLOYMENT_TYPE_KEY
    ) {
      continue;
    }
    const urlString = util.format(
      userConfigURL,
      state.getHost(),
      getCurrentRealmPath(state),
      userId,
      configPath
    );
    try {
      const { data } = await generateAmApi({
        resource: getApiConfig(),
        state,
      }).get(urlString, {
        withCredentials: true,
      });
      const pathParts = configPath.split('/');
      let current = userConfig;
      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        if (i === pathParts.length - 1) {
          current[part] = data.result;
          break;
        }
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    } catch (e) {
      if (e.httpStatus === 404 || e.response?.status === 404) {
        //Ignore this case, since some user config does not exist in certain realms. For example, the UMA config does not exist when UMA is not supported for a given realm, resulting in a 404 error.
      } else {
        printMessage({
          message: `Error exporting config for user with id '${userId}' from url '${urlString}': ${e.message}`,
          type: 'error',
          state,
        });
      }
    }
  }
  return userConfig;
}
