import { VersionOfSecretStatus } from '../../api/ApiTypes';
import {
  createNewVersionOfSecret,
  deleteSecret,
  deleteVersionOfSecret,
  getSecret,
  getSecrets,
  getSecretVersions,
  getVersionOfSecret,
  putSecret,
  setSecretDescription,
  setStatusOfVersionOfSecret,
} from '../../api/cloud/SecretsApi';
import State from '../../shared/State';
import {SecretsExportInterface} from "../OpsTypes";
import {debugMessage} from "../utils/Console";
import {getMetadata} from "../utils/ExportImportUtils";

export default (state: State) => {
  return {
    /**
     * Get all secrets
     * @returns {Promise<unknown[]>} a promise that resolves to an array of secrets
     */
    async getSecrets() {
      return getSecrets({ state });
    },

    /**
     * Get secret
     * @param secretId secret id/name
     * @returns {Promise<unknown>} a promise that resolves to a secret
     */
    async getSecret(secretId: string) {
      return getSecret({ secretId, state });
    },

    /**
     * Export secret. The response can be saved to file as is.
     * @param secretId secret id/name
     * @returns {Promise<SecretsExportInterface>} Promise resolving to a SecretsExportInterface object.
     */
    async exportSecret(secretId: string): Promise<SecretsExportInterface> {
      return exportSecret({ secretId, state })
    },

    /**
     * Export all secrets. The response can be saved to file as is.
     * @returns {Promise<SecretsExportInterface>} Promise resolving to a SecretsExportInterface object.
     */
    async exportSecrets(): Promise<SecretsExportInterface> {
      return exportSecrets({ state });
    },

    /**
     * Create secret
     * @param {string} secretId secret id/name
     * @param {string} value secret value
     * @param {string} description secret description
     * @param {string} encoding secret encoding (only `generic` is supported)
     * @param {boolean} useInPlaceholders flag indicating if the secret can be used in placeholders
     * @returns {Promise<unknown>} a promise that resolves to a secret
     */
    async putSecret(
      secretId: string,
      value: string,
      description: string,
      encoding = 'generic',
      useInPlaceholders = true
    ) {
      return putSecret({
        secretId,
        value,
        description,
        encoding,
        useInPlaceholders,
        state,
      });
    },

    /**
     * Set secret description
     * @param {string} secretId secret id/name
     * @param {string} description secret description
     * @returns {Promise<unknown>} a promise that resolves to a status object
     */
    async setSecretDescription(secretId: string, description: string) {
      return setSecretDescription({ secretId, description, state });
    },

    /**
     * Delete secret
     * @param {string} secretId secret id/name
     * @returns {Promise<unknown>} a promise that resolves to a secret object
     */
    async deleteSecret(secretId: string) {
      return deleteSecret({ secretId, state });
    },

    /**
     * Get secret versions
     * @param {string} secretId secret id/name
     * @returns {Promise<unknown>} a promise that resolves to an array of secret versions
     */
    async getSecretVersions(secretId: string) {
      return getSecretVersions({ secretId, state });
    },

    /**
     * Create new secret version
     * @param {string} secretId secret id/name
     * @param {string} value secret value
     * @returns {Promise<unknown>} a promise that resolves to a version object
     */
    async createNewVersionOfSecret(secretId: string, value: string) {
      return createNewVersionOfSecret({ secretId, value, state });
    },

    /**
     * Get version of secret
     * @param {string} secretId secret id/name
     * @param {string} version secret version
     * @returns {Promise<unknown>} a promise that resolves to a version object
     */
    async getVersionOfSecret(secretId: string, version: string) {
      return getVersionOfSecret({ secretId, version, state });
    },

    /**
     * Update the status of a version of a secret
     * @param {string} secretId secret id/name
     * @param {string} version secret version
     * @param {VersionOfSecretStatus} status status
     * @returns {Promise<unknown>} a promise that resolves to a status object
     */
    async setStatusOfVersionOfSecret(
      secretId: string,
      version: string,
      status: VersionOfSecretStatus
    ) {
      return setStatusOfVersionOfSecret({
        secretId,
        version,
        status,
        state,
      });
    },

    /**
     * Delete version of secret
     * @param {string} secretId secret id/name
     * @param {string} version secret version
     * @returns {Promise<unknown>} a promise that resolves to a version object
     */
    async deleteVersionOfSecret(secretId: string, version: string) {
      return deleteVersionOfSecret({ secretId, version, state });
    },
  };
};

/**
 * Create an empty secrets export template
 * @returns {SecretsExportInterface} an empty secrets export template
 */
export function createSecretsExportTemplate({
  state,
}: {
  state: State;
}): SecretsExportInterface {
  return {
    meta: getMetadata({ state }),
    secrets: {},
  } as SecretsExportInterface;
}

/**
 * Export secret. The response can be saved to file as is.
 * @param secretId secret id/name
 * @returns {Promise<SecretsExportInterface>} Promise resolving to a SecretsExportInterface object.
 */
export async function exportSecret({
  secretId,
  state,
}: {
  secretId: string;
  state: State;
}): Promise<SecretsExportInterface> {
  debugMessage({ message: `VariablesOps.exportSecret: start`, state });
  const exportData = createSecretsExportTemplate({ state });
  const secret = await getSecret({ secretId, state })
  exportData.secrets[secret._id] = secret;
  debugMessage({ message: `VariablesOps.exportSecret: end`, state });
  return exportData;
}


/**
 * Export all secrets
 * @returns {Promise<SecretsExportInterface>} Promise resolving to an SecretsExportInterface object.
 */
export async function exportSecrets({
  state,
}: {
  state: State;
}): Promise<SecretsExportInterface> {
  debugMessage({ message: `SecretsOps.exportSecrets: start`, state });
  const exportData = createSecretsExportTemplate({ state });
  const secrets = (await getSecrets({ state })).result;
  for (const secret of secrets) {
    exportData.secrets[secret._id] = secret;
  }
  debugMessage({ message: `SecretsOps.exportSecrets: end`, state });
  return exportData;
}

export {
  createNewVersionOfSecret,
  deleteSecret,
  deleteVersionOfSecret,
  getSecret,
  getSecrets,
  getSecretVersions,
  putSecret,
  setSecretDescription,
  setStatusOfVersionOfSecret,
};
