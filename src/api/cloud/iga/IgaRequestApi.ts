import util from 'util';

import { State } from '../../../shared/State';
import { getApiSearchAll } from '../../../utils/ExportImportUtils';
import { getHostOnlyUrl } from '../../../utils/ForgeRockUtils';
import { Metadata, UserInfo } from '../../ApiTypes';
import { ApplicationSkeleton } from '../../../ops/ApplicationOps';
import { generateGovernanceApi } from '../../BaseApi';

const requestsEndpointURLTemplate = '%s/iga/governance/requests';
const requestURLTemplate = requestsEndpointURLTemplate + '/%s';
const cancelRequestURLTemplate = requestURLTemplate + '?_action=cancel';

export interface RequestProperties {
  common: {
    startDate: string;
    endDate: string;
    justification: string;
    externalRequestId: string;
    isDraft: boolean;
    requestIdPrefix: string;
  };
  custom?: object;
}
export interface RequestSkeleton {
  id: string;
  requester: UserInfo;
  requestType: string;
  request: RequestProperties;
  workflow?: {
    id?: string | null;
    type?: string;
    instanceId?: string;
  };
  schemas: string[];
  glossary: object;
  descriptor: object;
  entitlement: object;
  assignment: object;
  application: ApplicationSkeleton;
  applicationOwner: object[];
  decision: {
    status: 'complete' | 'cancelled' | 'in-progress' | 'suspended';
    decision: 'approved' | null;
    type: 'request';
    outcome: 'provisioned' | 'not provisioned' | 'cancelled' | null;
    startDate: string;
    completionDate: string | null;
    deadline: string | null;
    comments: object[];
    actors: object;
    phases?: object[];
    context?: object[];
  };
  metadata: Metadata;
}

/**
 * Query requests
 * @param {string} queryFilter The query filter to query with. Default: 'true'
 * @param {string[]} fields Fields array to specify which fields to return. By default it will return all fields
 * @returns {Promise<RequestSkeleton[]>} A promise that resolves to an array of request objects
 */
export async function queryRequests({
  queryFilter = 'true',
  fields = [],
  state,
}: {
  queryFilter?: string;
  fields?: string[];
  state: State;
}): Promise<RequestSkeleton[]> {
  const urlString = util.format(
    requestsEndpointURLTemplate,
    getHostOnlyUrl(state.getHost())
  );
  return await getApiSearchAll<RequestSkeleton>({
    url: urlString,
    queryFilter,
    fields,
    state,
  });
}

/**
 * Cancel a request
 * @param {string} requestId The request id
 * @param {string} comment optional comment
 * @returns {Promise<RequestSkeleton>} A promise that resolves to a request object
 */
export async function cancelRequest({
  requestId,
  comment = '',
  state,
}: {
  requestId: string;
  comment?: string;
  state: State;
}): Promise<RequestSkeleton[]> {
  const urlString = util.format(
    cancelRequestURLTemplate,
    getHostOnlyUrl(state.getHost()),
    requestId
  );
  const { data } = await generateGovernanceApi({
    resource: {},
    state,
  }).post(
    urlString,
    { comment },
    {
      withCredentials: true,
    }
  );
  return data;
}
