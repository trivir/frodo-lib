import {
  getPolicies as _getPolicies,
  getPoliciesByPolicySet as _getPoliciesByPolicySet,
  getPolicy as _getPolicy,
  putPolicy as _putPolicy,
  deletePolicy as _deletePolicy,
} from '../api/PoliciesApi';
import { getScript } from './ScriptOps';
import { convertBase64TextToArray } from './utils/ExportImportUtils';
import { ExportMetaData } from './OpsTypes';
import {
  PolicyCondition,
  PolicyConditionType,
  PolicySetSkeleton,
  PolicySkeleton,
  ResourceTypeSkeleton,
  ScriptSkeleton,
} from '../api/ApiTypes';
import { getMetadata } from './utils/ExportImportUtils';
import { debugMessage } from './utils/Console';
import { getResourceType } from '../api/ResourceTypesApi';
import { getPolicySet } from './PolicySetOps';

export interface PolicyExportInterface {
  meta?: ExportMetaData;
  script: Record<string, ScriptSkeleton>;
  resourcetype: Record<string, ResourceTypeSkeleton>;
  policy: Record<string, PolicySkeleton>;
  policyset: Record<string, PolicySetSkeleton>;
}

/**
 * Policy export options
 */
export interface PolicyExportOptions {
  /**
   * Use string arrays to store multi-line text in scripts.
   */
  useStringArrays: boolean;
  /**
   * Include any dependencies (policy sets, scripts, resource types).
   */
  deps: boolean;
}

/**
 * Policy import options
 */
export interface PolicyImportOptions {
  /**
   * Include any dependencies (policy sets, scripts, resource types).
   */
  deps: boolean;
}

/**
 * Create an empty export template
 * @returns {PolicyExportInterface} an empty export template
 */
function createPolicyExportTemplate(): PolicyExportInterface {
  return {
    meta: getMetadata(),
    script: {},
    policy: {},
    resourcetype: {},
    policyset: {},
  } as PolicyExportInterface;
}

/**
 * Get all policies
 * @returns {Promise<PolicySkeleton>} a promise that resolves to an array of policy set objects
 */
export async function getPolicies(): Promise<PolicySkeleton[]> {
  const { result } = await _getPolicies();
  return result;
}

/**
 * Get policies by policy set
 * @param {string} policySetId policy set id/name
 * @returns {Promise<PolicySkeleton[]>} a promise resolving to an array of policy objects
 */
export async function getPoliciesByPolicySet(
  policySetId: string
): Promise<PolicySkeleton[]> {
  const data = await _getPoliciesByPolicySet(policySetId);
  return data.result;
}

/**
 * Get policy
 * @param {string} policyId policy id/name
 * @returns {Promise<PolicySkeleton>} a promise that resolves to a policy object
 */
export async function getPolicy(policyId: string): Promise<PolicySkeleton> {
  return _getPolicy(policyId);
}

/**
 * Delete policy
 * @param {string} policyId policy id/name
 * @returns {Promise<PolicySkeleton>} a promise that resolves to a policy object
 */
export async function deletePolicy(policyId: string): Promise<PolicySkeleton> {
  return _deletePolicy(policyId);
}

/**
 * Put policy
 * @param {string} policyId policy id/name
 * @param {PolicySkeleton} policyData policy object
 * @returns {Promise<PolicySkeleton>} a promise that resolves to a policy object
 */
export async function putPolicy(
  policyId: string,
  policyData: PolicySkeleton
): Promise<PolicySkeleton> {
  return _putPolicy(policyId, policyData);
}

