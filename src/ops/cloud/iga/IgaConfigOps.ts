import {
  getConfig,
  getConfigByKey,
  putConfig,
  putConfigByKey,
  CommonsConfig,
} from '../../../api/cloud/iga/IgaConfigApi';
import { State } from '../../../shared/State';
import { FrodoError } from '../../FrodoError';
import { ExportMetaData, ResultCallback } from '../../OpsTypes';
import {
  createProgressIndicator,
  debugMessage,
  stopProgressIndicator,
  updateProgressIndicator,
} from '../../../utils/Console';
import {
  getMetadata,
  getResult,
} from '../../../utils/ExportImportUtils';

export type IgaConfig = {
  /**
   * Read all Identity Governance configuration properties
   * @returns {Promise<CommonsConfig>} a promise that resolves to the full commons config object
   */
  readConfig(): Promise<CommonsConfig>;
  /**
   * Read Identity Governance configuration properties for a given category
   * @param {string} key the configuration category key ('iga_access_request', 'iga_global')
   * @returns {Promise<CommonsConfig>} a promise that resolves to the config object for the given key
   */
  readConfigByKey(key: string): Promise<CommonsConfig>;
  /**
   * Export all Identity Governance configuration properties
   * @param {ResultCallback<ConfigExportInterface>} resultCallback Optional callback to process individual results
   * @returns {Promise<ConfigExportInterface>} a promise that resolves to a config export object
   */
  exportConfig(resultCallback?: ResultCallback<ConfigExportInterface>): Promise<ConfigExportInterface>;
  /**
   * Export Identity Governance configuration properties for a given category
   * @param {string} key the configuration category key ('iga_access_request', 'iga_global')
   * @returns {Promise<ConfigExportInterface>} a promise that resolves to a config export object
   */
  exportConfigByKey(key: string): Promise<ConfigExportInterface>;
  /**
   * Import all Identity Governance configuration properties
   * @param {ConfigExportInterface} importData the config export object
   * @returns {Promise<CommonsConfig>} a promise that resolves to the updated commons config object
   */
  importConfig(importData: ConfigExportInterface): Promise<CommonsConfig>;
  /**
   * Import Identity Governance configuration properties for a given category
   * @param {string} key the configuration category key ('iga_access_request', 'iga_global')
   * @param {ConfigExportInterface} importData the config export object
   * @returns {Promise<CommonsConfig>} a promise that resolves to the updated config object for the given key
   */
  importConfigByKey(key: string, importData: ConfigExportInterface): Promise<CommonsConfig>;
  /**
   * Update all Identity Governance configuration properties
   * @param {CommonsConfig} configData the full configuration object. Must include all current configurations — omitted keys will revert to defaults
   * @returns {Promise<CommonsConfig>} a promise that resolves to the updated commons config object
   */
  updateConfig(configData: CommonsConfig): Promise<CommonsConfig>;
  /**
   * Update Identity Governance configuration properties for a given category
   * @param {string} key the configuration category key ('iga_access_request', 'iga_global')
   * @param {CommonsConfig} configData the configuration object for the given category
   * @returns {Promise<CommonsConfig>} a promise that resolves to the updated config object for the given key
   */
  updateConfigByKey(key: string, configData: CommonsConfig): Promise<CommonsConfig>;
};


