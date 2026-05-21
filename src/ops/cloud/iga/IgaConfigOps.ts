import {
  getConfig,
  getConfigByKey,
  putConfig,
  putConfigByKey,
  CommonsConfig,
} from '../../../api/cloud/iga/IgaConfigApi';
import { State } from '../../../shared/State';
import { FrodoError } from '../../FrodoError';

export type Config = {
  /**
   * Read all Identity Governance configuration properties
   * @returns {Promise<CommonsConfig>} a promise that resolves to the full commons config object
   */
  readConfig(): Promise<CommonsConfig>;
  /**
   * Read Identity Governance configuration properties for a given category
   * @param {string} key the configuration category key (e.g. 'iga_access_request', 'iga_global')
   * @returns {Promise<CommonsConfig>} a promise that resolves to the config object for the given key
   */
  readConfigByKey(key: string): Promise<CommonsConfig>;
  /**
   * Update all Identity Governance configuration properties
   * @param {CommonsConfig} configData the full configuration object. Must include all current configurations — omitted keys will revert to defaults
   * @returns {Promise<CommonsConfig>} a promise that resolves to the updated commons config object
   */
  updateConfig(ConfigData): Promise<CommonsConfig>;
  /**
   * Update Identity Governance configuration properties for a given category
   * @param {string} key the configuration category key (e.g. 'iga_access_request', 'iga_global')
   * @param {CommonsConfig} configData the configuration object for the given category
   * @returns {Promise<CommonsConfig>} a promise that resolves to the updated config object for the given key
   */
  updateConfigByKey(configData: CommonsConfig, key): Promise<CommonsConfig>;
};
export default (state: State): Config => {
  return {
    readConfig(): Promise<CommonsConfig> {
      return readConfig({ state });
    },
    readConfigByKey(key: string): Promise<CommonsConfig> {
      return readConfigByKey({
        key,
        state,
      });
    },

    updateConfig(configData: CommonsConfig): Promise<CommonsConfig> {
      return updateConfig({
        configData,
        state,
      });
    },
    updateConfigByKey(
      configData: CommonsConfig,
      key: string
    ): Promise<CommonsConfig> {
      return putConfigByKey({
        configData,
        key,

        state,
      });
    },
  };
};

/**
 * Read request form
 * @param {string} formId the request form id
 * @returns {Promise<CommonsConfig>} a promise that resolves to a request form object
 */
export async function readConfig({
  state,
}: {
  state: State;
}): Promise<CommonsConfig> {
  try {
    return await getConfig({ state });
  } catch (error) {
    throw new FrodoError(`Error reading IGA config`, error);
  }
}

/**
 * Read request form by its name. Since names are NOT necessarily unique, this method will throw if it finds multiple of the same name.
 * @param {string} key the request form name
 * @returns {Promise<CommonsConfig>} a promise that resolves to a request form object
 */
export async function readConfigByKey({
  key,
  state,
}: {
  key: string;
  state: State;
}): Promise<CommonsConfig> {
  try {
    const config = await getConfigByKey({
      key,
      state,
    });

    return config;
  } catch (error) {
    throw new FrodoError(`Error reading request form IGA config ${key}`, error);
  }
}

/**
 * Update request form
 * @param {string} formId the request form id
 * @param {CommonsConfig} formData the request form object
 * @returns {Promise<CommonsConfig>} a promise that resolves to a request form object
 */
export async function updateConfig({
  configData,
  state,
}: {
  configData: CommonsConfig;
  state: State;
}): Promise<CommonsConfig> {
  try {
    const configDataCopy = { ...configData };

    return await putConfig({
      configData: configDataCopy,

      state,
    });
  } catch (error) {
    throw new FrodoError(`Error updating IGA config'`, error);
  }
}

/**
 * Import request forms
 * @param {string} formId The request form id. If supplied, only the request form of that id is imported. Takes priority over formName if it is provided.
 * @param {string} formName The request form name. If supplied, only the request form(s) of that name is imported.
 * @param {RequestFormExportInterface} importData request form import data
 * @param {RequestFormImportOptions} options import options
 * @param {ResultCallback<CommonsConfig>} resultCallback Optional callback to process individual results
 * @returns {Promise<CommonsConfig[]>} the imported request forms
 */
export async function updateConfigByKey({
  configData,
  key,
  state,
}: {
  configData: CommonsConfig;
  key: string;
  state: State;
}): Promise<CommonsConfig> {
  try {
    return await putConfigByKey({ key, configData, state });
  } catch (error) {
    throw new FrodoError(`Error updating IGA config for key ${key}`, error);
  }
}
