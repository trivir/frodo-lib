import {
  deleteDraftWorkflow as _deleteDraftWorkflow,
  deletePublishedWorkflow as _deletePublishedWorkflow,
  getDraftWorkflow,
  getPublishedWorkflow,
  getWorkflows,
  publishWorkflow,
  putWorkflow,
  WorkflowSkeleton,
} from '../../api/cloud/IgaWorkflowApi';
import { VariableSkeleton } from '../../api/cloud/VariablesApi';
import { State } from '../../shared/State';
import {
  createProgressIndicator,
  debugMessage,
  printMessage,
  stopProgressIndicator,
} from '../../utils/Console';
import { getMetadata, getResult } from '../../utils/ExportImportUtils';
import {
  EmailTemplateSkeleton,
  readEmailTemplate,
  updateEmailTemplate,
} from '../EmailTemplateOps';
import { FrodoError } from '../FrodoError';
import { ExportMetaData, ResultCallback } from '../OpsTypes';
import { resolveVariable, updateVariable } from './VariablesOps';

export type Workflow = {
  /**
   * Read draft workflow
   * @param {string} workflowId the workflow id
   * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
   */
  readDraftWorkflow(workflowId: string): Promise<WorkflowSkeleton>;
  /**
   * Read published workflow
   * @param {string} workflowId the workflow id
   * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
   */
  readPublishedWorkflow(workflowId: string): Promise<WorkflowSkeleton>;
  /**
   * Read all workflows
   * @returns {Promise<WorkflowSkeleton[]>} a promise that resolves to an array of workflow objects
   */
  readWorkflows(): Promise<WorkflowSkeleton[]>;
  /**
   * Export workflow
   * @param {string} workflowId the workflow id
   * @param {WorkflowExportOptions} options workflow export options
   * @param {ResultCallback} resultCallback Optional callback to process individual results
   * @returns {Promise<WorkflowExportInterface>} a promise that resolves to a workflow export object
   */
  exportWorkflow(
    workflowId: string,
    options?: WorkflowExportOptions,
    resultCallback?: ResultCallback<WorkflowExportInterface>
  ): Promise<WorkflowExportInterface>;
  /**
   * Export all workflows
   * @param {WorkflowExportOptions} options workflow export options
   * @returns {Promise<WorkflowExportInterface>} a promise that resolves to a workflow export object
   */
  exportWorkflows(
    options?: WorkflowExportOptions
  ): Promise<WorkflowExportInterface>;
  /**
   * Update workflow
   * @param {string} workflowId the workflow id
   * @param {WorkflowSkeleton} workflowData the workflow object
   * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
   */
  updateWorkflow(
    workflowId: string,
    workflowData: WorkflowSkeleton
  ): Promise<WorkflowSkeleton>;
  /**
   * Import workflows
   * @param {string} workflowId The workflow id. If supplied, only the workflow of that id is imported.
   * @param {WorkflowExportInterface} importData workflow import data
   * @param {WorkflowImportOptions} options workflow import options
   * @param {ResultCallback<WorkflowSkeleton>} resultCallback Optional callback to process individual results
   * @returns {Promise<WorkflowSkeleton[]>} the imported workflows
   */
  importWorkflows(
    workflowId: string,
    importData: WorkflowExportInterface,
    options?: WorkflowImportOptions,
    resultCallback?: ResultCallback<WorkflowSkeleton>
  ): Promise<WorkflowSkeleton[]>;
  /**
   * Delete draft workflow
   * @param {string} workflowId the workflow id
   * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
   */
  deleteDraftWorkflow(workflowId: string): Promise<WorkflowSkeleton>;
  /**
   * Delete published workflow
   * @param {string} workflowId the workflow id
   * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
   */
  deletePublishedWorkflow(workflowId: string): Promise<WorkflowSkeleton>;
  /**
   * Delete workflows
   * @param {ResultCallback} resultCallback Optional callback to process individual results
   * @returns {Promise<WorkflowSkeleton[]>} promise that resolves to an array of workflow objects
   */
  deleteWorkflows(
    resultCallback?: ResultCallback<WorkflowSkeleton>
  ): Promise<WorkflowSkeleton[]>;
};

