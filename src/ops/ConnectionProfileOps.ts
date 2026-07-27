import fs from 'fs';
import path from 'path';

import { IdObjectSkeletonInterface } from '../api/ApiTypes';
import Constants from '../shared/Constants';
import { State } from '../shared/State';
import { debugMessage, printMessage } from '../utils/Console';
import DataProtection from '../utils/DataProtection';
import { isValidUrl, saveJsonToFile } from '../utils/ExportImportUtils';
import { getFrodoHome } from '../utils/FrodoUtils';
import { readServiceAccountScopes } from './cloud/EnvServiceAccountScopesOps';
import {
  createServiceAccount,
  getServiceAccount,
  SERVICE_ACCOUNT_DEFAULT_SCOPES,
} from './cloud/ServiceAccountOps';
import { FrodoError } from './FrodoError';
import { createJwkRsa, createJwks, getJwkRsaPublic, JwkRsa } from './JoseOps';
import { mergeDeep } from '../utils/JsonUtils';

export type ConnectionProfile = {
  /**
   * Get connection profiles file name
   * @returns {string} connection profiles file name
   */
  getConnectionProfilesPath(): string;
  /**
   * Find connection profiles
   * @param {ConnectionsFileInterface} connectionProfiles connection profile object
   * @param {string} host connection name, host url, or unique substring of a connection name
   * @returns {SecureConnectionProfileInterface[]} Array of connection profiles
   */
  findConnectionProfiles(
    connectionProfiles: ConnectionsFileInterface,
    host: string
  ): SecureConnectionProfileInterface[];
  /**
   * Initialize connection profiles
   *
   * This method is called from app.ts and runs before any of the message handlers are registered.
   * Therefore none of the Console message functions will produce any output.
   */
  initConnectionProfiles(): Promise<void>;
  /**
   * Get connection profile by host
   * @param {String} host connection name, host url, or unique substring of a connection name
   * @returns {Object} connection profile or null
   */
  getConnectionProfileByHost(host: string): Promise<ConnectionProfileInterface>;
  /**
   * Get connection profile
   * @returns {Object} connection profile or null
   */
  getConnectionProfile(): Promise<ConnectionProfileInterface>;
  /**
   * Load a connection profile into library state
   * @param {string} host connection name, AM host URL, or unique substring of a connection name
   * @returns {Promise<boolean>} A promise resolving to true if successful
   */
  loadConnectionProfileByHost(host: string): Promise<boolean>;
  /**
   * Load a connection profile into library state
   * @returns {Promise<boolean>} A promise resolving to true if successful
   */
  loadConnectionProfile(): Promise<boolean>;
  /**
   * Save connection profile
   * @param {string} name name of connection profile
   * @param {string} host host url
   * @param {boolean} createOnly if true, fail when the named profile already exists
   * @returns {Promise<boolean>} true if the operation succeeded, false otherwise
   */
  saveConnectionProfile(
    name: string,
    host: string,
    createOnly?: boolean
  ): Promise<boolean>;
  /**
   * Delete connection profile
   * @param {string} host connection name, host url, or unique substring of a connection name
   */
  deleteConnectionProfile(host: string): void;
  /**
   * Create a new service account using auto-generated parameters
   * @returns {Promise<IdObjectSkeletonInterface>} A promise resolving to a service account object
   */
  addNewServiceAccount(): Promise<IdObjectSkeletonInterface>;
};

export default (state: State): ConnectionProfile => {
  return {
    getConnectionProfilesPath(): string {
      return getConnectionProfilesPath({ state });
    },
    findConnectionProfiles(
      connectionProfiles: ConnectionsFileInterface,
      host: string
    ): SecureConnectionProfileInterface[] {
      return findConnectionProfiles({
        connectionProfiles,
        host,
        state,
      });
    },
    async initConnectionProfiles() {
      initConnectionProfiles({ state });
    },
    async getConnectionProfileByHost(
      host: string
    ): Promise<ConnectionProfileInterface> {
      return getConnectionProfileByHost({ host, state });
    },
    async getConnectionProfile(): Promise<ConnectionProfileInterface> {
      return getConnectionProfile({ state });
    },
    async loadConnectionProfileByHost(host: string): Promise<boolean> {
      return loadConnectionProfileByHost({ host, state });
    },
    async loadConnectionProfile(): Promise<boolean> {
      return loadConnectionProfile({ state });
    },
    async saveConnectionProfile(
      name: string,
      host: string,
      createOnly: boolean = false
    ): Promise<boolean> {
      return saveConnectionProfile({ name, host, createOnly, state });
    },
    deleteConnectionProfile(host: string): void {
      deleteConnectionProfile({ host, state });
    },
    async addNewServiceAccount(): Promise<IdObjectSkeletonInterface> {
      return addNewServiceAccount({ state });
    },
  };
};

