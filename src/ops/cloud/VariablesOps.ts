import {
  deleteVariable,
  getVariable,
  getVariables,
  putVariable,
  setVariableDescription,
} from '../../api/cloud/VariablesApi';
import State from '../../shared/State';
import {VariablesExportInterface} from "../OpsTypes";
import {debugMessage} from "../utils/Console";
import {getMetadata} from "../utils/ExportImportUtils";
import {decode} from "../../api/utils/Base64";

export default (state: State) => {
  return {
    /**
     * Delete variable by id/name
     * @param {string} variableId variable id/name
     * @returns {Promise<unknown>} a promise that resolves to a variable object
     */
    deleteVariable(variableId: string) {
      return deleteVariable({ variableId, state });
    },

    /**
     * Get variable by id/name
     * @param {string} variableId variable id/name
     * @returns {Promise<unknown>} a promise that resolves to a variable object
     */
    getVariable(variableId: string) {
      return getVariable({ variableId, state });
    },

    /**
     * Get all variables
     * @returns {Promise<unknown[]>} a promise that resolves to an array of variable objects
     */
    getVariables() {
      return getVariables({ state });
    },

    /**
     * Export variable. The response can be saved to file as is.
     * @param variableId variable id/name
     * @returns {Promise<VariablesExportInterface>} Promise resolving to a VariablesExportInterface object.
     */
    async exportVariable(variableId: string): Promise<VariablesExportInterface> {
      return exportVariable({ variableId, state })
    },

    /**
     * Export all variables. The response can be saved to file as is.
     * @returns {Promise<VariablesExportInterface>} Promise resolving to a VariablesExportInterface object.
     */
    async exportVariables(): Promise<VariablesExportInterface> {
      return exportVariables({ state });
    },

    /**
     * Put variable by id/name
     * @param {string} variableId variable id/name
     * @param {string} value variable value
     * @param {string} description variable description
     * @returns {Promise<unknown>} a promise that resolves to a variable object
     */
    putVariable(variableId: string, value: string, description: string) {
      return putVariable({ variableId, value, description, state });
    },

    /**
     * Set variable description
     * @param {string} variableId variable id/name
     * @param {string} description variable description
     * @returns {Promise<unknown>} a promise that resolves to a status object
     */
    setVariableDescription(variableId: string, description: string) {
      return setVariableDescription({
        variableId,
        description,
        state,
      });
    },
  };
};

/**
 * Create an empty variables export template
 * @returns {VariablesExportInterface} an empty variables export template
 */
export function createVariablesExportTemplate({
  state,
}: {
  state: State;
}): VariablesExportInterface {
  return {
    meta: getMetadata({ state }),
    variables: {},
  } as VariablesExportInterface;
}

/**
 * Export variable. The response can be saved to file as is.
 * @param variableId variable id/name
 * @returns {Promise<VariablesExportInterface>} Promise resolving to a VariablesExportInterface object.
 */
export async function exportVariable({
  variableId,
  state,
}: {
  variableId: string;
  state: State;
}): Promise<VariablesExportInterface> {
  debugMessage({ message: `VariablesOps.exportVariable: start`, state });
  const exportData = createVariablesExportTemplate({ state });
  const variable = await getVariable({ variableId, state })
  variable.value = decode(variable.valueBase64);
  delete variable.valueBase64;
  exportData.variables[variable._id] = variable;
  debugMessage({ message: `VariablesOps.exportVariable: end`, state });
  return exportData;
}

/**
 * Export all variables
 * @returns {Promise<VariablesExportInterface>} Promise resolving to an VariablesExportInterface object.
 */
export async function exportVariables({
  state,
}: {
  state: State;
}): Promise<VariablesExportInterface> {
  debugMessage({ message: `VariablesOps.exportVariables: start`, state });
  const exportData = createVariablesExportTemplate({ state });
  const variables = (await getVariables({ state })).result;
  for (const variable of variables) {
    variable.value = decode(variable.valueBase64);
    delete variable.valueBase64;
    exportData.variables[variable._id] = variable;
  }
  debugMessage({ message: `VariablesOps.exportVariables: end`, state });
  return exportData;
}

export {
  deleteVariable,
  getVariable,
  getVariables,
  putVariable,
  setVariableDescription,
};
