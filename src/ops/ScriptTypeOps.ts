import {
  EngineConfigurationSkeleton,
  getScriptingContext,
  getScriptingEngineConfiguration,
  getScriptType,
  getScriptTypes,
  ScriptingContextSkeleton,
  ScriptTypeSkeleton,
} from '../api/ScriptTypeApi';
import { State } from '../shared/State';
import {
  createProgressIndicator,
  debugMessage,
  printMessage,
  stopProgressIndicator,
  updateProgressIndicator,
} from '../utils/Console';
import { getMetadata } from '../utils/ExportImportUtils';
import { FrodoError } from './FrodoError';
import { ExportMetaData } from './OpsTypes';

export type ScriptType = {
  /**
   * Create an empty scriptType export template
   * @returns {ScriptTypeExportInterface} an empty scriptType export template
   */
  createScriptTypeExportTemplate(): ScriptTypeExportInterface;
  /**
   * Read scriptType by id
   * @param {string} scriptTypeId ScriptType id
   * @returns {Promise<ScriptTypeSkeleton>} a promise that resolves to a scriptType object
   */
  readScriptType(scriptTypeId: string): Promise<ScriptTypeSkeleton>;
  /**
   * Read all scriptTypes.
   * @returns {Promise<ScriptTypeSkeleton[]>} a promise that resolves to an array of scriptType objects
   */
  readScriptTypes(): Promise<ScriptTypeSkeleton[]>;
  /**
   * Export all scriptTypes. The response can be saved to file as is.
   * @returns {Promise<ScriptTypeExportInterface>} Promise resolving to a ScriptTypeExportInterface object.
   */
  exportScriptTypes(): Promise<ScriptTypeExportInterface>;
};

export default (state: State): ScriptType => {
  return {
    createScriptTypeExportTemplate(): ScriptTypeExportInterface {
      return createScriptTypeExportTemplate({ state });
    },
    async readScriptType(scriptTypeId: string): Promise<ScriptTypeSkeleton> {
      return readScriptType({ scriptTypeId, state });
    },
    async readScriptTypes(): Promise<ScriptTypeSkeleton[]> {
      return readScriptTypes({ state });
    },
    async exportScriptTypes(): Promise<ScriptTypeExportInterface> {
      return exportScriptTypes({ state });
    },
  };
};

export type ScriptTypeExportSkeleton = ScriptTypeSkeleton & {
  engineConfiguration: EngineConfigurationSkeleton;
  context: ScriptingContextSkeleton;
};

export interface ScriptTypeExportInterface {
  meta?: ExportMetaData;
  scripttype: Record<string, ScriptTypeExportSkeleton>;
}

/**
 * Create an empty scriptType export template
 * @returns {ScriptTypeExportInterface} an empty scriptType export template
 */
export function createScriptTypeExportTemplate({
  state,
}: {
  state: State;
}): ScriptTypeExportInterface {
  return {
    meta: getMetadata({ state }),
    scripttype: {},
  };
}

/**
 * Read scriptType by id
 * @param {string} scriptTypeId ScriptType id
 * @returns {Promise<ScriptTypeSkeleton>} a promise that resolves to a scriptType object
 */
export async function readScriptType({
  scriptTypeId,
  state,
}: {
  scriptTypeId: string;
  state: State;
}): Promise<ScriptTypeSkeleton> {
  try {
    return getScriptType({ scriptTypeId, state });
  } catch (error) {
    throw new FrodoError(`Error reading scriptType ${scriptTypeId}`, error);
  }
}

/**
 * Read all scriptTypes.
 * @returns {Promise<ScriptTypeSkeleton[]>} a promise that resolves to an array of scriptType objects
 */
export async function readScriptTypes({
  state,
}: {
  state: State;
}): Promise<ScriptTypeSkeleton[]> {
  try {
    debugMessage({
      message: `ScriptTypeOps.readScriptTypes: start`,
      state,
    });
    const { result } = await getScriptTypes({ state });
    debugMessage({ message: `ScriptTypeOps.readScriptTypes: end`, state });
    return result;
  } catch (error) {
    throw new FrodoError(`Error reading scriptTypes`, error);
  }
}

/**
 * Export all scriptTypes. The response can be saved to file as is.
 * @returns {Promise<ScriptTypeExportInterface>} Promise resolving to a ScriptTypeExportInterface object.
 */
export async function exportScriptTypes({
  state,
}: {
  state: State;
}): Promise<ScriptTypeExportInterface> {
  let indicatorId: string;
  try {
    debugMessage({ message: `ScriptTypeOps.exportScriptTypes: start`, state });
    const exportData = createScriptTypeExportTemplate({ state });
    const scriptTypes = await readScriptTypes({ state });
    indicatorId = createProgressIndicator({
      total: scriptTypes.length,
      message: 'Exporting scriptTypes...',
      state,
    });
    for (const scriptType of scriptTypes) {
      updateProgressIndicator({
        id: indicatorId,
        message: `Exporting scriptType ${scriptType._id}`,
        state,
      });
      try {
        scriptType.engineConfiguration = await getScriptingEngineConfiguration({
          scriptTypeId: scriptType._id,
          state,
        });
      } catch (e) {
        if (e.httpStatus === 404 || e.response?.status === 404) {
          //Ignore this case since not all script types have engine configurations
        } else {
          printMessage({
            message: `Unable to get engine configuration for script type '${scriptType._id}': ${e.message}`,
            type: 'error',
            state,
          });
        }
      }
      try {
        scriptType.context = await getScriptingContext({
          scriptTypeId: scriptType._id,
          state,
        });
      } catch (e) {
        printMessage({
          message: `Unable to get context for script type '${scriptType._id}': ${e.message}`,
          type: 'error',
          state,
        });
      }
      exportData.scripttype[scriptType._id] =
        scriptType as ScriptTypeExportSkeleton;
    }
    stopProgressIndicator({
      id: indicatorId,
      message: `Exported ${scriptTypes.length} scriptTypes.`,
      state,
    });
    debugMessage({ message: `ScriptTypeOps.exportScriptTypes: end`, state });
    return exportData;
  } catch (error) {
    stopProgressIndicator({
      id: indicatorId,
      message: `Error exporting scriptTypes.`,
      status: 'fail',
      state,
    });
    throw new FrodoError(`Error reading scriptTypes`, error);
  }
}
