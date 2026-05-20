import {
    getScope,
    getScopeName,
    getScopeEntity,
    getScopeEntitySchema,
    createScope as _createScope,
    queryScopes,
    deleteScope as _deleteScope,
    putScope,
    ScopeSkeleton,
    ScopeEntitySchemaResponse,
    ScopeEntityResponse
  } from '../../../api/cloud/iga/IgaScopeApi';
  import { State } from '../../../shared/State';
  import {
    createProgressIndicator,
    debugMessage,
    stopProgressIndicator,
    updateProgressIndicator,
  } from '../../../utils/Console';
  import { getMetadata, getResult } from '../../../utils/ExportImportUtils';
  import { FrodoError } from '../../FrodoError';
  import { ExportMetaData, ResultCallback } from '../../OpsTypes';
  
  export type Scope = {
    /**
     * Create scope
     * @param {ScopeSkeleton} scopeData the scope object
     * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
     */
    createScope(scopeData: ScopeSkeleton): Promise<ScopeSkeleton>;
    /**
     * Read scope
     * @param {string} id the scope id
     * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
     */
    readScope(id: string): Promise<ScopeSkeleton>;
    /**
     * Read scope by its display name
     * @param {string} name the scope display name
     * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
     */
    readScopeByName(name: string): Promise<ScopeSkeleton>;
    /**
     * Read all scopes
     * @returns {Promise<ScopeSkeleton[]>} a promise that resolves to an array of scope objects
     */
    readScopes(): Promise<ScopeSkeleton[]>;
    /**
     * Read all scope entity types
     * @returns {Promise<ScopeEntityResponse>} a promise that resolves to the list of entity types
     */
    readScopeEntities(): Promise<ScopeEntityResponse>; 
    /**
     * Read the schema for a scope entity type
     * @param {string} entityName the entity name (e.g. 'user')
     * @returns {Promise<ScopeEntitySchemaResponse>} a promise that resolves to the entity schema
     */
    readScopeEntitySchema(entityName: string): Promise<ScopeEntitySchemaResponse>;
    /**
     * Export scope
     * @param {string} id the scope id
     * @returns {Promise<ScopeExportInterface>} a promise that resolves to a scope export object
     */ 
    exportScope(
      id: string,
    ): Promise<ScopeExportInterface>;
    /**
     * Export scope by its display name
     * @param {string} name the scope display name
     * @returns {Promise<ScopeExportInterface>} a promise that resolves to a scope export object
     */
    exportScopeByName(
      name: string,
    ): Promise<ScopeExportInterface>;
    /**
     * Export all scopes
     * @returns {Promise<ScopeExportInterface>} a promise that resolves to a scope export object
     */
    exportScopes(
      resultCallback?: ResultCallback<ScopeExportInterface>
    ): Promise<ScopeExportInterface>;
    /**
     * Update scope
     * @param {string} id the scope id
     * @param {ScopeSkeleton} scopeData the scope object
     * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
     */
    updateScope(id: string, scopeData: ScopeSkeleton): Promise<ScopeSkeleton>;
    /**
     * Import scopes
     * @param {string} id The scope id. If supplied, only the scope of that id is imported. Takes priority over name if they are all provided.
     * @param {string} name The scope display name. If supplied, only the scope of that display name is imported.
     * @param {ScopeExportInterface} importData scope import data
     * @param {ResultCallback<ScopeSkeleton>} resultCallback Optional callback to process individual results
     * @returns {Promise<ScopeSkeleton[]>} the imported scopes
     */
    importScopes(
      importData: ScopeExportInterface,
      id?: string,
      name?: string,
      resultCallback?: ResultCallback<ScopeSkeleton>
    ): Promise<ScopeSkeleton[]>;
    /**
     * Delete scope
     * @param {string} id the scope id
     * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
     */
    deleteScope(id: string): Promise<ScopeSkeleton>;
    /**
     * Delete scope by its display name
     * @param {string} name the scope display name
     * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
     */
    deleteScopeByName(name: string): Promise<ScopeSkeleton>;
    /**
     * Delete scopes
     * @param {ResultCallback} resultCallback Optional callback to process individual results
     * @returns {Promise<ScopeSkeleton[]>} promise that resolves to an array of scope objects
     */
    deleteScopes(
      resultCallback?: ResultCallback<ScopeSkeleton>
    ): Promise<ScopeSkeleton[]>;
    
  };
  
  export default (state: State): Scope => {
    return {
      createScope(
        scopeData: ScopeSkeleton
      ): Promise<ScopeSkeleton> {
        return _createScope({
          scopeData,
          state,
        });
      },
      readScope(id: string): Promise<ScopeSkeleton> {
        return getScope({
          id,
          state,
        });
      },
      readScopeByName(name: string): Promise<ScopeSkeleton> {
        return getScopeName({
          name,
          state,
        });
      },
      readScopes(): Promise<ScopeSkeleton[]> {
        return queryScopes({
          state,
        });
      },
      readScopeEntities(): Promise<ScopeEntityResponse> {
          return getScopeEntity({ state })
      },
      readScopeEntitySchema(entityName: string): Promise<ScopeEntitySchemaResponse> {
          return getScopeEntitySchema({ entityName, state });
      },
      exportScopes(): Promise<ScopeExportInterface> {
          return exportScopes({ state });
      },
      exportScope(
        id: string,
       
      ): Promise<ScopeExportInterface> {
        return exportScope({
          id,
          state,
        });
      },
      exportScopeByName(
        name: string,
  
      ): Promise<ScopeExportInterface> {
        return exportScopeByName({
          name,
          state,
        });
      },
      updateScope(
        id: string,
        scopeData: ScopeSkeleton
      ): Promise<ScopeSkeleton> {
        return updateScope({
          id,
          scopeData,
          state,
        });
      },
      importScopes(
        importData: ScopeExportInterface,
        id?: string,
        name?: string,
        resultCallback: ResultCallback<ScopeSkeleton> = void 0
      ): Promise<ScopeSkeleton[]> {
        return importScopes({
          id,
          name,
          importData,
          resultCallback,
          state,
        });
      },
      deleteScope(id: string): Promise<ScopeSkeleton> {
        return _deleteScope({
          id,
          state,
        });
      },
      deleteScopeByName(name: string): Promise<ScopeSkeleton> {
        return deleteScopeByName({
          name,
          state,
        });
      },
      deleteScopes(
        resultCallback: ResultCallback<ScopeSkeleton> = void 0
      ): Promise<ScopeSkeleton[]> {
        return deleteScopes({
          resultCallback,
          state,
        });
      },
    };
  };
  
  export interface ScopeExportInterface {
    meta?: ExportMetaData;
    scope: Record<string, ScopeSkeleton>;
  }
  
  
  /**
   * Create an empty scope export template
   * @returns {ScopeExportInterface} an empty scope export template
   */
  export function createScopeExportTemplate({
    state,
  }: {
    state: State;
  }): ScopeExportInterface {
    return {
      meta: getMetadata({ state }),
      scope: {},
    };
  }
  
  /**
   * Create scope
   * @param {ScopeSkeleton} scopeData the scope object
   * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
   */
  export async function createScope({
    scopeData,
    state,
  }: {
    scopeData: ScopeSkeleton;
    state: State;
  }): Promise<ScopeSkeleton> {
    try {
      return await _createScope({ scopeData, state });
    } catch (error) {
      throw new FrodoError(
        `Error creating scope ${scopeData.name}`,
        error
      );
    }
  }
  
  /**
   * Read scope
   * @param {string} id the scope id
   * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
   */
  export async function readScope({
    id,
    state,
  }: {
    id: string;
    state: State;
  }): Promise<ScopeSkeleton> {
    try {
      return await getScope({ id, state });
    } catch (error) {
      throw new FrodoError(`Error reading scope ${id}`, error);
    }
  }
  
  /**
   * Read scope by its  name
   * @param {string} name the scope  name
   * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
   */
  export async function readScopeByName({
    name,
    state,
  }: {
    name: string;
    state: State;
  }): Promise<ScopeSkeleton> {
    try {
      const scopes = await queryScopes({
        queryFilter: `name eq "${name}"`,
        state,
      });
      if (scopes.length !== 1) {
        throw new FrodoError(
          `Expected to find a single scope named '${name}', but ${scopes.length} were found.`
        );
      }
      return scopes[0];
    } catch (error) {
      throw new FrodoError(`Error reading scope ${name}`, error);
    }
  }
  
  /**
   * Read all scopes
   * @returns {Promise<ScopeSkeleton[]>} a promise that resolves to an array of scope objects
   */
  export async function readScopes({
    state,
  }: {
    state: State;
  }): Promise<ScopeSkeleton[]> {
    try {
      return await queryScopes({ state });
    } catch (error) {
      throw new FrodoError(`Error reading scopes`, error);
    }
  }
  
  /**
   * Export scope
   * @param {string} id the scope id
   * @returns {Promise<ScopeExportInterface>} a promise that resolves to a scope export object
   */
  export async function exportScope({
    id,
    state,
  }: {
    id: string;
    state: State;
  }): Promise<ScopeExportInterface> {
    try {
      debugMessage({
        message: `IgaScopeOps.exportScope: start`,
        state,
      });
      const exportData = createScopeExportTemplate({ state });
      const type = await readScope({
        id,
        state,
      });
    
      exportData.scope[type.id] = type;
      debugMessage({
        message: `IgaScopeOps.exportScope: end`,
        state,
      });
      return exportData;
    } catch (error) {
      throw new FrodoError(`Error exporting scope ${id}`, error);
    }
  }
  
  /**
   * Export scope by its display name
   * @param {string} name the scope display name
   * @returns {Promise<ScopeExportInterface>} a promise that resolves to a scope export object
   */
  export async function exportScopeByName({
    name,
    state,
  }: {
    name: string;
    state: State;
  }): Promise<ScopeExportInterface> {
    try {
      debugMessage({
        message: `IgaScopeOps.exportScopeByName: start`,
        state,
      });
      const exportData = createScopeExportTemplate({ state });
      const type = await readScopeByName({
        name,
        state,
      });
      exportData.scope[type.id] = type;
      debugMessage({
        message: `IgaScopeOps.exportScopeByName: end`,
        state,
      });
      return exportData;
    } catch (error) {
      throw new FrodoError(`Error exporting scope ${name}`, error);
    }
  }
  
  /**
   * Export all scopes
   * @returns {Promise<ScopeExportInterface>} a promise that resolves to a scope export object
   */
  export async function exportScopes({
    state,
  }: {
    state: State;
  }): Promise<ScopeExportInterface> {
    let indicatorId: string;
    try {
      debugMessage({
        message: `IgaScopeOps.exportScope: start`,
        state,
      });
      const exportData = createScopeExportTemplate({ state });
      const scopes = (await readScopes({ state }));
      indicatorId = createProgressIndicator({
        total: scopes.length,
        message: 'Exporting scope...',
        state,
      });
      for (const scope of scopes) {
        updateProgressIndicator({
          id: indicatorId,
          message: `Exporting Scope ${scope.name}...`,
          state,
        });
       
        exportData.scope[scope.id] = scope;
      }
      stopProgressIndicator({
        id: indicatorId,
        message: `Exported ${scopes.length} scopes`,
        status: 'success',
        state,
      });
      debugMessage({
        message: `IgaScopeOps.exportScopes: end`,
        state,
      });
      return exportData;
    } catch (error) {
      stopProgressIndicator({
        id: indicatorId,
        message: `Error exporting scopes`,
        status: 'fail',
        state,
      });
      throw new FrodoError(`Error exporting scopes`, error);
    }
  }
  
  /**
   * Update Scope
   * @param {string} id the scopeid
   * @param {ScopeSkeleton} scopeData the scope object
   * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
   */
  export async function updateScope({
    id,
    scopeData,
    state,
  }: {
    id: string;
    scopeData: ScopeSkeleton;
    state: State;
  }): Promise<ScopeSkeleton> {
    try {
      return await putScope({
        id,
        scopeData,
        state,
      });
    } catch (error) {
      throw new FrodoError(`Error updating scope '${id}'`, error);
    }
  }
  
  /**
   * Import Scopes
   * @param {string} id The scope id. If supplied, only the scope of that id is imported. Takes priority over name if they are all provided.
   * @param {string} name The scope display name. If supplied, only the scope of that display name is imported.
   * @param {ScopeExportInterface} importData scope import data
   * @param {ResultCallback<ScopeSkeleton>} resultCallback Optional callback to process individual results
   * @returns {Promise<ScopeSkeleton[]>} the imported scopes
   */
  export async function importScopes({
    id,
    name,
    importData,
    resultCallback = void 0,
    state,
  }: {
    id?: string;
    name?: string;
    importData: ScopeExportInterface;
    resultCallback?: ResultCallback<ScopeSkeleton>;
    state: State;
  }): Promise<ScopeSkeleton[]> {
    debugMessage({
      message: `IgaScopeOps.importScope: start`,
      state,
    });
    const response = [];
    for (const existingId of Object.keys(importData.scope)) {
      const scope = importData.scope[existingId];
      const shouldNotImport =
        (id && id !== scope.id) ||
        (name && name !== scope.name) 
      if (shouldNotImport) continue;
      const result = await getResult(
        resultCallback,
        `Error importing scope ${scope.name}`,
        createScope,
        {
          scopeData: scope,
          state,
        }
      );
      if (result) {
        response.push(result);
      }
    }
    debugMessage({ message: `IgaScopeOps.importScope: end`, state });
    return response;
  }
  
  /**
   * Delete scope
   * @param {string} id the scope id
   * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
   */
  export async function deleteScope({
    id,
    state,
  }: {
    id: string;
    state: State;
  }): Promise<ScopeSkeleton> {
    try {
      const deletedScope = await _deleteScope({ id, state });
      return deletedScope;
    } catch (error) {
      throw new FrodoError(`Error deleting scope ${id}`, error);
    }
  }
  
  /**
   * Delete scope by its display name
   * @param {string} name the scope display name
   * @returns {Promise<ScopeSkeleton>} a promise that resolves to a scope object
   */
  export async function deleteScopeByName({
    name,
    state,
  }: {
    name: string;
    state: State;
  }): Promise<ScopeSkeleton> {
    try {
      const scope = await readScopeByName({
        name,
        state,
      });
      return await _deleteScope({
        id: scope.id,
        state,
      });
    } catch (error) {
      throw new FrodoError(`Error deleting scope ${name}`, error);
    }
  }
  
  /**
   * Delete scopes
   * @param {ResultCallback} resultCallback Optional callback to process individual results
   * @returns {Promise<ScopeSkeleton[]>} promise that resolves to an array of scope objects
   */
  export async function deleteScopes({
    resultCallback = void 0,
    state,
  }: {
    resultCallback?: ResultCallback<ScopeSkeleton>;
    state: State;
  }): Promise<ScopeSkeleton[]> {
    const result = await readScopes({ state });
    // Unable to delete non-custom scopes, so filter them out
    const scopes = result;
    const deletedScopes = [];
    for (const scope of scopes) {
      const result = await getResult(
        resultCallback,
        `Error deleting scope ${scope.id}`,
        _deleteScope,
        { id: scope.id, state }
      );
      if (result) {
        deletedScopes.push(result);
      }
    }
    return deletedScopes;
  }
  