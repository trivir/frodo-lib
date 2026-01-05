import util from 'util';

import { State } from '../../shared/State';
import { getHostOnlyUrl } from '../../utils/ForgeRockUtils';
import { QueryResult } from '../ApiTypes';
import { generateAmApi } from '../BaseApi';
import { StaticNodeRefSkeletonInterface } from '../NodeApi';

const allWorkflowsURLTemplate = '%s/iga/governance/workflow';
const workflowURLTemplate = allWorkflowsURLTemplate + '/%s';
const draftWorkflowURLTemplate = workflowURLTemplate + '/draft';
const publishedWorkflowURLTemplate = workflowURLTemplate + '/published';
const publishWorkflowURLTemplate = allWorkflowsURLTemplate + '?_action=publish';

export type StepType =
  | 'scriptTask'
  | 'violationTask'
  | 'fulfillmentTask'
  | 'emailTask'
  | 'waitTask'
  | 'approvalTask';

export interface StepConfiguration {
  nextStep: {
    condition: null | string;
    outcome: string;
    step: null | string;
  }[];
  // Depending on the step type, there will be other configuration here too
}

export interface WorkflowActor {
  id: string;
  permissions: {
    approve: boolean;
    reject: boolean;
    reassign: boolean;
    modify: boolean;
    comment: boolean;
  };
}

export interface WorkflowSkeleton {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type?: string;
  childType: boolean;
  _rev: number;
  steps: WorkflowStep[];
  staticNodes: {
    startNode: WorkflowStaticNode;
    endNode: WorkflowStaticNode;
    uiConfig: Record<string, StepStaticNode>;
  };
  status: 'published' | 'draft';
  mutable: boolean;
}

export type WorkflowStep = {
  [s in StepType]: StepConfiguration;
} & {
  name: string;
  displayName: string;
  type: StepType;
};

export interface WorkflowStaticNode extends StaticNodeRefSkeletonInterface {
  id: string;
  connections: null | {
    start?: string;
  };
  name?: string;
  nodeType?: string;
  displayType?: string;
  isDroppable?: boolean;
  isDeleteable?: boolean;
  isEditable?: boolean;
  isHovered?: boolean;
  hasError?: boolean;
  displayDetails?: {
    icon: string;
    variant: string;
    value: string;
  };
  _outcomes?: { id: string; displayName: string }[];
  template?: null;
  schema?: null;
}

export interface StepStaticNode extends StaticNodeRefSkeletonInterface {
  actors?: WorkflowActor[];
  events?: {
    resumeDateType?: string;
    resumeDateNumber?: number;
    resumeDateTimeSpan?: string;
    escalationDate?: number;
    escalationTimeSpan?: string;
    escalationType?: string;
    expirationDate?: number;
    expirationTimeSpan?: string;
    reminderDate?: number;
    reminderTimeSpan?: string;
    expirationDateType?: string;
    expirationDateVariable?: string;
    reassignedActors?: WorkflowActor[];
  };
}

/**
 * Get draft workflow
 * @param {string} workflowId the workflow id
 * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
 */
export async function getDraftWorkflow({
  workflowId,
  state,
}: {
  workflowId: string;
  state: State;
}): Promise<WorkflowSkeleton> {
  const urlString = util.format(
    draftWorkflowURLTemplate,
    getHostOnlyUrl(state.getHost()),
    workflowId
  );
  const { data } = await generateAmApi({
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Get published workflow
 * @param {string} workflowId the workflow id
 * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
 */
export async function getPublishedWorkflow({
  workflowId,
  state,
}: {
  workflowId: string;
  state: State;
}): Promise<WorkflowSkeleton> {
  const urlString = util.format(
    publishedWorkflowURLTemplate,
    getHostOnlyUrl(state.getHost()),
    workflowId
  );
  const { data } = await generateAmApi({
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Get all workflows
 * @returns {Promise<QueryResult<WorkflowSkeleton>>} a promise that resolves to an object containing an array of workflow objects
 */
export async function getWorkflows({
  state,
}: {
  state: State;
}): Promise<QueryResult<WorkflowSkeleton>> {
  const urlString = util.format(
    allWorkflowsURLTemplate,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateAmApi({
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Put workflow
 * @param {string} workflowId the workflow id
 * @param {WorkflowSkeleton} workflowData the workflow object
 * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
 */
export async function putWorkflow({
  workflowId,
  workflowData,
  state,
}: {
  workflowId: string;
  workflowData: WorkflowSkeleton;
  state: State;
}): Promise<WorkflowSkeleton> {
  const urlString = util.format(
    workflowURLTemplate,
    getHostOnlyUrl(state.getHost()),
    workflowId
  );
  const { data } = await generateAmApi({
    resource: {},
    state,
  }).put(urlString, workflowData, {
    withCredentials: true,
  });
  return data;
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
  const urlString = util.format(
    draftWorkflowURLTemplate,
    getHostOnlyUrl(state.getHost()),
    workflowId
  );
  const { data } = await generateAmApi({
    resource: {},
    state,
  }).delete(urlString, {
    withCredentials: true,
  });
  return data;
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
  const urlString = util.format(
    publishedWorkflowURLTemplate,
    getHostOnlyUrl(state.getHost()),
    workflowId
  );
  const { data } = await generateAmApi({
    resource: {},
    state,
  }).delete(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Publish workflow
 * @param {string} workflowId the workflow id
 * @param {WorkflowSkeleton} workflowData the workflow object
 * @returns {Promise<WorkflowSkeleton>} a promise that resolves to a workflow object
 */
export async function publishWorkflow({
  workflowId,
  workflowData,
  state,
}: {
  workflowId: string;
  workflowData: WorkflowSkeleton;
  state: State;
}): Promise<WorkflowSkeleton> {
  const urlString = util.format(
    publishWorkflowURLTemplate,
    getHostOnlyUrl(state.getHost()),
    workflowId
  );
  const { data } = await generateAmApi({
    resource: {},
    state,
  }).post(urlString, workflowData, {
    withCredentials: true,
  });
  return data;
}
