import util from 'util';

import { State } from '../../../shared/State';
import { getApiSearchAll } from '../../../utils/ExportImportUtils';
import { getHostOnlyUrl } from '../../../utils/ForgeRockUtils';
import { Metadata, UserInfo } from '../../ApiTypes';
import { ApplicationSkeleton } from '../../../ops/ApplicationOps';

const requestsEndpointURLTemplate = '%s/iga/governance/requests';

export interface RequestSkeleton {
  id: string,
  requester: UserInfo,
  requestType: string,
  request: object,
  workflow?: {
    id?: string | null;
    type?: string;
    instanceId?: string;
  },
  schemas: string[],
  glossary: object,
  descriptor: object,
  entitlement: object,
  assignment: object,
  application: ApplicationSkeleton,
  applicationOwner: object[],
  decision: {
    status: "complete" | "cancelled" | "in-progress" | "suspended",
    decision: "approved" | null,
    type: "request",
    outcome: "provisioned" | "not provisioned" | "cancelled" | null,
    startDate: string,
    completionDate: string | null,
    deadline: string | null,
    comments: object[],
    actors: object,
    phases?: object[]
    context?: object[]
  },
  metadata: Metadata
}

/**
 * Query requests
 * @param {string} queryFilter The query filter to query with. Default: 'true'
 * @param {string[]} fields Fields array to specify which fields to return. By default it will return all fields
 * @returns {Promise<RequestSkeleton[]>} A promise that resolves to an array of request objects
 */
export async function queryRequestTypes({
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