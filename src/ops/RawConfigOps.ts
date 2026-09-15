import {
  getRawAm,
  getRawEnv,
  getRawIdm,
  getRawIga,
  getRawKeys,
  getRawMonitoringLogs,
  getRawWs,
  putRawAm,
  putRawEnv,
  putRawIdm,
  putRawIga,
  putRawKeys,
  putRawMonitoringLogs,
  putRawWs,
} from '../api/RawConfigApi';
import { State } from '../shared/State';
import { FrodoError } from './FrodoError';

export type RawConfig = {
  /**
   * Exports raw configuration
   * @param {string} endpoint The path to the resource
   * @returns {Promise<object>} The raw configuration JSON object at the specified path
   */
  exportRawConfig(endpoint: string): Promise<object>;
  /**
   * Imports raw configuration
   * @param {string} endpoint The path to the resource
   * @param {object} payload the import payload that will be pushed
   * @returns {Promise<object>} The raw configuration JSON object at the specified path
   */
  importRawConfig(
    endpoint: string,
    payload: object
  ): Promise<object>;
};

export default (state: State): RawConfig => {
  return {
    async exportRawConfig(
      endpoint: string
    ): Promise<object> {
      return exportRawConfig({ endpoint, state });
    },
    async importRawConfig(
      endpoint: string,
      payload: object
    ): Promise<object> {
      return importRawConfig({ endpoint, payload, state });
    },
  };
};


/**
 * Exports raw configuration
 * @param {string} endpoint The path to the resource
 * @returns {Promise<object>} The raw configuration JSON object at the specified path
 */
export async function exportRawConfig({
  endpoint,
  state,
}: {
  endpoint: string;
  state: State;
}): Promise<object> {
  try {
    // remove starting slash from path if it exists
    endpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    const urlParts: string[] = endpoint.split('/');
    const startPath: string = urlParts[0];

    switch (startPath) {
      case 'openidm':
        return await getRawIdm({ endpoint, state });
      case 'environment':
        return await getRawEnv({ endpoint, state });
      case 'iga':
        return await getRawIga({ endpoint, state });
      case 'keys':
        return await getRawKeys({ endpoint, state });
      case 'monitoring':
        return await getRawMonitoringLogs({ endpoint, state });
      case 'ws':
        return await getRawWs({ endpoint, state });
      case state.getHost().substring(state.getHost().lastIndexOf('/') + 1):
        return await getRawAm({ endpoint, state });
      default:
        throw new FrodoError(
          `Endpoints that start with ${startPath} are not supported`
        );
    }
  } catch (error) {
    throw new FrodoError(
      `Error in exportRawConfig with endpoint: ${endpoint}`,
      error
    );
  }
}

/**
 * Imports raw configuration
 * @param {string} endpoint The path to the resource
 * @param {object} payload the import payload that will be pushed
 * @returns {Promise<object>} The raw configuration JSON object at the specified path
 */
export async function importRawConfig({
  endpoint,
  payload,
  state,
}: {
  endpoint: string;
  payload: Object;
  state: State;
}): Promise<object> {
  try {
    // remove starting slash from path if it exists
    endpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;

    const urlParts: string[] = endpoint.split('/');
    const startPath: string = urlParts[0];

    switch (startPath) {
      case 'openidm':
        return await putRawIdm({
          endpoint,
          payload,
          state,
        });
      case 'environment':
        return await putRawEnv({
          endpoint,
          payload,
          state,
        });
      case 'iga':
        return await putRawIga({
          endpoint,
          payload,
          state,
        });
      case 'keys':
        return await putRawKeys({
          endpoint,
          payload,
          state,
        });
      case 'monitoring':
        return await putRawMonitoringLogs({
          endpoint,
          payload,
          state,
        });
      case 'ws':
        return await putRawWs({
          endpoint,
          payload,
          state,
        });
      case state.getHost().substring(state.getHost().lastIndexOf('/') + 1):
        return await putRawAm({
          endpoint,
          payload,
          state,
        });
      default:
        throw new FrodoError(
          `Endpoints that start with ${startPath} are not supported`
        );
    }
  } catch (error) {
    throw new FrodoError(
      `Error in importRawConfig with endpoint: ${endpoint}`,
      error
    );
  }
}