/**
 * Find all script references in a deeply-nested policy condition object
 * @param {PolicyCondition} condition condition object
 * @returns {string[]} array of script UUIDs
 * 
 * Sample condition block:
 * 
      "condition": {
        "type": "AND",
        "conditions": [
          {
            "type": "Script",
            "scriptId": "62f18ede-e5e7-4a7b-8b73-1b02fcbd241a"
          },
          {
            "type": "AuthenticateToService",
            "authenticateToService": "TxAuthz"
          },
          {
            "type": "OR",
            "conditions": [
              {
                "type": "Session",
                "maxSessionTime": 5,
                "terminateSession": false
              },
              {
                "type": "OAuth2Scope",
                "requiredScopes": [
                  "openid"
                ]
              },
              {
                "type": "NOT",
                "condition": {
                  "type": "Script",
                  "scriptId": "729ee140-a4e9-43af-b358-d60eeda13cc3"
                }
              }
            ]
          }
        ]
      },
*/
export function findScriptUuids(condition: PolicyCondition): string[] {
  let scriptUuids: string[] = [];
  if (!condition) return scriptUuids;
  if (
    condition.type === PolicyConditionType.AND.toString() ||
    condition.type === PolicyConditionType.OR.toString() ||
    condition.type === PolicyConditionType.NOT.toString()
  ) {
    // single condition
    if (condition.condition) {
      scriptUuids.push(...findScriptUuids(condition.condition));
    }
    // array of conditions
    if (condition.conditions) {
      for (const cond of condition.conditions) {
        scriptUuids.push(...findScriptUuids(cond));
      }
    }
  } else if (condition.type === PolicyConditionType.Script.toString()) {
    scriptUuids.push(condition['scriptId']);
  }
  // de-duplicate
  scriptUuids = [...new Set(scriptUuids)];
  return scriptUuids;
}

/**
 * Get scripts for a policy object
 * @param {PolicySkeleton} policyData policy object
 * @returns {Promise<ScriptSkeleton[]>} a promise that resolves to an array of script objects
 */
export async function getScripts(
  policyData: PolicySkeleton
): Promise<ScriptSkeleton[]> {
  debugMessage(`PolicyOps.getScripts: start [policy=${policyData['name']}]`);
  const errors = [];
  const scripts = [];
  try {
    const scriptUuids = findScriptUuids(policyData.condition);
    debugMessage(`found scripts: ${scriptUuids}`);
    for (const scriptUuid of scriptUuids) {
      try {
        const script = await getScript(scriptUuid);
        scripts.push(script);
      } catch (error) {
        error.message = `Error retrieving script ${scriptUuid} referenced in policy ${policyData['name']}: ${error.message}`;
        errors.push(error);
      }
    }
  } catch (error) {
    error.message = `Error finding scripts in policy ${policyData['name']}: ${error.message}`;
    errors.push(error);
  }
  if (errors.length) {
    const errorMessages = errors.map((error) => error.message).join('\n');
    throw new Error(`Export error:\n${errorMessages}`);
  }
  debugMessage(`PolicySetOps.getScripts: end`);
  return scripts;
}

/**
 * Helper function to export dependencies of a policy set
 * @param {unknown} policyData policy set data
 * @param {PolicyExportOptions} options export options
 * @param {PolicyExportInterface} exportData export data
 */
async function exportPolicyDependencies(
  policyData: PolicySkeleton,
  options: PolicyExportOptions,
  exportData: PolicyExportInterface
) {
  debugMessage(
    `PolicyOps.exportPolicyDependencies: start [policy=${policyData['name']}]`
  );
  // resource types
  if (policyData.resourceTypeUuid) {
    const resourceType = await getResourceType(policyData.resourceTypeUuid);
    exportData.resourcetype[policyData.resourceTypeUuid] = resourceType;
  }
  // policy set
  if (policyData.applicationName) {
    const policySet = await getPolicySet(policyData.applicationName);
    exportData.policyset[policyData.applicationName] = policySet;
  }
  // scripts
  const scripts = await getScripts(policyData);
  for (const scriptData of scripts) {
    if (options.useStringArrays) {
      scriptData.script = convertBase64TextToArray(scriptData.script);
    }
    exportData.script[scriptData._id] = scriptData;
  }
  debugMessage(`PolicySetOps.exportPolicySetDependencies: end`);
}

