import { ConfigEntitySkeleton, getConfigEntities } from '../api/AmConfigApi';
import { AmConfigEntityInterface, PagedResult } from '../api/ApiTypes';
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

export type AmConfig = {
  /**
   * Export all AM config entities
   * @returns {ConfigEntityExportInterface} promise resolving to a ConfigEntityExportInterface object
   */
  exportAmConfigEntities(): Promise<ConfigEntityExportInterface>;
};

export default (state: State): AmConfig => {
  return {
    async exportAmConfigEntities(): Promise<ConfigEntityExportInterface> {
      return exportAmConfigEntities({ state });
    },
  };
};

export interface ConfigEntityExportInterface {
  meta?: ExportMetaData;
  global: Record<string, Record<string, AmConfigEntityInterface>>;
  realm: Record<
    string,
    Record<string, Record<string, AmConfigEntityInterface>>
  >;
}

/**
 * Create an empty config export template
 * @param {string[]} realms the list of realm names
 * @returns {ConfigEntityExportInterface} an empty config entity export template
 */
export function createConfigEntityExportTemplate({
  state,
  realms,
}: {
  state: State;
  realms: string[];
}): ConfigEntityExportInterface {
  return {
    meta: getMetadata({ state }),
    global: {},
    realm: Object.fromEntries(realms.map((r) => [r, {}])),
  } as ConfigEntityExportInterface;
}

/**
 * Export all AM config entities
 * @returns {ConfigEntityExportInterface} promise resolving to a ConfigEntityExportInterface object
 */
export async function exportAmConfigEntities({
  state,
}: {
  state: State;
}): Promise<ConfigEntityExportInterface> {
  let indicatorId: string;
  try {
    debugMessage({
      message: `AmConfigOps.exportAmConfigEntities: start`,
      state,
    });
    const entities = await getConfigEntities({ state });
    const exportData = createConfigEntityExportTemplate({
      state,
      realms: Object.keys(entities.realm),
    });
    const totalEntities =
      Object.keys(entities.global).length +
      Object.values(entities.realm).reduce(
        (total, realmEntities) => total + Object.keys(realmEntities).length,
        0
      );
    indicatorId = createProgressIndicator({
      total: totalEntities,
      message: 'Exporting am config entities...',
      state,
    });
    exportData.global = processConfigEntitiesForExport({
      state,
      indicatorId,
      entities: entities.global,
    });
    Object.entries(entities.realm).forEach(
      ([key, value]) =>
        (exportData.realm[key] = processConfigEntitiesForExport({
          state,
          indicatorId,
          entities: value,
        }))
    );
    stopProgressIndicator({
      id: indicatorId,
      message: `Exported ${totalEntities} am config entities.`,
      state,
    });
    debugMessage({ message: `AmConfigOps.exportAmConfigEntities: end`, state });
    return exportData;
  } catch (error) {
    stopProgressIndicator({
      id: indicatorId,
      message: `Error exporting am config entities.`,
      status: 'fail',
      state,
    });
    throw new FrodoError(`Error reading am config entities`, error);
  }
}

/**
 * Helper to process the API results into export format
 * @param {Record<string, ConfigEntitySkeleton>} entities the entities being processed
 * @param {string} indicatorId the progress indicator id
 * @returns {Record<string, AmConfigEntityInterface>} the processed entities
 */
function processConfigEntitiesForExport({
  state,
  entities,
  indicatorId,
}: {
  state: State;
  entities: Record<string, ConfigEntitySkeleton>;
  indicatorId: string;
}): Record<string, Record<string, AmConfigEntityInterface>> {
  const exportedEntities = {};
  const entries = Object.entries(entities);
  for (const [key, value] of entries) {
    updateProgressIndicator({
      id: indicatorId,
      message: `Exporting ${key}`,
      state,
    });
    const exportedValue = {};
    if (!value) {
      continue;
    }
    if (!value.result) {
      if ((value as AmConfigEntityInterface)._id) {
        exportedValue[(value as AmConfigEntityInterface)._id] = value;
        exportedEntities[key] = exportedValue;
      } else if (
        (value as AmConfigEntityInterface)._type &&
        (value as AmConfigEntityInterface)._type._id
      ) {
        exportedValue[(value as AmConfigEntityInterface)._type._id] = value;
        exportedEntities[key] = exportedValue;
      } else {
        exportedEntities[key] = value;
      }
      continue;
    }
    const { result } = value as PagedResult<AmConfigEntityInterface>;
    result.forEach((o) => (exportedValue[o._id] = o));
    exportedEntities[key] = exportedValue;
  }
  return exportedEntities;
}