const fileOptions = {
  indentation: 4,
};

export interface SecureConnectionProfileInterface {
  name?: string;
  tenant: string;
  idmHost?: string;
  allowInsecureConnection?: boolean;
  deploymentType?: string;
  isIGA?: boolean;
  username?: string | null;
  encodedPassword?: string | null;
  logApiKey?: string | null;
  encodedLogApiSecret?: string | null;
  authenticationService?: string | null;
  authenticationHeaderOverrides?: Record<string, string>;
  configurationHeaderOverrides?: Record<string, string>;
  adminClientId?: string | null;
  adminClientRedirectUri?: string | null;
  svcacctId?: string | null;
  encodedSvcacctJwk?: string | null;
  svcacctName?: string | null;
  svcacctScope?: string | null;
  encodedAmsterPrivateKey?: string | null;
}

export interface ConnectionProfileInterface {
  name?: string;
  tenant: string;
  idmHost?: string;
  allowInsecureConnection?: boolean;
  deploymentType?: string;
  isIGA?: boolean;
  username?: string | null;
  password?: string | null;
  logApiKey?: string | null;
  logApiSecret?: string | null;
  authenticationService?: string | null;
  authenticationHeaderOverrides?: Record<string, string>;
  configurationHeaderOverrides?: Record<string, string>;
  adminClientId?: string | null;
  adminClientRedirectUri?: string | null;
  svcacctId?: string | null;
  svcacctJwk?: JwkRsa;
  svcacctName?: string | null;
  svcacctScope?: string | null;
  amsterPrivateKey?: string | null;
}

export interface ConnectionsFileInterface {
  [name: string]: SecureConnectionProfileInterface;
}

type ConnectionsFileRoot = {
  version?: string;
  connections?: ConnectionsFileInterface;
  [key: string]: unknown;
};

export class AmbiguousConnError extends FrodoError {
  constructor(host: string, profiles: SecureConnectionProfileInterface[]) {
    super(
      `Substring '${host}' is too ambiguous and could match any of these connection profiles:\n  - ${profiles
        .map((profile) =>
          profile.name ? `${profile.name} (${profile.tenant})` : profile.tenant
        )
        .join('\n  - ')}`
    );
    this.name = 'AmbiguousConnError';
  }
}

const legacyProfileFilename = '.frodorc';
const newProfileFilename = 'Connections.json';
export const CURRENT_CONNECTIONS_FILE_VERSION = '2';

const emptyConnectionsFile = (): ConnectionsFileRoot => ({
  version: CURRENT_CONNECTIONS_FILE_VERSION,
  connections: {},
});

/**
 * Get connection profiles file name
 * @param {State} state library state
 * @returns {String} connection profiles file name
 */
export function getConnectionProfilesPath({ state }: { state: State }): string {
  debugMessage({
    message: `ConnectionProfileOps.getConnectionProfilesPath: start`,
    state,
  });
  const profilesPath =
    state.getConnectionProfilesPath() ||
    process.env[Constants.FRODO_CONNECTION_PROFILES_PATH_KEY] ||
    path.join(getFrodoHome(), newProfileFilename);
  debugMessage({
    message: `ConnectionProfileOps.getConnectionProfilesPath: end [profilesPath=${profilesPath}]`,
    state,
  });
  return profilesPath;
}

/**
 * Find connection profiles
 * @param {ConnectionsFileInterface} connectionProfiles connection profile object
 * @param {string} host connection name, host url, or unique substring of a connection name
 * @param {State} state library state
 * @returns {SecureConnectionProfileInterface[]} Array of connection profiles
 */
