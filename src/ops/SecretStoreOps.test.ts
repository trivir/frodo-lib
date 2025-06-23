/**
 * To record and update snapshots, you must perform 3 steps in order:
 *
 * 1. Record API responses
 *
 *    Recording requires an available classic deployment, since secret stores
 *    can only be accessed in classic. Set FRODO_HOST and FRODO_REALM
 *    environment variables or alternatively FRODO_DEPLOY=classic
 *    in order to appropriately record requests to the classic deployment.
 *
 *    To record API responses, you must call the test:record script and
 *    override all the connection state required to connect to the
 *    env to record from:
 *
 *    ATTENTION: For the recording to succeed, you MUST make sure to use a
 *               user account, not a service account.
 *
 *        FRODO_DEBUG=1 FRODO_HOST=frodo-dev npm run test:record SecretStoreOps
 *
 *    The above command assumes that you have a connection profile for
 *    'frodo-dev' on your development machine.
 *
 * 2. Update snapshots
 *
 *    After recording API responses, you must manually update/create snapshots
 *    by running:
 *
 *        FRODO_DEBUG=1 npm run test:update SecretStoreOps
 *
 * 3. Test your changes
 *
 *    If 1 and 2 didn't produce any errors, you are ready to run the tests in
 *    replay mode and make sure they all succeed as well:
 *
 *        FRODO_DEBUG=1 npm run test:only SecretStoreOps
 *
 * Note: FRODO_DEBUG=1 is optional and enables debug logging for some output
 * in case things don't function as expected
 */
import { autoSetupPolly, setDefaultState } from "../utils/AutoSetupPolly";
import { filterRecording } from "../utils/PollyUtils";
import * as SecretStoreOps from "./SecretStoreOps";
import { state } from "../lib/FrodoLib";
import Constants from "../shared/Constants";

const ctx = autoSetupPolly();

describe('SecretStoreOps', () => {
  beforeEach(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      ctx.polly.server.any().on('beforePersist', (_req, recording) => {
        filterRecording(recording);
      });
    }
    setDefaultState(Constants.CLASSIC_DEPLOYMENT_TYPE_KEY);
  });

  describe('createSecretStoreExportTemplate()', () => {
    test('0: Method is implemented', async () => {
      expect(SecretStoreOps.createSecretStoreExportTemplate).toBeDefined();
    });

    test('1: Create SecretStore Export Template', async () => {
      const response = SecretStoreOps.createSecretStoreExportTemplate({ state });
      expect(response).toMatchSnapshot({
        meta: expect.any(Object),
      });
    });
  });

  // Phase 1
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '1')
  ) {
    describe('Cloud Tests', () => {
      beforeEach(() => {
        setDefaultState();
      });
      describe('readSecretStore()', () => {
        test('0: Method is implemented', async () => {
          expect(SecretStoreOps.readSecretStore).toBeDefined();
        });
        test('1: Read ESV secret store', async () => {
          const response = await SecretStoreOps.readSecretStore({
            secretStoreId: 'ESV',
            secretStoreTypeId: 'GoogleSecretManagerSecretStoreProvider',
            globalConfig: false,
            state,
          });
          expect(response).toMatchSnapshot();
        });
      });
    
      describe('readSecretStores()', () => {
        test('0: Method is implemented', async () => {
          expect(SecretStoreOps.readSecretStores).toBeDefined();
        });
    
        test('1: Read realm SecretStores', async () => {
          const response = await SecretStoreOps.readSecretStores({ globalConfig: false, state });
          expect(response).toMatchSnapshot();
        });
    
        test('2: Read global SecretStores', async () => {
          await expect(SecretStoreOps.readSecretStores({ globalConfig: true, state })).rejects.toThrow();
        });
      });
    
      describe('exportSecretStore()', () => {
        test('0: Method is implemented', async () => {
          expect(SecretStoreOps.exportSecretStore).toBeDefined();
        });
        test('1: Export ESV secret store', async () => {
          const response = await SecretStoreOps.exportSecretStore({
            secretStoreId: 'ESV',
            secretStoreTypeId: 'GoogleSecretManagerSecretStoreProvider',
            globalConfig: false,
            state,
          });
          expect(response).toMatchSnapshot({
            meta: expect.any(Object),
          });
        });
      });
    
      describe('exportSecretStores()', () => {
        test('0: Method is implemented', async () => {
          expect(SecretStoreOps.exportSecretStores).toBeDefined();
        });
    
        test('1: Export realm SecretStores', async () => {
          const response = await SecretStoreOps.exportSecretStores({ globalConfig: false, state });
          expect(response).toMatchSnapshot({
            meta: expect.any(Object),
          });
        });
    
        test('2: Export global SecretStores', async () => {
          await expect(SecretStoreOps.exportSecretStores({ globalConfig: true, state })).rejects.toThrow();
        });
      });
    
      describe('updateSecretStore()', () => {
        test('0: Method is implemented', async () => {
          expect(SecretStoreOps.updateSecretStore).toBeDefined();
        });
        //TODO: create tests
      });
    
      describe('updateSecretStoreMapping()', () => {
        test('0: Method is implemented', async () => {
          expect(SecretStoreOps.updateSecretStoreMapping).toBeDefined();
        });
        //TODO: create tests
      });
    
      describe('importSecretStores()', () => {
        test('0: Method is implemented', async () => {
          expect(SecretStoreOps.importSecretStores).toBeDefined();
        });
        //TODO: create tests
      });
    });
  }

  // Phase 2
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '2')
  ) {
    describe('Classic Tests', () => {
      beforeEach(() => {
        setDefaultState(Constants.CLASSIC_DEPLOYMENT_TYPE_KEY);
      });

      describe('readSecretStore()', () => {
        //TODO: create tests
      });
    
      describe('readSecretStores()', () => {
        test('0: Read realm SecretStores', async () => {
          const response = await SecretStoreOps.readSecretStores({ globalConfig: false, state });
          expect(response).toMatchSnapshot();
        });
    
        test('1: Read global SecretStores', async () => {
          const response = await SecretStoreOps.readSecretStores({ globalConfig: true, state });
          expect(response).toMatchSnapshot();
        });
      });
    
      describe('exportSecretStore()', () => {
        //TODO: create tests
      });
    
      describe('exportSecretStores()', () => {
        test('0: Export realm SecretStores', async () => {
          const response = await SecretStoreOps.exportSecretStores({ globalConfig: false, state });
          expect(response).toMatchSnapshot({
            meta: expect.any(Object),
          });
        });
    
        test('1: Export global SecretStores', async () => {
          const response = await SecretStoreOps.exportSecretStores({ globalConfig: true, state });
          expect(response).toMatchSnapshot({
            meta: expect.any(Object),
          });
        });
      });
    
      describe('updateSecretStore()', () => {
        //TODO: create tests
      });
    
      describe('updateSecretStoreMapping()', () => {
        //TODO: create tests
      });
    
      describe('importSecretStores()', () => {
        //TODO: create tests
      });
    });
  }
});