export default (state: State): IgaConfig => {
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
    exportConfig(
      resultCallback?: ResultCallback<ConfigExportInterface>
    ): Promise<ConfigExportInterface> {
      return exportConfig({
        resultCallback,
        state,
      });
    },
    exportConfigByKey(key: string): Promise<ConfigExportInterface> {
      return exportConfigByKey({
        key,
        state,
      });
    },
    importConfig(
      importData: ConfigExportInterface
    ): Promise<CommonsConfig> {
      return importConfig({
        importData,
        state,
      });
    },
    importConfigByKey(
      key: string,
      importData: ConfigExportInterface
    ): Promise<CommonsConfig> {
      return importConfigByKey({
        key,
        importData,
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
      key: string,
      configData: CommonsConfig
    ): Promise<CommonsConfig> {
      return updateConfigByKey({
        key,
        configData,
        state,
      });
    },
  };
};

export interface ConfigExportInterface {
  meta?: ExportMetaData;
  config: CommonsConfig;
}

/**
 * Read iga config
 * @returns {Promise<CommonsConfig>} a promise that resolves to a iga config object
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
 * Read iga config by its name.
 * @param {string} key the iga config name
 * @returns {Promise<CommonsConfig>} a promise that resolves to a iga config object
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
    throw new FrodoError(`Error reading IGA config ${key}`, error);
  }
}

/**
 * Export Identity Governance configuration properties for a given category
 * @param {string} key the configuration category key ('iga_access_request', 'iga_global')
 * @returns {Promise<ConfigExportInterface>} a promise that resolves to a config export object
 */
export async function exportConfigByKey({
  key,
  state,
}: {
  key: string;
  state: State;
}): Promise<ConfigExportInterface> {
  try {
    debugMessage({
      message: `IgaConfigOps.exportConfigByKey: start`,
      state,
    });
    const config = await readConfigByKey({
      key,
      state,
    });
    const exportData = createConfigExportTemplate({ state });
    exportData.config[key] = config;
    debugMessage({
      message: `IgaConfigOps.exportConfigByKey: end`,
      state,
    });
    return exportData;
  } catch (error) {
    throw new FrodoError(`Error exporting IGA config for key ${key}`, error);
  }
}

/**
 * Export all Identity Governance configuration properties
 * @param {ResultCallback<ConfigExportInterface>} resultCallback Optional callback to process individual results
 * @returns {Promise<ConfigExportInterface>} a promise that resolves to a config export object
 */
export async function exportConfig({
  resultCallback = void 0,
  state,
}: {
  resultCallback?: ResultCallback<ConfigExportInterface>;
  state: State;
}): Promise<ConfigExportInterface> {
  let indicatorId: string;
  try {
    debugMessage({
      message: `IgaConfigOps.exportConfig: start`,
      state,
    });
    const config = await readConfig({ state });
    const keys = Object.keys(config) as (keyof CommonsConfig)[];
    indicatorId = createProgressIndicator({
      total: keys.length,
      message: 'Exporting IGA config...',
      state,
    });
    const exportData = createConfigExportTemplate({ state });
    for (const key of keys) {
      updateProgressIndicator({
        id: indicatorId,
        message: `Exporting IGA config key ${key}...`,
        state,
      });
      const keyExport = await getResult(
        resultCallback,
        `Error exporting IGA config key ${key}`,
        exportConfigByKey,
        {
          key,
          state,
        }
      );
      if (keyExport) {
        Object.assign(exportData.config, keyExport.config);
      }
    }
    stopProgressIndicator({
      id: indicatorId,
      message: `Exported ${keys.length} IGA config keys`,
      status: 'success',
      state,
    });
    debugMessage({
      message: `IgaConfigOps.exportConfig: end`,
      state,
    });
    return exportData;
  } catch (error) {
    stopProgressIndicator({
      id: indicatorId,
      message: `Error exporting IGA config`,
      status: 'fail',
      state,
    });
    throw new FrodoError(`Error exporting IGA config`, error);
  }
}
/**
 * Create an empty config export template
 * @returns {ConfigExportInterface} an empty config export template
 */
export function createConfigExportTemplate({
  state,
}: {
  state: State;
}): ConfigExportInterface {
  return {
    meta: getMetadata({ state }),
    config: {},
  };
}
/**
 * Import all Identity Governance configuration properties
 * @param {ConfigExportInterface} importData the config export object
 * @returns {Promise<CommonsConfig>} a promise that resolves to the updated commons config object
 */
export async function importConfig({
  importData,
  state,
}: {
  importData: ConfigExportInterface;
  state: State;
}): Promise<CommonsConfig> {
  try {
    debugMessage({ message: `IgaConfigOps.importConfig: start`, state });
    const result = await updateConfig({
      configData: importData.config as CommonsConfig,
      state,
    });
    debugMessage({ message: `IgaConfigOps.importConfig: end`, state });
    return result;
  } catch (error) {
    throw new FrodoError(`Error importing IGA config`, error);
  }
}

/**
 * Import Identity Governance configuration properties for a given category
 * @param {string} key the configuration category key ('iga_access_request', 'iga_global')
 * @param {ConfigExportInterface} importData the config export object
 * @returns {Promise<CommonsConfig>} a promise that resolves to the updated config object for the given key
 */
export async function importConfigByKey({
  key,
  importData,
  state,
}: {
  key: string;
  importData: ConfigExportInterface;
  state: State;
}): Promise<CommonsConfig> {
  try {
    debugMessage({ message: `IgaConfigOps.importConfigByKey: start`, state });
    const configData = importData.config[key as keyof CommonsConfig];
    if (!configData) {
      throw new FrodoError(
        `Key '${key}' not found in import data`
      );
    }
    const result = await updateConfigByKey({
      key,
      configData: configData as CommonsConfig,
      state,
    });
    debugMessage({ message: `IgaConfigOps.importConfigByKey: end`, state });
    return result;
  } catch (error) {
    throw new FrodoError(`Error importing IGA config for key ${key}`, error);
  }
}
/**
 * Update iga config
 * @param {CommonsConfig} configData the iga config object
 * @returns {Promise<CommonsConfig>} a promise that resolves to a iga config object
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
 * Import iga config
 * @param {string} key The iga config key. If supplied, only the iga config of that key is imported.
 * @param {CommonsConfig} configData iga config import data
 * @param {ResultCallback<CommonsConfig>} resultCallback Optional callback to process individual results
 * @returns {Promise<CommonsConfig[]>} the imported iga config
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
