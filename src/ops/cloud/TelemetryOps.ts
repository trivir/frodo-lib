import { 
    getTelemetryExporters,
    putOtlpExporter,
    putSplunkExporter,
    TelemetryExporters,
    OtlpExporterSkeleton,
    SplunkExporterSkeleton
} from '../../api/cloud/TelemetryApi'

import { State } from '../../shared/State';
import {
  debugMessage,
 } from '../../utils/Console';

import { FrodoError } from '../FrodoError';

export type TelemetryExporter = {
    category: 'otlp' | 'splunk'
    provider: OtlpExporterSkeleton | SplunkExporterSkeleton
}

export type Telemetry = {
  /**
   * Read all telemetry exporters
   * @returns {Promise<TelemetryExporters>} a promise resolving to all exporters grouped by category
   */
  readTelemetry(): Promise<TelemetryExporters>;
  /**
   * Export telemetry exporters, optionally filtered by id and/or category
   * @param {string} exporterId optional exporter id to filter by
   * @param {'otlp' | 'splunk'} category optional category to filter by
   * @returns {Promise<TelemetryExporter[]>} a promise resolving to an array of matched exporters
   */
  exportTelemetry(
    exporterId?: string,
    category?: 'otlp' | 'splunk'
  ): Promise<TelemetryExporter[]>;
  /**
   * Import (create or update) a single telemetry exporter
   * @param {string} exporterId exporter id
   * @param {'otlp' | 'splunk'} category exporter category
   * @param {OtlpExporterSkeleton | SplunkExporterSkeleton} exporterData exporter object
   * @returns {Promise<OtlpExporterSkeleton | SplunkExporterSkeleton>} a promise resolving to the saved exporter
   */
  importTelemetry(
    exporterId: string,
    category: 'otlp' | 'splunk',
    exporterData: OtlpExporterSkeleton | SplunkExporterSkeleton
  ): Promise<OtlpExporterSkeleton | SplunkExporterSkeleton>;
};

export default (state: State): Telemetry => {
  return {
    async readTelemetry() {
      return readTelemetry({ state });
    },
    async exportTelemetry(exporterId = null, category = null) {
      return exportTelemetry({ exporterId, category, state });
    },
    async importTelemetry(exporterId, category, exporterData) {
      return importTelemetry({ exporterId, category, exporterData, state });
    },
  };
};

export async function readTelemetry({
  state,
}: {
  state: State;
}): Promise<TelemetryExporters> {
  try {
    debugMessage({ message: `TelemetryOps.readTelemetry: start`, state });
    const telemetry = await getTelemetryExporters({ state });
    debugMessage({ message: `TelemetryOps.readTelemetry: end`, state });
    return telemetry;
  } catch (e) {
    throw new FrodoError('Error reading telemetry exporters', e);
  }
}

export async function exportTelemetry({
  exporterId,
  category,
  state,
}: {
  exporterId?: string;
  category?: 'otlp' | 'splunk';
  state: State;
}): Promise<TelemetryExporter[]> {
  try {
    const exporters = await readTelemetry({ state });
    const result: TelemetryExporter[] = [];
    for (const cat of Object.keys(exporters)) {
      if (category && category !== cat) {
        continue;
      }
      for (const provider of exporters[cat]) {
        if (exporterId && exporterId !== provider.id) {
          continue;
        }
        result.push({ category: cat as 'otlp' | 'splunk', provider });
      }
    }
    return result;
  } catch (e) {
    throw new FrodoError('Error exporting telemetry', e);
  }
}

export async function importTelemetry({
  exporterId,
  category,
  exporterData,
  state
}: {
  exporterId: string,
  category: 'otlp' | 'splunk'
  exporterData: OtlpExporterSkeleton | SplunkExporterSkeleton;
  state: State
}): Promise<OtlpExporterSkeleton | SplunkExporterSkeleton> {
  try {
    let response;
    switch (category) {
      case 'otlp':
        response = await putOtlpExporter({
          exporterId,
          exporterData: exporterData as OtlpExporterSkeleton,
          state
        });
        break;
      case 'splunk':
        response = await putSplunkExporter({
          exporterId,
          exporterData: exporterData as SplunkExporterSkeleton,
          state,
        });
        break;
      default: 
      throw new FrodoError(`Unknown telemetry category: ${category}`);
    }
    return response
  }
  catch (e) {
    throw new FrodoError(`Error importing telemetry exporter ${exporterId}`, e);
  }

}