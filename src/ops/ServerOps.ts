import {
  getServer,
  getServerProperties,
  getServers,
  ServerPropertiesSkeleton,
  ServerSkeleton,
} from '../api/ServerApi';
import { State } from '../shared/State';
import {
  createProgressIndicator,
  debugMessage,
  stopProgressIndicator,
  updateProgressIndicator,
} from '../utils/Console';
import { getMetadata } from '../utils/ExportImportUtils';
import { FrodoError } from './FrodoError';
import { ExportMetaData } from './OpsTypes';

export type Server = {
  /**
   * Create an empty server export template
   * @returns {ServerExportInterface} an empty server export template
   */
  createServerExportTemplate(): ServerExportInterface;
  /**
   * Read server by id
   * @param {string} serverId Server id
   * @returns {Promise<ServerSkeleton>} a promise that resolves to a server object
   */
  readServer(serverId: string): Promise<ServerSkeleton>;
  /**
   * Read server by url
   * @param {string} serverUrl Server url
   * @returns {Promise<ServerSkeleton>} a promise that resolves to a server object
   */
  readServerByUrl(serverUrl: string): Promise<ServerSkeleton>;
  /**
   * Read all servers.
   * @returns {Promise<ServerSkeleton[]>} a promise that resolves to an array of server objects
   */
  readServers(): Promise<ServerSkeleton[]>;
  /**
   * Export a single server by id. The response can be saved to file as is.
   * @param {string} serverId Server id
   * @returns {Promise<ServerExportInterface>} Promise resolving to a ServerExportInterface object.
   */
  exportServer(serverId: string): Promise<ServerExportInterface>;
  /**
   * Export a single server by url. The response can be saved to file as is.
   * @param {string} serverUrl Server url
   * @returns {Promise<ServerExportInterface>} Promise resolving to a ServerExportInterface object.
   */
  exportServerByUrl(serverUrl: string): Promise<ServerExportInterface>;
  /**
   * Export all servers. The response can be saved to file as is.
   * @returns {Promise<ServerExportInterface>} Promise resolving to a ServerExportInterface object.
   */
  exportServers(): Promise<ServerExportInterface>;
};

export default (state: State): Server => {
  return {
    createServerExportTemplate(): ServerExportInterface {
      return createServerExportTemplate({ state });
    },
    async readServer(serverId: string): Promise<ServerSkeleton> {
      return readServer({ serverId, state });
    },
    async readServerByUrl(serverUrl: string): Promise<ServerSkeleton> {
      return readServerByUrl({ serverUrl, state });
    },
    async readServers(): Promise<ServerSkeleton[]> {
      return readServers({ state });
    },
    async exportServer(serverId: string): Promise<ServerExportInterface> {
      return exportServer({ serverId, state });
    },
    async exportServerByUrl(serverUrl: string): Promise<ServerExportInterface> {
      return exportServerByUrl({ serverUrl, state });
    },
    async exportServers(): Promise<ServerExportInterface> {
      return exportServers({ state });
    },
  };
};

export type ServerExportSkeleton = ServerSkeleton & {
  properties: ServerPropertiesSkeleton;
};

export interface ServerExportInterface {
  meta?: ExportMetaData;
  server: Record<string, ServerExportSkeleton>;
}

/**
 * Create an empty server export template
 * @returns {ServerExportInterface} an empty server export template
 */
export function createServerExportTemplate({
  state,
}: {
  state: State;
}): ServerExportInterface {
  return {
    meta: getMetadata({ state }),
    server: {},
  };
}

/**
 * Read server by id
 * @param {string} serverId Server id
 * @returns {Promise<ServerSkeleton>} a promise that resolves to a server object
 */
export async function readServer({
  serverId,
  state,
}: {
  serverId: string;
  state: State;
}): Promise<ServerSkeleton> {
  try {
    return getServer({ serverId, state });
  } catch (error) {
    throw new FrodoError(`Error reading server ${serverId}`, error);
  }
}

/**
 * Read server by url
 * @param {string} serverUrl Server url
 * @returns {Promise<ServerSkeleton>} a promise that resolves to a server object
 */