export default (state: State): Workflow => {
  return {
    readDraftWorkflow(workflowId: string): Promise<WorkflowSkeleton> {
      return readDraftWorkflow({
        workflowId,
        state,
      });
    },
    readPublishedWorkflow(workflowId: string): Promise<WorkflowSkeleton> {
      return readPublishedWorkflow({
        workflowId,
        state,
      });
    },
    readWorkflows(): Promise<WorkflowSkeleton[]> {
      return readWorkflows({
        state,
      });
    },
    exportWorkflow(
      workflowId: string,
      options: WorkflowExportOptions = {
        deps: true,
        useStringArrays: true,
        coords: true,
      }
    ): Promise<WorkflowExportInterface> {
      return exportWorkflow({
        workflowId,
        options,
        state,
      });
    },
    exportWorkflows(
      options: WorkflowExportOptions = {
        deps: true,
        useStringArrays: true,
        coords: true,
      },
      resultCallback: ResultCallback<WorkflowExportInterface> = void 0
    ): Promise<WorkflowExportInterface> {
      return exportWorkflows({
        options,
        resultCallback,
        state,
      });
    },
    updateWorkflow(
      workflowId: string,
      workflowData: WorkflowSkeleton
    ): Promise<WorkflowSkeleton> {
      return updateWorkflow({
        workflowId,
        workflowData,
        state,
      });
    },
    importWorkflows(
      workflowId: string,
      importData: WorkflowExportInterface,
      options: WorkflowImportOptions = {
        deps: true,
      },
      resultCallback: ResultCallback<WorkflowSkeleton> = void 0
    ): Promise<WorkflowSkeleton[]> {
      return importWorkflows({
        workflowId,
        importData,
        options,
        resultCallback,
        state,
      });
    },
    deleteDraftWorkflow(workflowId: string): Promise<WorkflowSkeleton> {
      return deleteDraftWorkflow({
        workflowId,
        state,
      });
    },
    deletePublishedWorkflow(workflowId: string): Promise<WorkflowSkeleton> {
      return deletePublishedWorkflow({
        workflowId,
        state,
      });
    },
    deleteWorkflows(
      resultCallback?: ResultCallback<WorkflowSkeleton>
    ): Promise<WorkflowSkeleton[]> {
      return deleteWorkflows({
        resultCallback,
        state,
      });
    },
  };
};

export type WorkflowGroups = Record<
  string,
  {
    draft?: null | WorkflowSkeleton;
    published?: null | WorkflowSkeleton;
  }
>;

export interface WorkflowExportInterface {
  meta?: ExportMetaData;
  workflow: WorkflowGroups;
  emailTemplate: Record<string, EmailTemplateSkeleton>;
  variable: Record<string, VariableSkeleton>;
}

/**
 * Workflow import options
 */
export interface WorkflowImportOptions {
  /**
   * Include any dependencies (email templates).
   */
  deps: boolean;
}

/**
 * Workflow export options
 */
export interface WorkflowExportOptions {
  /**
   * Include any dependencies (email templates).
   */
  deps: boolean;
  /**
   * Use string arrays to store script code
   */
  useStringArrays: boolean;
  /**
   * Include x and y coordinate positions of the workflow nodes.
   */
  coords: boolean;
}

/**
 * Create an empty workflow export template
 * @returns {WorkflowExportInterface} an empty workflow export template
 */
export function createWorkflowExportTemplate({
  state,
}: {
  state: State;
}): WorkflowExportInterface {
  return {
    meta: getMetadata({ state }),
    workflow: {},
    emailTemplate: {},
    variable: {},
  };
}

/**
 * Read draft workflow
 * @param {string} workflowId the workflow id
 * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
 */
export async function readDraftWorkflow({
  workflowId,
  state,
}: {
  workflowId: string;
  state: State;
}): Promise<WorkflowSkeleton> {
  try {
    return await getDraftWorkflow({ workflowId, state });
  } catch (error) {
    throw new FrodoError(`Error reading workflow ${workflowId}`, error);
  }
}

/**
 * Read published workflow
 * @param {string} workflowId the workflow id
 * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
 */
export async function readPublishedWorkflow({
  workflowId,
  state,
}: {
  workflowId: string;
  state: State;
}): Promise<WorkflowSkeleton> {
  try {
    return await getPublishedWorkflow({ workflowId, state });
  } catch (error) {
    throw new FrodoError(`Error reading workflow ${workflowId}`, error);
  }
}

/**
 * Read all workflows
 * @returns {Promise<WorkflowSkeleton[]>} a promise that resolves to an array of workflow objects
 */
