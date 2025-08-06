import { IdObjectSkeletonInterface } from '../api/ApiTypes';
import { getRawAm, getRawEnv, getRawIdm } from '../api/RawConfigApi';
import { State } from '../shared/State';
import { debugMessage, verboseMessage } from '../utils/Console';
import { FrodoError } from './FrodoError';
import { mergeDeep } from '../utils/JsonUtils';

export type RawConfig = {
  exportRawConfig(path: string)
};

export default (state: State): RawConfig => {
  return {
    async exportRawConfig(configObject: any) {
      return exportRawConfig({ state, configObject });
    }
  };
};

export async function exportRawConfig({
  state,
  configObject,
}: {
  state: State;
  configObject: any;
}): Promise<IdObjectSkeletonInterface> {
  try {
    let response: IdObjectSkeletonInterface;

      // remove starting slash from path if it exists
      if (configObject.path.startsWith('/')) {
        configObject.path = configObject.path.substring(1);
      }

      // support for only three root paths, am, openidm, and environment
      const urlParts: string[] = configObject.path.split('/');
      const startPath: string = urlParts.reverse().pop();
      const noStart: string = urlParts.reverse().join('/');
      switch (startPath) {
        case 'openidm':
          response = await getRawIdm({ state, url: noStart });
          break;
        case 'am':
          response = await getRawAm({ state, url: noStart });
          // fr-config-manager has this option, only for am end points
          if (configObject.pushApiVersion) {
            response._pushApiVersion = configObject.pushApiVersion;
          }
          break;
        case 'environment':
          response = await getRawEnv({ state, url: noStart });
          break;
        default:
            throw new FrodoError(
              `URL paths that start with ${startPath} are not supported`
          );
          break;
      }

      // all endpoints can have overrides
      if (configObject.overrides) {
        response = mergeDeep(response, configObject.overrides);
      }
    return response;
  } catch (error) {
    throw new FrodoError(
      `Error in exportRawIdm with relative url: ${configObject.path}`,
      error
    );
  }
}
