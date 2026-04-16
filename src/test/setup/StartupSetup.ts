import { state } from '../../index';
import { autoSetupPolly } from '../../utils/AutoSetupPolly';
import { filterRecording } from '../../utils/PollyUtils';

export function setup() {
    const ctx = autoSetupPolly();
  
    beforeEach(async () => {
      if (process.env.FRODO_POLLY_MODE === 'record') {
        ctx.polly.server.any().on('beforePersist', (_req, recording) => {
          // Filter recordings
          filterRecording(recording, true, state);
        });
      }
    });
}