export async function readServerByUrl({
  serverUrl,
  state,
}: {
  serverUrl: string;
  state: State;
}): Promise<ServerSkeleton> {
  try {
    const servers = await readServers({ state });
    const found = servers.filter((server) => server.url === serverUrl);
    if (found.length === 1) {
      return found[0];
    }
    if (found.length > 1) {
      throw new Error(`Multiple servers with the url '${serverUrl}' found!`);
    }
    throw new Error(`Server '${serverUrl}' not found!`);
  } catch (error) {
    throw new FrodoError(`Error reading server ${serverUrl}`, error);
  }
}

/**
 * Read all servers.
 * @returns {Promise<ServerSkeleton[]>} a promise that resolves to an array of server objects
 */
export async function readServers({
  state,
}: {
  state: State;
}): Promise<ServerSkeleton[]> {
  try {
    debugMessage({
      message: `ServerOps.readServers: start`,
      state,
    });
    const { result } = await getServers({ state });
    debugMessage({ message: `ServerOps.readServers: end`, state });
    return result;
  } catch (error) {
    throw new FrodoError(`Error reading servers`, error);
  }
}

/**
 * Export a single server by id. The response can be saved to file as is.
 * @param {string} serverId Server id
 * @returns {Promise<ServerExportInterface>} Promise resolving to a ServerExportInterface object.
 */
export async function exportServer({
  serverId,
  state,
}: {
  serverId: string;
  state: State;
}): Promise<ServerExportInterface> {
  try {
    const server = (await readServer({
      serverId,
      state,
    })) as ServerExportSkeleton;
    server.properties = await getServerProperties({ serverId, state });
    const exportData = createServerExportTemplate({ state });
    exportData.server[serverId] = server as ServerExportSkeleton;
    return exportData;
  } catch (error) {
    throw new FrodoError(`Error exporting server ${serverId}`, error);
  }
}

/**
 * Export a single server by url. The response can be saved to file as is.
 * @param {string} serverUrl Server url
 * @returns {Promise<ServerExportInterface>} Promise resolving to a ServerExportInterface object.
 */
export async function exportServerByUrl({
  serverUrl,
  state,
}: {
  serverUrl: string;
  state: State;
}): Promise<ServerExportInterface> {
  try {
    const server = (await readServerByUrl({
      serverUrl,
      state,
    })) as ServerExportSkeleton;
    server.properties = await getServerProperties({
      serverId: server._id,
      state,
    });
    const exportData = createServerExportTemplate({ state });
    exportData.server[server._id] = server as ServerExportSkeleton;
    return exportData;
  } catch (error) {
    throw new FrodoError(`Error exporting server ${serverUrl}`, error);
  }
}

/**
 * Export all servers. The response can be saved to file as is.
 * @returns {Promise<ServerExportInterface>} Promise resolving to a ServerExportInterface object.
 */
export async function exportServers({
  state,
}: {
  state: State;
}): Promise<ServerExportInterface> {
  let indicatorId: string;
  try {
    debugMessage({ message: `ServerOps.exportServers: start`, state });
    const exportData = createServerExportTemplate({ state });
    const servers = await readServers({ state });
    indicatorId = createProgressIndicator({
      total: servers.length,
      message: 'Exporting servers...',
      state,
    });
    for (const server of servers) {
      updateProgressIndicator({
        id: indicatorId,
        message: `Exporting server ${server.url}`,
        state,
      });
      server.properties = await getServerProperties({
        serverId: server._id,
        state,
      });
      exportData.server[server._id] = server as ServerExportSkeleton;
    }
    stopProgressIndicator({
      id: indicatorId,
      message: `Exported ${servers.length} servers.`,
      state,
    });
    debugMessage({ message: `ServerOps.exportServers: end`, state });
    return exportData;
  } catch (error) {
    stopProgressIndicator({
      id: indicatorId,
      message: `Error exporting servers.`,
      status: 'fail',
      state,
    });
    throw new FrodoError(`Error reading servers`, error);
  }
}