export function findConnectionProfiles({
  connectionProfiles,
  host,
  state,
}: {
  connectionProfiles: ConnectionsFileInterface;
  host: string;
  state: State;
}): SecureConnectionProfileInterface[] {
  // Exact match on connection name
  if (connectionProfiles[host]) {
    debugMessage({
      message: `ConnectionProfileOps.findConnectionProfiles: '${host}' matched connection name, including in result set`,
      state,
    });
    return [{ ...connectionProfiles[host], name: host }];
  }
  // Exact match on tenant URL
  const exactTenantMatches: SecureConnectionProfileInterface[] = [];
  for (const name in connectionProfiles) {
    const profile = connectionProfiles[name];
    if (profile.tenant === host) {
      debugMessage({
        message: `ConnectionProfileOps.findConnectionProfiles: '${host}' matched tenant URL for '${name}', including in result set`,
        state,
      });
      exactTenantMatches.push({ ...profile, name });
    }
  }
  if (exactTenantMatches.length > 0) {
    return exactTenantMatches;
  }
  // Substring match on connection name
  const profiles: SecureConnectionProfileInterface[] = [];
  for (const name in connectionProfiles) {
    if (name.includes(host)) {
      debugMessage({
        message: `ConnectionProfileOps.findConnectionProfiles: '${host}' matched as substring in connection name '${name}', including in result set`,
        state,
      });
      profiles.push({ ...connectionProfiles[name], name });
    }
  }
  return profiles;
}

/**
 * Migrate from .frodorc to Connections.json
 */
function migrateFromLegacyProfile() {
  try {
    const legacyPath = path.join(getFrodoHome(), legacyProfileFilename);
    const newPath = path.join(getFrodoHome(), newProfileFilename);
    if (!fs.existsSync(legacyPath) && !fs.existsSync(newPath)) {
      // no connections file (old or new), create empty new one
      fs.writeFileSync(
        newPath,
        JSON.stringify(emptyConnectionsFile(), null, fileOptions.indentation)
      );
    } else if (fs.existsSync(legacyPath) && !fs.existsSync(newPath)) {
      // old exists, new one does not - so copy old to new one
      fs.copyFileSync(legacyPath, newPath);
      // for now, just add a "deprecated" suffix. May delete the old file
      // in a future release
      fs.renameSync(legacyPath, `${legacyPath}.deprecated`);
    }
    // in other cases, where
    // (both old and new exist) OR (only new one exists) don't do anything
  } catch (error) {
    throw new FrodoError(
      `Error migrating from legacy connection profile`,
      error
    );
  }
}

/**
 * Initialize connection profiles
 *
 * This method is called from app.ts and runs before any of the message handlers are registered.
 * Therefore none of the Console message functions will produce any output.
 * @param {State} state library state
 */
