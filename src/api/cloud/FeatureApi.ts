import util from 'node:util';

import { IdObjectSkeletonInterface } from '../../api/ApiTypes.ts';
import { State } from '../../shared/State.ts';
import { getHostOnlyUrl } from '../../utils/ForgeRockUtils.ts';
import { generateAmApi } from '../BaseApi.ts';

const envInfoURLTemplate = '%s/feature?_queryFilter=true';

const getApiConfig = () => ({});

export interface FeatureInterface extends IdObjectSkeletonInterface {
  installedVersion: string;
  availableVersions: string[];
}

/**
 * Get all features
 * @returns {Promise<{ result: FeatureInterface[]; }>} a promise that resolves to an object containing an array of feature objects
 */
export async function getFeatures({ state }: { state: State }): Promise<{
  result: FeatureInterface[];
}> {
  const urlString = util.format(
    envInfoURLTemplate,
    getHostOnlyUrl(state.getHost())
  );
  const { data } = await generateAmApi({ resource: getApiConfig(), state }).get(
    urlString,
    {
      withCredentials: true,
    }
  );
  return data;
}