export async function readWorkflows({
  state,
}: {
  state: State;
}): Promise<WorkflowSkeleton[]> {
  try {
    const { result } = await getWorkflows({ state });
    return result;
  } catch (error) {
    throw new FrodoError(`Error reading workflows`, error);
  }
}

/**
 * Export workflow
 * @param {string} workflowId the workflow id
 * @param {WorkflowExportOptions} options workflow export options
 * @returns {Promise<WorkflowExportInterface>} a promise that resolves to a workflow export object
 */
export async function exportWorkflow({
  workflowId,
  options = {
    deps: true,
    useStringArrays: true,
    coords: true,
  },
  state,
}: {
  workflowId: string;
  options?: WorkflowExportOptions;
  state: State;
}): Promise<WorkflowExportInterface> {
  try {
    debugMessage({ message: `IgaWorkflowOps.exportWorkflow: start`, state });
    const exportData = getWorkflowExport({
      workflowId,
      options,
      state,
    });
    debugMessage({ message: `IgaWorkflowOps.exportWorkflow: end`, state });
    return exportData;
  } catch (error) {
    throw new FrodoError(`Error exporting workflow ${workflowId}`, error);
  }
}

/**
 * Export all workflows
 * @param {WorkflowExportOptions} options workflow export options
 * @param {ResultCallback} resultCallback Optional callback to process individual results
 * @returns {Promise<WorkflowExportInterface>} a promise that resolves to a workflow export object
 */
export async function exportWorkflows({
  options = {
    deps: true,
    useStringArrays: true,
    coords: true,
  },
  resultCallback = void 0,
  state,
}: {
  options?: WorkflowExportOptions;
  resultCallback: ResultCallback<WorkflowExportInterface>;
  state: State;
}): Promise<WorkflowExportInterface> {
  let indicatorId: string;
  try {
    debugMessage({ message: `IgaWorkflowOps.exportWorkflows: start`, state });
    indicatorId = createProgressIndicator({
      type: 'indeterminate',
      total: 0,
      message: 'Exporting workflows...',
      state,
    });
    let exportData: WorkflowExportInterface;
    if (!resultCallback) {
      // This is a simpler/faster way to export everything in one go
      exportData = await getWorkflowExport({
        options,
        state,
      });
    } else {
      // For result callbacks we must process the items individually
      const workflows = await readWorkflows({ state });
      exportData = createWorkflowExportTemplate({ state });
      for (const workflow of workflows) {
        const singleExport = await getResult(
          resultCallback,
          undefined,
          exportWorkflow,
          {
            workflowId: workflow.id,
            workflow,
            state,
          }
        );
        // Merge in export with full export
        exportData.workflow = Object.assign(
          {},
          exportData.workflow,
          singleExport.workflow
        );
        exportData.variable = Object.assign(
          {},
          exportData.variable,
          singleExport.variable
        );
        exportData.emailTemplate = Object.assign(
          {},
          exportData.emailTemplate,
          singleExport.emailTemplate
        );
      }
    }
    stopProgressIndicator({
      id: indicatorId,
      message: `Exported ${Object.keys(exportData.workflow).length} workflows`,
      status: 'success',
      state,
    });
    debugMessage({ message: `IgaWorkflowOps.exportWorkflows: end`, state });
    return exportData;
  } catch (error) {
    stopProgressIndicator({
      id: indicatorId,
      message: `Error exporting workflows`,
      status: 'fail',
      state,
    });
    throw new FrodoError(`Error exporting custom nodes`, error);
  }
}

/**
 * Update workflow
 * @param {string} workflowId the workflow id
 * @param {WorkflowSkeleton} workflowData the workflow object
 * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
 */
export async function updateWorkflow({
  workflowId,
  workflowData,
  state,
}: {
  workflowId: string;
  workflowData: WorkflowSkeleton;
  state: State;
}): Promise<WorkflowSkeleton> {
  try {
    transformScriptArraysToStrings(workflowData);
    return await (
      workflowData.status === 'draft' ? putWorkflow : publishWorkflow
    )({ workflowId, workflowData, state });
  } catch (error) {
    throw new FrodoError(`Error updating workflow '${workflowId}'`, error);
  }
}

/**
 * Import workflows
 * @param {string} workflowId The workflow id. If supplied, only the workflow of that id is imported.
 * @param {WorkflowExportInterface} importData workflow import data
 * @param {WorkflowImportOptions} options workflow import options
 * @param {ResultCallback<WorkflowSkeleton>} resultCallback Optional callback to process individual results
 * @returns {Promise<WorkflowSkeleton[]>} the imported workflows
 */