export async function initConnectionProfiles({ state }: { state: State }) {
  debugMessage({
    message: `ConnectionProfileOps.initConnectionProfiles: start`,
    state,
  });
  const dataProtection = new DataProtection({
    pathToMasterKey: state.getMasterKeyPath(),
    state,
  });
  try {
    // create connections.json file if it doesn't exist
    const filename = getConnectionProfilesPath({ state });
    const folderName = path.dirname(filename);
    if (!fs.existsSync(filename)) {
      if (!fs.existsSync(folderName)) {
        debugMessage({
          message: `ConnectionProfileOps.initConnectionProfiles: folder does not exist: ${folderName}, creating...`,
          state,
        });
        fs.mkdirSync(folderName, { recursive: true });
      }
      if (!fs.existsSync(filename)) {
        debugMessage({
          message: `ConnectionProfileOps.initConnectionProfiles: file does not exist: ${filename}, creating...`,
          state,
        });
        fs.writeFileSync(
          filename,
          JSON.stringify(emptyConnectionsFile(), null, fileOptions.indentation)
        );
      }
    }
    // migrate to version 2 nested shape and encrypt secrets
    else {
      migrateFromLegacyProfile();
      const data = fs.readFileSync(filename, 'utf8');
      let connectionsData: ConnectionsFileRoot = JSON.parse(data);
      let convert = false;

      // migrate v1 flat files to nested version 2
      const hasNestedConnections =
        typeof connectionsData.connections === 'object' &&
        connectionsData.connections !== null;
      const needsMigration =
        connectionsData.version !== CURRENT_CONNECTIONS_FILE_VERSION ||
        !hasNestedConnections;
      if (needsMigration) {
        debugMessage({
          message: `ConnectionProfileOps.initConnectionProfiles: migrating connections file to version ${CURRENT_CONNECTIONS_FILE_VERSION}`,
          state,
        });
        const connections: ConnectionsFileInterface = {};
        const rootProfileKeys = Object.keys(connectionsData).filter(
          (key) => key !== 'version' && key !== 'connections'
        );
        const entries: [
          string,
          SecureConnectionProfileInterface & { alias?: string },
        ][] =
          rootProfileKeys.length > 0
            ? rootProfileKeys.map((key) => [
                key,
                connectionsData[key] as SecureConnectionProfileInterface & {
                  alias?: string;
                },
              ])
            : Object.entries(connectionsData.connections || {});
        for (const [key, profile] of entries) {
          if (typeof profile !== 'object' || !profile) continue;
          const name =
            profile.alias && String(profile.alias).length > 0
              ? profile.alias
              : key;

          // split mutually exclusive auth methods for v2
          const hasServiceAccount =
            Boolean(profile.svcacctId) && Boolean(profile.encodedSvcacctJwk);
          const hasUserAccount =
            Boolean(profile.username) && Boolean(profile.encodedPassword);

          if (hasServiceAccount && hasUserAccount) {
            const saConn = `service-account|${name}`;
            const adminConn = `admin-account|${name}`;

            // service account
            const saProfile: SecureConnectionProfileInterface = {
              ...profile,
              tenant: profile.tenant || key,
            };
            delete saProfile.username;
            delete saProfile.encodedPassword;
            delete (saProfile as { alias?: string }).alias;
            connections[saConn] = saProfile;

            // admin account
            const adminProfile: SecureConnectionProfileInterface = {
              ...profile,
              tenant: profile.tenant || key,
            };
            delete adminProfile.svcacctId;
            delete adminProfile.encodedSvcacctJwk;
            delete (adminProfile as { alias?: string }).alias;
            connections[adminConn] = adminProfile;
          } else {
            const migrated: SecureConnectionProfileInterface = {
              ...profile,
              tenant: profile.tenant || key,
            };
            delete (migrated as { alias?: string }).alias;
            connections[name] = migrated;
          }
        }
        connectionsData = {
          version: CURRENT_CONNECTIONS_FILE_VERSION,
          connections,
        };
        convert = true;
      }

      // encrypt the password and logApiSecret
      if (!connectionsData.connections) {
        connectionsData.connections = {};
      }
      for (const conn of Object.keys(connectionsData.connections)) {
        const profile = connectionsData.connections[conn];
        if (profile['password']) {
          convert = true;
          profile.encodedPassword = await dataProtection.encrypt(
            profile['password']
          );
          delete profile['password'];
        }
        if (profile['logApiSecret']) {
          convert = true;
          profile.encodedLogApiSecret = await dataProtection.encrypt(
            profile['logApiSecret']
          );
          delete profile['logApiSecret'];
        }
        if (profile['svcacctJwk']) {
          convert = true;
          profile.encodedSvcacctJwk = await dataProtection.encrypt(
            profile['svcacctJwk']
          );
          delete profile['svcacctJwk'];
        }
        if (profile['amsterPrivateKey']) {
          convert = true;
          profile.encodedAmsterPrivateKey = await dataProtection.encrypt(
            profile['amsterPrivateKey']
          );
          delete profile['amsterPrivateKey'];
        }
      }
      if (convert) {
        fs.writeFileSync(
          filename,
          JSON.stringify(connectionsData, null, fileOptions.indentation)
        );
      }
    }
    debugMessage({
      message: `ConnectionProfileOps.initConnectionProfiles: end`,
      state,
    });
  } catch (error) {
    throw new FrodoError(`Error initializing connection profiles`, error);
  }
}

/**
 * Get connection profile by host
 * @param {string} host connection name, host url, or unique substring of a connection name
 * @param {State} state library state
 * @returns {Promise<ConnectionProfileInterface>} connection profile
 */
