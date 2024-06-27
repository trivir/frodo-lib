/**
 * To record and update snapshots, you must perform 3 steps in order:
 *
 * 1. Record API responses
 *
 *    To record API responses, you must call the test:record script and
 *    override all the connection state required to connect to the
 *    env to record from:
 *
 *    ATTENTION: For the recording to succeed, you MUST make sure to use a
 *               user account, not a service account.
 *
 *        FRODO_DEBUG=1 FRODO_HOST=frodo-dev npm run test:record MappingOps
 *
 *    The above command assumes that you have a connection profile for
 *    'frodo-dev' on your development machine.
 *
 * 2. Update snapshots
 *
 *    After recording API responses, you must manually update/create snapshots
 *    by running:
 *
 *        FRODO_DEBUG=1 npm run test:update MappingOps
 *
 * 3. Test your changes
 *
 *    If 1 and 2 didn't produce any errors, you are ready to run the tests in
 *    replay mode and make sure they all succeed as well:
 *
 *        FRODO_DEBUG=1 npm run test:only MappingOps
 *
 * Note: FRODO_DEBUG=1 is optional and enables debug logging for some output
 * in case things don't function as expected
 */
import { autoSetupPolly } from "../utils/AutoSetupPolly";
import { filterRecording } from "../utils/PollyUtils";
import * as MappingOps from "./MappingOps";
import {state} from "../lib/FrodoLib";

const ctx = autoSetupPolly();

describe('MappingOps', () => {
  beforeEach(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      ctx.polly.server.any().on('beforePersist', (_req, recording) => {
        filterRecording(recording);
      });
    }
  });

  describe('createMappingExportTemplate()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.createMappingExportTemplate).toBeDefined();
    });

    test('1: Create Mapping Export Template', async () => {
      const response = MappingOps.createMappingExportTemplate({ state });
      expect(response).toMatchSnapshot({
        meta: expect.any(Object),
      });
    });
  });

  describe('readSyncMappings()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.readSyncMappings).toBeDefined();
    });

    test('1: Read sync mappings', async () => {
      const response = await MappingOps.readSyncMappings({ state });
      expect(response).toMatchSnapshot();
    });
  });

  describe('readNewMappings()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.readNewMappings).toBeDefined();
    });

    test('1: Read new mappings', async () => {
      const response = await MappingOps.readNewMappings({ state });
      expect(response).toMatchSnapshot();
    });
  });

  describe('readMappings()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.readMappings).toBeDefined();
    });

    test('1: Read mappings', async () => {
      const response = await MappingOps.readMappings({ state });
      expect(response).toMatchSnapshot();
    });
  });

  describe('readMapping()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.readMapping).toBeDefined();
    });
    //TODO: create tests
  });

  describe('createMapping()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.createMapping).toBeDefined();
    });
    //TODO: create tests
  });

  describe('updateMapping()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.updateMapping).toBeDefined();
    });
    //TODO: create tests
  });

  describe('updateLegacyMappings()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.updateLegacyMappings).toBeDefined();
    });
    //TODO: create tests
  });

  describe('deleteMappings()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.deleteMappings).toBeDefined();
    });
    //TODO: create tests
  });

  describe('deleteMapping()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.deleteMapping).toBeDefined();
    });
    //TODO: create tests
  });

  describe('exportMapping()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.exportMapping).toBeDefined();
    });
    //TODO: create tests
  });

  describe('exportMappings()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.exportMappings).toBeDefined();
    });

    test('1: Export mappings', async () => {
      const response = await MappingOps.exportMappings({ state });
      expect(response).toMatchSnapshot({
        meta: expect.any(Object),
      });
    });
  });

  describe('importMapping()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.importMapping).toBeDefined();
    });
    //TODO: create tests
  });

  describe('importFirstMapping()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.importFirstMapping).toBeDefined();
    });
    //TODO: create tests
  });

  describe('importMappings()', () => {
    test('0: Method is implemented', async () => {
      expect(MappingOps.importMappings).toBeDefined();
    });
    //TODO: create tests
  });
});
