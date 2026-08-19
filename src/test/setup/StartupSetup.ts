import { beforeAll, beforeEach, afterAll } from '@jest/globals';

import { autoSetupPolly } from '../../utils/AutoSetupPolly.ts';
import { filterRecording } from '../../utils/PollyUtils.ts';
import { stageSecret, secret1, secret2 } from './SecretSetup.ts';
import { stageVariable, variable1, variable2 } from './VariablesSetup.ts';

export async function setup() {
  const ctx = autoSetupPolly();

  // filter out secrets when recording
  beforeEach(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      ctx.polly.server.any().on('beforePersist', (_req: any, recording: any) => {
        filterRecording(recording);
      });
    }
  });

  // in recording mode, setup test data before recording
  beforeAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      await stageVariable(variable1);
      await stageVariable(variable2);
      await stageSecret(secret1);
      await stageSecret(secret2);
    }
  });

  // in recording mode, remove test data after recording
  afterAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      await stageVariable(variable1, false);
      await stageVariable(variable2, false);
      await stageSecret(secret1, false);
      await stageSecret(secret2, false);
    }
  });
}
