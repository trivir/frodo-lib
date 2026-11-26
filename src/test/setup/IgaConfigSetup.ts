import { CommonsConfig } from '../../api/cloud/iga/IgaConfigApi';
import { state } from '../../index';
import { updateConfigByKey } from '../../ops/cloud/iga/IgaConfigOps';
import {
  autoSetupPolly,
  setupPollyRecordingContext,
} from '../../utils/AutoSetupPolly';
import { defaultMatchRequestsBy } from '../../utils/PollyUtils';



export function getTestConfigValue(key: string): CommonsConfig[keyof CommonsConfig] {
  return {
    enabled: true,
    description: `Test config for ${key}`,
    defaultApprover: 'managed/role/8b470ae7-d40a-4f6a-87cd-b39c2f144fe7',
  } as unknown as CommonsConfig[keyof CommonsConfig];
}

export const existingKey = 'iga_global' as keyof CommonsConfig;

export const existingKey2 = 'iga_access_request' as keyof CommonsConfig;

export const nonExistingKey = 'iga_nonexistent_key_xyz' as keyof CommonsConfig;


export function getTestExportData(key: keyof CommonsConfig) {
  return {
    config: {
      [key]: getTestConfigValue(key as string),
    } as CommonsConfig,
  };
}


export async function stageConfigKey(
  key: string,
  stage = false
) {
  if (stage) {
    try {
      await updateConfigByKey({
        key,
        configData: getTestConfigValue(key) as CommonsConfig,
        state,
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // ignore — key may not accept arbitrary writes in all environments
    }
  }
}

export function setup() {
  const ctx = autoSetupPolly(defaultMatchRequestsBy());

  beforeEach(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      setupPollyRecordingContext(ctx, []);
    }
  });

  beforeAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {

      await stageConfigKey(existingKey as string, true);
      await stageConfigKey(existingKey2 as string, true);
    }
  });

  afterAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      await stageConfigKey(existingKey as string, true);
      await stageConfigKey(existingKey2 as string, true);
    }
  });
}