export async function getConnectionProfileByHost({
  host,
  state,
}: {
  host: string;
  state: State;
}): Promise<ConnectionProfileInterface> {
  const dataProtection = new DataProtection({
    pathToMasterKey: state.getMasterKeyPath(),
    state,
  });
  const filename = getConnectionProfilesPath({ state });
  if (!fs.statSync(filename, { throwIfNoEntry: false })) {
    throw new FrodoError(`Connection profiles file ${filename} not found`);
  }
  const connectionsData: ConnectionsFileRoot = JSON.parse(
    fs.readFileSync(filename, 'utf8')
  );
  let profiles = findConnectionProfiles({
    connectionProfiles: connectionsData.connections || {},
    host,
    state,
  });
  if (profiles.length == 0) {
    throw new FrodoError(`No connection profile found matching '${host}'`);
  }
  if (profiles.length > 1) {
    const getAccType = (name) => {
      if (name.startsWith('service-account|'))
        return { acc: 'sa', base: name.slice(16) };
      if (name.startsWith('admin-account|'))
        return { acc: 'user', base: name.slice(14) };
      return null;
    };
    const a = getAccType(profiles[0]?.name ?? '');
    const b = getAccType(profiles[1]?.name ?? '');
    const matchingPair =
      profiles.length === 2 && a && b && a.base === b.base && a.acc !== b.acc;
    if (matchingPair) {
      profiles = profiles.filter((p) => p.name.startsWith('service-account|'));
      printMessage({
        message: `There are both service account and user account credentials associated with connection '${host}', proceeding with service account`,
        type: 'warn',
        state,
      });
    } else {
      throw new AmbiguousConnError(host, profiles);
    }
  }
  try {
    const connectionProfile = {
      name: profiles[0].name ? profiles[0].name : null,
      tenant: profiles[0].tenant,
      idmHost: profiles[0].idmHost ? profiles[0].idmHost : null,
      allowInsecureConnection: profiles[0].allowInsecureConnection,
      deploymentType: profiles[0].deploymentType,
      isIGA: profiles[0].isIGA,
      username: profiles[0].username ? profiles[0].username : null,
      password: profiles[0].encodedPassword
        ? await dataProtection.decrypt(profiles[0].encodedPassword)
        : null,
      logApiKey: profiles[0].logApiKey ? profiles[0].logApiKey : null,
      logApiSecret: profiles[0].encodedLogApiSecret
        ? await dataProtection.decrypt(profiles[0].encodedLogApiSecret)
        : null,
      authenticationService: profiles[0].authenticationService
        ? profiles[0].authenticationService
        : null,
      authenticationHeaderOverrides: profiles[0].authenticationHeaderOverrides
        ? profiles[0].authenticationHeaderOverrides
        : {},
      configurationHeaderOverrides: profiles[0].configurationHeaderOverrides
        ? profiles[0].configurationHeaderOverrides
        : {},
      adminClientId: profiles[0].adminClientId
        ? profiles[0].adminClientId
        : null,
      adminClientRedirectUri: profiles[0].adminClientRedirectUri
        ? profiles[0].adminClientRedirectUri
        : null,
      svcacctName: profiles[0].svcacctName ? profiles[0].svcacctName : null,
      svcacctId: profiles[0].svcacctId ? profiles[0].svcacctId : null,
      svcacctJwk: profiles[0].encodedSvcacctJwk
        ? await dataProtection.decrypt(profiles[0].encodedSvcacctJwk)
        : null,
      svcacctScope: profiles[0].svcacctScope ? profiles[0].svcacctScope : null,
      amsterPrivateKey: profiles[0].encodedAmsterPrivateKey
        ? await dataProtection.decrypt(profiles[0].encodedAmsterPrivateKey)
        : null,
    };
    debugMessage({
      message: `ConnectionProfileOps.getConnectionProfileByHost: retrieved connection profile for host '${host}': ${JSON.stringify(connectionProfile, null, 2)}`,
      state,
    });
    return connectionProfile;
  } catch (error) {
    throw new FrodoError(`Error decrypting connection profile`, error);
  }
}

/**
 * Get connection profile
 * @param {Object} params Params object
 * @param {State} params.state State object
 * @returns {Promise<ConnectionProfileInterface>} A promise resolving to a connection profile or null
 */
export async function getConnectionProfile({
  state,
}: {
  state: State;
}): Promise<ConnectionProfileInterface> {
  return getConnectionProfileByHost({ host: state.getHost(), state });
}

/**
 * Load a connection profile into library state
 * @param {Object} params Params object
 * @param {string} params.host connection name, AM host URL, or unique substring of a connection name
 * @param {State} params.state State object
 * @returns {Promise<boolean>} A promise resolving to true if successful
 */