/**
 * Export policy
 * @param {string} policyId policy id/name
 * @returns {Promise<PolicyExportInterface>} a promise that resolves to a PolicyExportInterface object
 */
export async function exportPolicy(
  policyId: string,
  options: PolicyExportOptions
): Promise<PolicyExportInterface> {
  debugMessage(`PolicyOps.exportPolicy: start`);
  const policyData = await getPolicy(policyId);
  const exportData = createPolicyExportTemplate();
  exportData.policy[policyData._id] = policyData;
  if (options.deps) {
    await exportPolicyDependencies(policyData, options, exportData);
  }
  debugMessage(`PolicyOps.exportPolicy: end`);
  return exportData;
}

/**
 * Export policies
 * @param {PolicyExportOptions} options export options
 * @returns {Promise<PolicyExportInterface>} a promise that resolves to an PolicyExportInterface object
 */
export async function exportPolicies(
  options: PolicyExportOptions
): Promise<PolicyExportInterface> {
  debugMessage(`PolicyOps.exportPolicies: start`);
  const exportData = createPolicyExportTemplate();
  const errors = [];
  try {
    const policies = await getPolicies();
    for (const policyData of policies) {
      exportData.policy[policyData._id] = policyData;
      if (options.deps) {
        try {
          await exportPolicyDependencies(policyData, options, exportData);
        } catch (error) {
          errors.push(error);
        }
      }
    }
  } catch (error) {
    errors.push(error);
  }
  if (errors.length) {
    const errorMessages = errors.map((error) => error.message).join('\n');
    throw new Error(`Export error:\n${errorMessages}`);
  }
  debugMessage(`PolicyOps.exportPolicies: end`);
  return exportData;
}

/**
 * Export policies by policy set
 * @param {string} policySetId policy set id/name
 * @param {PolicyExportOptions} options export options
 * @returns {Promise<PolicyExportInterface>} a promise that resolves to an PolicyExportInterface object
 */
export async function exportPoliciesByPolicySet(
  policySetId: string,
  options: PolicyExportOptions
): Promise<PolicyExportInterface> {
  debugMessage(`PolicyOps.exportPolicies: start`);
  const exportData = createPolicyExportTemplate();
  const errors = [];
  try {
    const policies = await getPoliciesByPolicySet(policySetId);
    for (const policyData of policies) {
      exportData.policy[policyData._id] = policyData;
      if (options.deps) {
        try {
          await exportPolicyDependencies(policyData, options, exportData);
        } catch (error) {
          errors.push(error);
        }
      }
    }
  } catch (error) {
    errors.push(error);
  }
  if (errors.length) {
    const errorMessages = errors.map((error) => error.message).join('\n');
    throw new Error(`Export error:\n${errorMessages}`);
  }
  debugMessage(`PolicyOps.exportPolicies: end`);
  return exportData;
}

/**
 * Import policy by id
 * @param {string} name client id
 * @param {PolicyExportInterface} importData import data
 * @param {PolicyImportOptions} options import options
 */
export async function importPolicy(
  name: string,
  importData: PolicyExportInterface,
  options: PolicyImportOptions = { deps: true }
) {
  let response = null;
  const errors = [];
  const imported = [];
  for (const id of Object.keys(importData.policy)) {
    if (id === name) {
      try {
        const policyData = importData.policy[id];
        delete policyData._rev;
        if (options.deps) {
          // await importOAuth2ClientDependencies(clientData, importData);
        }
        response = await _putPolicy(policyData._id, policyData);
        imported.push(id);
      } catch (error) {
        errors.push(error);
      }
    }
  }
  if (errors.length) {
    const errorMessages = errors.map((error) => error.message).join('\n');
    throw new Error(`Import error:\n${errorMessages}`);
  }
  if (0 === imported.length) {
    throw new Error(`Import error:\n${name} not found in import data!`);
  }
  return response;
}