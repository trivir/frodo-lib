import util from 'util';

import { State } from '../../../shared/State';
import { getHostOnlyUrl } from '../../../utils/ForgeRockUtils';
import { generateGovernanceApi } from '../../BaseApi';

// The docs for Iga Config uses a url that doesn't work.
// The one below is correct despite what the docs say
const configEndpointTemplate = '%s/iga/commons/config';
const configURLTemplate = configEndpointTemplate + '/%s';

export interface IgaAccessRequestConfig {
  requireRequestJustification?: boolean;
  requireRejectJustification?: boolean;
  requireApproveJustification?: boolean;
  preventRequestWithViolation?: boolean;
  requireRequestJustificationWithViolation?: boolean;
  defaultApprover?: string;
  allowSelfApproval?: boolean;
  maxManualRoleMembers?: number;
}

export interface IgaGlobalConfig {
  enableScoping?: boolean;
}

export interface IgaAutoIdConfig {
  enableAutoId: boolean;
  highScorePercentThreshold: number;
  mediumScorePercentThreshold: number;
  lowScorePercentThreshold: number;
  training_features_filter: string[];
  roleMiningConfidenceThreshold: number;
  roleMiningMembershipThreshold: number;
  roleMiningEntitlementThreshold: number;
  enableFeatureRecommendation: boolean;
  maxRecommendedFeatures: number;
  featuresToSkipDuringRecommendation: string[];
}

export interface LcmEntitySettings {
  enabled?: boolean;
}

export interface LcmSettings {
  user?: LcmEntitySettings;
  role?: LcmEntitySettings;
  organization?: LcmEntitySettings;
  entitlement?: LcmEntitySettings;
}

export interface IgaUiConfig {
  lcmSettings?: LcmSettings;
}

export interface IgaNotificationConfig {
  notificationPollingBatchSize?: number;
  notificationSendDelay?: number;
  notificationRetryDelay?: number;
  notificationMaxRetries?: number;
}

export interface IgaFeatureRecommendation {
  result?: unknown[];
}

export interface CommonsConfig {
  iga_global?: IgaGlobalConfig;
  iga_autoid_integration?: IgaAutoIdConfig;
  iga_notification?: IgaNotificationConfig;
  iga_access_request?: IgaAccessRequestConfig;
  'iga-file'?: Record<string, unknown>;
  feature_recommendation?: IgaFeatureRecommendation;
  iga_ui_config?: IgaUiConfig;
}

/**
 * Get all IGA config properties
 * @returns {Promise<ScopeSkeleton>}
 */
export async function getConfig({
  state,
}: {
  state: State;
}): Promise<CommonsConfig> {
  const urlString = util.format(
    configEndpointTemplate,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Get IGA config properties by a given category
 * @param key The config category key
 * @returns {Promise<ScopeSkeleton>}
 */
export async function getConfigByKey({
  key,
  state,
}: {
  key: string;
  state: State;
}): Promise<CommonsConfig> {
  const urlString = util.format(
    configURLTemplate,
    getHostOnlyUrl(state.getHost()),
    key
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).get(urlString, {
    withCredentials: true,
  });
  return data;
}

/**
 * Update all IGA config properties
 * @param {CommonsConfig} configData The full configuration object Must include all current configurations — omitted keys will revert to defaults
 * @returns {Promise<CommonsConfig>} A promise that resolves to the updated config object
 */
export async function putConfig({
  configData,
  state,
}: {
  configData: CommonsConfig;
  state: State;
}): Promise<CommonsConfig> {
  const urlString = util.format(
    configEndpointTemplate,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).put(urlString, configData, {
    withCredentials: true,
  });
  return data;
}

/**
 * Update IGA config properties for a given category
 * @param {string} key The specified config category
 * @param {CommonsConfig} configData The config object for the given category
 * @returns {Promise<CommonsConfig>} A promise that resolves to the updated config object for the given key
 */
export async function putConfigByKey({
  key,
  configData,
  state,
}: {
  key: string;
  configData: CommonsConfig;
  state: State;
}): Promise<CommonsConfig> {
  const urlString = util.format(
    configURLTemplate,
    getHostOnlyUrl(state.getHost()),
    key
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).put(urlString, configData, {
    withCredentials: true,
  });
  return data;
}