export async function loadConnectionProfileByHost({
  host,
  state,
}: {
  host: string;
  state: State;
}): Promise<boolean> {
  const conn = await getConnectionProfileByHost({ host, state });
  if (conn.name) state.setName(conn.name);
  state.setHost(conn.tenant);
  state.setIdmHost(state.getIdmHost() || conn.idmHost);
  state.setAllowInsecureConnection(conn.allowInsecureConnection);
  state.setDeploymentType(state.getDeploymentType() || conn.deploymentType);
  state.setIsIGA(
    state.getIsIGA() === undefined ? conn.isIGA : state.getIsIGA()
  );
  state.setAdminClientId(state.getAdminClientId() || conn.adminClientId);
  state.setAdminClientRedirectUri(
    state.getAdminClientRedirectUri() || conn.adminClientRedirectUri
  );
  state.setUsername(conn.username);
  state.setPassword(conn.password);
  state.setLogApiKey(conn.logApiKey);
  state.setLogApiSecret(conn.logApiSecret);
  if (conn.authenticationService && !state.getAuthenticationService()) {
    state.setAuthenticationService(conn.authenticationService);
  }
  if (conn.authenticationHeaderOverrides) {
    state.setAuthenticationHeaderOverrides(
      mergeDeep(
        state.getAuthenticationHeaderOverrides(),
        conn.authenticationHeaderOverrides
      )
    );
  }
  if (conn.configurationHeaderOverrides) {
    state.setConfigurationHeaderOverrides(
      mergeDeep(
        state.getConfigurationHeaderOverrides(),
        conn.configurationHeaderOverrides
      )
    );
  }
  state.setServiceAccountId(conn.svcacctId);
  state.setServiceAccountJwk(conn.svcacctJwk);
  state.setServiceAccountScope(conn.svcacctScope);
  state.setAmsterPrivateKey(conn.amsterPrivateKey);
  return true;
}

/**
 * Load a connection profile into library state
 * @param {Object} params Params object
 * @param {State} params.state State object
 * @returns {Promise<boolean>} A promise resolving to true if successful
 */
export async function loadConnectionProfile({
  state,
}: {
  state: State;
}): Promise<boolean> {
  return loadConnectionProfileByHost({ host: state.getHost(), state });
}

/**
 * Save connection profile
 * @param {string} name name of connection profile
 * @param {string} host host url
 * @param {boolean} createOnly if true, fail when the named profile already exists
 * @returns {Promise<boolean>} true if the operation succeeded, false otherwise
 */