export async function importWorkflows({
  workflowId,
  importData,
  options = {
    deps: true,
  },
  resultCallback,
  state,
}: {
  workflowId?: string;
  importData: WorkflowExportInterface;
  options?: WorkflowImportOptions;
  resultCallback?: ResultCallback<WorkflowSkeleton>;
  state: State;
}): Promise<WorkflowSkeleton[]> {
  debugMessage({ message: `IgaWorkflowOps.importWorkflows: start`, state });
  const response = [];
  // Read server workflows in the event we need to update coordinates
  const serverWorkflows = await readGroupedWorkflows({
    workflowId,
    state,
  });
  for (const existingId of Object.keys(importData.workflow)) {
    try {
      const workflow = importData.workflow[existingId];
      const shouldNotImportWorkflow =
        workflowId &&
        ((!workflow.draft && !workflow.published) ||
          (workflow.draft && workflowId !== workflow.draft.id) ||
          (workflow.published && workflowId !== workflow.published.id));
      if (shouldNotImportWorkflow) continue;
      debugMessage({
        message: `IgaWorkflowOps.importWorkflows: Importing workflow ${existingId}`,
        state,
      });
      // Import variables
      if (
        options.deps &&
        importData.variable &&
        Object.entries(importData.variable).length > 0
      ) {
        if (state.getVerbose())
          printMessage({ message: '  - Variables:', newline: false, state });
        for (const [variableId, variableObject] of Object.entries(
          importData.variable
        )) {
          if (state.getVerbose()) {
            printMessage({
              message: `\n    - ${variableId}`,
              type: 'info',
              newline: false,
              state,
            });
          }
          await updateVariable({
            variableId,
            value: variableObject.value,
            description: variableObject.description,
            expressionType: variableObject.expressionType,
            state,
          });
          if (state.getVerbose()) printMessage({ message: '', state });
        }
      }
      // Import email templates
      if (
        options.deps &&
        importData.emailTemplate &&
        Object.entries(importData.emailTemplate).length > 0
      ) {
        if (state.getVerbose()) {
          printMessage({
            message: '\n  - Email templates:',
            newline: false,
            state,
          });
        }
        for (const [templateId, templateData] of Object.entries(
          importData.emailTemplate
        )) {
          if (state.getVerbose()) {
            printMessage({
              message: `\n    - ${templateId}`,
              type: 'info',
              newline: false,
              state,
            });
          }
          await updateEmailTemplate({ templateId, templateData, state });
          if (state.getVerbose()) printMessage({ message: '', state });
        }
      }
      // Import workflows
      if (workflow.draft) {
        fillCoordinates(
          workflow.draft,
          serverWorkflows[workflow.draft.id].draft
        );
        const result = await updateWorkflow({
          workflowId: workflow.draft.id,
          workflowData: workflow.draft,
          state,
        });
        if (resultCallback) {
          resultCallback(undefined, result);
        }
        response.push(result);
      }
      if (workflow.published) {
        fillCoordinates(
          workflow.published,
          serverWorkflows[workflow.published.id].published
        );
        const result = await updateWorkflow({
          workflowId: workflow.published.id,
          workflowData: workflow.published,
          state,
        });
        if (resultCallback) {
          resultCallback(undefined, result);
        }
        response.push(result);
      }
    } catch (e) {
      if (resultCallback) {
        resultCallback(e, undefined);
      } else {
        throw new FrodoError(`Error importing workflow '${existingId}'`, e);
      }
    }
  }
  debugMessage({ message: `IgaWorkflowOps.importWorkflows: end`, state });
  return response;
}

/**
 * Delete draft workflow
 * @param {string} workflowId the workflow id
 * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
 */
export async function deleteDraftWorkflow({
  workflowId,
  state,
}: {
  workflowId: string;
  state: State;
}): Promise<WorkflowSkeleton> {
  try {
    return await _deleteDraftWorkflow({ workflowId, state });
  } catch (error) {
    throw new FrodoError(`Error deleting workflow ${workflowId}`, error);
  }
}

/**
 * Delete published workflow
 * @param {string} workflowId the workflow id
 * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
 */