export async function saveConnectionProfile({
  name,
  host,
  createOnly = false,
  state,
}: {
  name: string;
  host: string;
  createOnly?: boolean;
  state: State;
}): Promise<boolean> {
  try {
    debugMessage({
      message: `ConnectionProfileOps.saveConnectionProfile: start`,
      state,
    });

    if (!name) {
      throw new FrodoError(
        `No connection name provided. A name is required to save a connection profile.`
      );
    }
    if (!host || !isValidUrl(host)) {
      throw new FrodoError(
        `Invalid or missing host URL '${host}'. Provide a valid URL for the connection.`
      );
    }

    const dataProtection = new DataProtection({
      pathToMasterKey: state.getMasterKeyPath(),
      state,
    });
    const filename = getConnectionProfilesPath({ state });
    debugMessage({
      message: `Saving connection profile '${name}' in ${filename}`,
      state,
    });

    let fileData: ConnectionsFileRoot = emptyConnectionsFile();
    if (fs.statSync(filename, { throwIfNoEntry: false })) {
      const data = fs.readFileSync(filename, 'utf8');
      fileData = JSON.parse(data);
      if (!fileData.connections) fileData.connections = {};

      if (
        createOnly &&
        (fileData.connections[name] ||
          fileData.connections[`service-account|${name}`] ||
          fileData.connections[`admin-account|${name}`])
      ) {
        throw new FrodoError(
          `Connection profile '${name}' already exists. Use 'conn edit' to modify an existing connection profile.`
        );
      }
    }

    const profile: SecureConnectionProfileInterface = { tenant: host };

    state.setHost(host);

    // idm host
    if (state.getIdmHost()) profile.idmHost = state.getIdmHost();

    // allow insecure connection
    if (state.getAllowInsecureConnection())
      profile.allowInsecureConnection = state.getAllowInsecureConnection();

    // deployment type
    if (state.getDeploymentType())
      profile.deploymentType = state.getDeploymentType();

    // is IGA
    if (state.getDeploymentType() === Constants.CLOUD_DEPLOYMENT_TYPE_KEY)
      profile.isIGA = !!state.getIsIGA();

    // admin client id
    if (state.getAdminClientId())
      profile.adminClientId = state.getAdminClientId();

    // admin client redirect uri
    if (state.getAdminClientRedirectUri())
      profile.adminClientRedirectUri = state.getAdminClientRedirectUri();

    // user account
    if (state.getUsername()) profile.username = state.getUsername();
    if (state.getPassword())
      profile.encodedPassword = await dataProtection.encrypt(
        state.getPassword()
      );

    // log API
    if (state.getLogApiKey()) profile.logApiKey = state.getLogApiKey();
    if (state.getLogApiSecret())
      profile.encodedLogApiSecret = await dataProtection.encrypt(
        state.getLogApiSecret()
      );

    // service account
    if (state.getServiceAccountId()) {
      profile.svcacctId = state.getServiceAccountId();
      if (state.getBearerToken()) {
        profile.svcacctName = (
          await getServiceAccount({
            serviceAccountId: state.getServiceAccountId(),
            state,
          })
        ).name;
      }
    }
    if (state.getServiceAccountJwk()) {
      profile.encodedSvcacctJwk = await dataProtection.encrypt(
        state.getServiceAccountJwk()
      );
    }
    if (
      state.getUseBearerTokenForAmApis() &&
      state.getBearerTokenMeta() &&
      state.getBearerTokenMeta().scope !== profile.svcacctScope
    ) {
      profile.svcacctScope = state.getBearerTokenMeta().scope;
    }

    // Amster account
    if (state.getAmsterPrivateKey()) {
      profile.encodedAmsterPrivateKey = await dataProtection.encrypt(
        state.getAmsterPrivateKey()
      );
    }

    // advanced settings
    if (state.getAuthenticationService()) {
      profile.authenticationService = state.getAuthenticationService();
      debugMessage({
        message:
          'Advanced setting: Authentication Service: ' +
          state.getAuthenticationService(),
        state,
      });
    }
    if (
      state.getAuthenticationHeaderOverrides() &&
      Object.entries(state.getAuthenticationHeaderOverrides()).length
    ) {
      profile.authenticationHeaderOverrides =
        state.getAuthenticationHeaderOverrides();
      debugMessage({
        message: 'Advanced setting: Authentication Header Overrides: ',
        state,
      });
      debugMessage({
        message: state.getAuthenticationHeaderOverrides(),
        state,
      });
    }
    if (
      state.getConfigurationHeaderOverrides() &&
      Object.entries(state.getConfigurationHeaderOverrides()).length
    ) {
      profile.configurationHeaderOverrides =
        state.getConfigurationHeaderOverrides();
      debugMessage({
        message: 'Advanced setting: Configuration Header Overrides: ',
        state,
      });
      debugMessage({
        message: state.getConfigurationHeaderOverrides(),
        state,
      });
    }

    // name is in-memory only (object key); do not persist on the profile object
    delete profile.name;
    // alias is no longer supported
    delete (profile as { alias?: string }).alias;

    // split mutually exclusive auth methods
    const hasServiceAccount =
      Boolean(profile.svcacctId) && Boolean(profile.encodedSvcacctJwk);
    const hasAdminAccount =
      Boolean(profile.username) && Boolean(profile.encodedPassword);

    const existing = fileData.connections[name];
    const saConn = `service-account|${name}`;
    const adminConn = `admin-account|${name}`;

    // saving both service account and admin account credentials
    if (hasServiceAccount && hasAdminAccount) {
      const saOnlyProfile = { ...profile };
      delete saOnlyProfile.username;
      delete saOnlyProfile.encodedPassword;
      fileData.connections[saConn] = saOnlyProfile;

      const adminOnlyProfile = { ...profile };
      delete adminOnlyProfile.svcacctId;
      delete adminOnlyProfile.encodedSvcacctJwk;
      fileData.connections[adminConn] = adminOnlyProfile;

      // saving service account credentials to a tenant with admin account credentials already saved
    } else if (
      hasServiceAccount &&
      existing?.username &&
      existing?.encodedPassword
    ) {
      const adminOnlyProfile = { ...existing };
      delete adminOnlyProfile.svcacctId;
      delete adminOnlyProfile.encodedSvcacctJwk;
      const saOnlyProfile = { ...profile };
      delete saOnlyProfile.username;
      delete saOnlyProfile.encodedPassword;
      fileData.connections[adminConn] = adminOnlyProfile;
      fileData.connections[saConn] = saOnlyProfile;
      delete fileData.connections[name];

      // saving admin account credentials to a tenant with service account credentials already saved
    } else if (
      hasAdminAccount &&
      existing?.svcacctId &&
      existing?.encodedSvcacctJwk
    ) {
      const saOnlyProfile = { ...existing };
      delete saOnlyProfile.username;
      delete saOnlyProfile.encodedPassword;
      const adminOnlyProfile = { ...profile };
      delete adminOnlyProfile.svcacctId;
      delete adminOnlyProfile.encodedSvcacctJwk;
      fileData.connections[saConn] = saOnlyProfile;
      fileData.connections[adminConn] = adminOnlyProfile;
      delete fileData.connections[name];
    } else {
      fileData.connections[name] = profile;
    }
    fileData.version = CURRENT_CONNECTIONS_FILE_VERSION;

    // sort connections by name
    const orderedConnections = Object.keys(fileData.connections)
      .sort()
      .reduce((obj, key) => {
        obj[key] = fileData.connections[key];
        return obj;
      }, {} as ConnectionsFileInterface);

    // save profiles
    saveJsonToFile({
      data: {
        version: CURRENT_CONNECTIONS_FILE_VERSION,
        connections: orderedConnections,
      },
      filename,
      includeMeta: false,
      state,
    });
    debugMessage({
      message: `Saved connection profile '${name}' (${host}) in ${filename}`,
      state,
    });
    debugMessage({
      message: `ConnectionProfileOps.saveConnectionProfile: end [true]`,
      state,
    });
    return true;
  } catch (error) {
    throw new FrodoError(`Error saving connection profile`, error);
  }
}

/**
 * Delete connection profile
 * @param {String} host connection name, host url, or unique substring of a connection name
 */
export function deleteConnectionProfile({
  host,
  state,
}: {
  host: string;
  state: State;
}) {
  const filename = getConnectionProfilesPath({ state });
  if (!fs.statSync(filename, { throwIfNoEntry: false })) {
    throw new FrodoError(`Connection profiles file ${filename} not found`);
  }
  const data = fs.readFileSync(filename, 'utf8');
  const connectionsData: ConnectionsFileRoot = JSON.parse(data);
  if (!connectionsData.connections) connectionsData.connections = {};
  const profiles = findConnectionProfiles({
    connectionProfiles: connectionsData.connections,
    host,
    state,
  });
  if (profiles.length == 0) {
    throw new FrodoError(`No connection profile found matching '${host}'`);
  }
  if (profiles.length > 1) {
    const getAuthType = (name) => {
      if (name.startsWith('service-account|'))
        return { acc: 'sa', base: name.slice(16) };
      if (name.startsWith('admin-account|'))
        return { acc: 'user', base: name.slice(14) };
      return null;
    };
    const a = getAuthType(profiles[0]?.name ?? '');
    const b = getAuthType(profiles[1]?.name ?? '');
    const matching =
      profiles.length === 2 && a && b && a.base === b.base && a.acc !== b.acc;
    if (!matching) {
      throw new AmbiguousConnError(host, profiles);
    }
    printMessage({
      message: `There are both service account and user account credentials associated with connection '${host}', deleting both profiles`,
      type: 'warn',
      state,
    });
  }
  for (const profile of profiles) {
    delete connectionsData.connections[profile.name];
  }
  connectionsData.version = CURRENT_CONNECTIONS_FILE_VERSION;
  fs.writeFileSync(filename, JSON.stringify(connectionsData, null, 2));
}

/**
 * Create a new service account using auto-generated parameters
 * @returns {Promise<IdObjectSkeletonInterface>} A promise resolving to a service account object
 */
export async function addNewServiceAccount({
  state,
}: {
  state: State;
}): Promise<IdObjectSkeletonInterface> {
  try {
    debugMessage({
      message: `ConnectionProfileOps.addNewServiceAccount: start`,
      state,
    });
    const name = `frodo-${state.getUsername()}-${new Date().toISOString()}`;
    debugMessage({
      message: `ConnectionProfileOps.addNewServiceAccount: name=${name}...`,
      state,
    });
    const description = null;
    const availableScopes = (await readServiceAccountScopes({
      flatten: true,
      state,
    })) as string[];
    const scope = SERVICE_ACCOUNT_DEFAULT_SCOPES.filter((scope) =>
      availableScopes.includes(scope)
    );
    const jwkPrivate = await createJwkRsa();
    const jwkPublic = await getJwkRsaPublic(jwkPrivate);
    const jwks = createJwks(jwkPublic);
    const sa = await createServiceAccount({
      name,
      description,
      accountStatus: 'active',
      scopes: scope,
      jwks,
      state,
    });
    debugMessage({
      message: `ConnectionProfileOps.addNewServiceAccount: id=${sa._id}`,
      state,
    });
    state.setServiceAccountId(sa._id);
    state.setServiceAccountJwk(jwkPrivate);
    debugMessage({
      message: `ConnectionProfileOps.addNewServiceAccount: end`,
      state,
    });
    return sa;
  } catch (error) {
    throw new FrodoError(`Error creating new service account`, error);
  }
}