export async function deletePublishedWorkflow({
  workflowId,
  state,
}: {
  workflowId: string;
  state: State;
}): Promise<WorkflowSkeleton> {
  try {
    return await _deletePublishedWorkflow({ workflowId, state });
  } catch (error) {
    throw new FrodoError(`Error deleting workflow ${workflowId}`, error);
  }
}

/**
 * Delete workflows
 * @param {ResultCallback} resultCallback Optional callback to process individual results
 * @returns {Promise<WorkflowSkeleton[]>} promise that resolves to an array of workflow objects
 */
export async function deleteWorkflows({
  resultCallback,
  state,
}: {
  resultCallback?: ResultCallback<WorkflowSkeleton>;
  state: State;
}): Promise<WorkflowSkeleton[]> {
  const workflows = await readWorkflows({ state });
  const deletedWorkflows = [];
  for (const workflow of workflows) {
    const result: WorkflowSkeleton = await getResult(
      resultCallback,
      `Error deleting workflow ${workflow.id}`,
      workflow.status === 'published'
        ? deletePublishedWorkflow
        : deleteDraftWorkflow,
      { workflowId: workflow.id, state }
    );
    if (result) {
      deletedWorkflows.push(result);
    }
  }
  return deletedWorkflows;
}

// Helper functions

/**
 * Gets email template dependencies for the provided workflows
 *
 * @param {Record<string, object>} workflows The workflows to get the email dependencies of
 * @param {Record<string, VariableSkeleton>} variables The variable object that caches resolved variables
 * @returns {EmailTemplateSkeleton[]} The array of email template dependencies
 */
async function getWorkflowEmailTemplateDependencies({
  workflows,
  variables,
  state,
}: {
  workflows: WorkflowGroups;
  variables: Record<string, VariableSkeleton>;
  state: State;
}): Promise<EmailTemplateSkeleton[]> {
  const emailTemplateIds = new Set<string>();
  objectRecurse(workflows, async (o) => {
    let emailTemplateName;
    if (typeof o.notification === 'string') emailTemplateName = o.notification;
    if (typeof o.templateName === 'string') emailTemplateName = o.templateName;
    if (emailTemplateName) {
      emailTemplateIds.add(
        await resolveVariable({
          input: o.notification,
          variables,
          state,
        })
      );
    }
  });
  return Promise.all(
    [...emailTemplateIds].map((id) =>
      readEmailTemplate({
        templateId: id,
        state,
      })
    )
  );
}

/**
 * Gets workflow export if id is provided, or all workflow exports if no id provided
 *
 * @param {string} workflowId the workflow id
 * @param {WorkflowExportOptions} options workflow export options
 * @returns {Promise<WorkflowExportInterface>} a promise that resolves to a workflow export object
 */
async function getWorkflowExport({
  workflowId,
  options = {
    deps: true,
    useStringArrays: true,
    coords: true,
  },
  state,
}: {
  workflowId?: string;
  options?: WorkflowExportOptions;
  state: State;
}): Promise<WorkflowExportInterface> {
  const exportData = createWorkflowExportTemplate({ state });
  exportData.workflow = await readGroupedWorkflows({
    workflowId,
    state,
  });
  if (
    workflowId &&
    !exportData.workflow[0].draft &&
    !exportData.workflow[0].published
  ) {
    throw new FrodoError(`Workflow '${workflowId}' not found.`);
  }
  if (options.useStringArrays)
    transformScriptStringsToArrays(exportData.workflow);
  if (!options.coords) removeCoordinates(exportData.workflow);
  if (options.deps) {
    const variables: Record<string, VariableSkeleton> = {};
    const templates = await getWorkflowEmailTemplateDependencies({
      workflows: exportData.workflow,
      variables,
      state,
    });
    if (state.getVerbose() && templates.length > 0) {
      printMessage({
        message: '\n  - Email templates:',
        newline: false,
        state,
      });
    }
    exportData.emailTemplate = Object.fromEntries(
      templates.map((e) => {
        const id = e._id.split('/')[1];
        if (state.getVerbose()) {
          printMessage({
            message: `\n    - ${id}${
              e.displayName ? ` (${e.displayName})` : ''
            }`,
            type: 'info',
            newline: false,
            state,
          });
        }
        return [id, e];
      })
    );
    exportData.variable = variables;
    if (state.getVerbose() && Object.keys(variables).length > 0) {
      printMessage({
        message: '\n  - Variables:',
        newline: false,
        state,
      });
      for (const variable of Object.values(variables)) {
        printMessage({
          message: `\n    - ${variable._id}`,
          type: 'info',
          newline: false,
          state,
        });
      }
    }
  }
  return exportData;
}

/**
 * Reads workflows (both draft and published) into a grouped object by id. If id is provided, only returns the workflows for the specified id.
 *
 * @param {string} workflowId the workflow id
 * @returns {Promise<WorkflowExportInterface>} a promise that resolves to a grouped object containing all draft/published workflows per id
 */
async function readGroupedWorkflows({
  workflowId,
  state,
}: {
  workflowId?: string;
  state: State;
}): Promise<WorkflowGroups> {
  if (!workflowId) {
    return (await readWorkflows({ state })).reduce((flows, flow) => {
      if (!flows[flow.id]) flows[flow.id] = { draft: null, published: null };
      flows[flow.id][flow.status] = flow;
      return flows;
    }, {});
  }
  const workflow = { draft: null, published: null };
  try {
    workflow.draft = await getDraftWorkflow({ workflowId, state });
  } catch (e) {
    if (e.response?.status !== 404)
      throw new FrodoError(`Error reading workflow ${workflowId}`, e);
  }
  try {
    workflow.published = await getPublishedWorkflow({ workflowId, state });
  } catch (e) {
    if (e.response?.status !== 404)
      throw new FrodoError(`Error reading workflow ${workflowId}`, e);
  }
  return { [workflowId]: workflow };
}

/**
 * Transforms any script found in the object or its children that is a string into an array
 *
 * @param {any} obj The object to update the scripts for
 */
function transformScriptStringsToArrays(obj: any) {
  objectRecurse(obj, (o) => {
    if (o.isExpression === true && typeof o.value === 'string') {
      o.value = o.value.split('\n');
    }
    if (typeof o.language === 'string' && typeof o.script === 'string') {
      o.script = o.script.split('\n');
    }
  });
}

/**
 * Transforms any script found in the object or its children that is an array into a string
 *
 * @param {any} obj The object to update the scripts for
 */
function transformScriptArraysToStrings(obj: any) {
  objectRecurse(obj, (o) => {
    if (o.isExpression === true && Array.isArray(o.value)) {
      o.value = o.value.join('\n');
    }
    if (typeof o.language === 'string' && Array.isArray(o.script)) {
      o.script = o.script.join('\n');
    }
  });
}

/**
 * Removes any found x/y coordinates in the object or its children
 *
 * @param {any} obj The object to remove coordinates from
 */
function removeCoordinates(obj: any) {
  objectRecurse(obj, (o) => {
    if (typeof o.x === 'number' || typeof o.y === 'number') {
      delete o.x;
      delete o.y;
    }
  });
}

/**
 * Helper to fill missing coordinates in a workflow with coordinates from the server
 *
 * @param {WorkflowSkeleton} workflow The workflow to fill in missing coordinates
 * @param {WorkflowSkeleton} serverWorkflow The server workflow to get missing coordinates from
 */
function fillCoordinates(
  workflow: WorkflowSkeleton,
  serverWorkflow: WorkflowSkeleton
) {
  // If export is missing coordinates, and server doesn't have a workflow, we just import as is since the server will fill the coordinates with default values automatically.
  if (!serverWorkflow) return;
  const nodesToCompare = [
    [workflow.staticNodes.startNode, serverWorkflow.staticNodes.startNode],
    [workflow.staticNodes.endNode, serverWorkflow.staticNodes.endNode],
    ...Object.entries(workflow.staticNodes.uiConfig).map(([id, node]) => [
      node,
      serverWorkflow.staticNodes.uiConfig[id],
    ]),
  ];
  for (const [node, serverNode] of nodesToCompare) {
    if (!serverNode) continue;
    if (!node.x) node.x = serverNode.x;
    if (!node.y) node.y = serverNode.y;
  }
}

/**
 * Helper to iterate through all objects recursively within the given object
 *
 * @param {any} obj the object to iterate through
 * @param {Record<string, any>} objOp the function to run on each object
 */
function objectRecurse(obj: any, objOp: (obj: Record<string, any>) => void) {
  if (!obj || typeof obj !== 'object') return;
  if (Array.isArray(obj)) {
    obj.forEach((o) => objectRecurse(o, objOp));
    return;
  }
  objOp(obj);
  Object.values(obj).forEach((o) => objectRecurse(o, objOp));
}
