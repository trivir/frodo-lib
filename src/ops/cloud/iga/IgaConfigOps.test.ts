/**
 * To record and update snapshots, you must perform 3 steps in order:
 *
 * 1. Record API responses & update snapshots
 *
 *
 *    Record Non-destructive tests
 *
 *    Because destructive tests interfere with the recording of non-destructive
 *    tests and also interfere among themselves, they have to be run in groups
 *    of non-interfering tests.
 *
 *    To record and update snapshots, you must call the test:record
 *    script and override all the connection state variables required
 *    to connect to the env to record from and also indicate the phase:
 *
 *        FRODO_DEBUG=1 FRODO_RECORD_PHASE=1 FRODO_HOST=frodo-dev npm run test:record IgaConfigOps
 *
 *    The above command assumes that you have a connection profile for
 *    'frodo-dev' on your development machine.
 *
 * 2. Update CJS snapshots
 *
 *    After recording, the ESM snapshots will already be updated as that happens
 *    in one go, but you must manually update the CJS snapshots by running:
 *
 *        FRODO_DEBUG=1 npm run test:update IgaConfigOps
 *
 * 3. Test your changes
 *
 *    If 1 and 2 didn't produce any errors, you are ready to run the tests in
 *    replay mode and make sure they all succeed as well:
 *
 *        npm run test:only IgaConfigOps
 *
 * Note: FRODO_DEBUG=1 is optional and enables debug logging for some output
 * in case things don't function as expected
 */
import { state } from '../../../index';
import * as IgaConfigOps from '../../../ops/cloud/iga/IgaConfigOps';
import * as TestData from '../../../test/setup/IgaConfigSetup';
import { snapshotResultCallback } from '../../../test/utils/TestUtils';

describe('IgaConfigOps', () => {

  TestData.setup();

  describe('createConfigExportTemplate()', () => {
    test('0: Method is implemented', async () => {
      expect(IgaConfigOps.createConfigExportTemplate).toBeDefined();
    });

    test('1: Create config export template', async () => {
      const response = IgaConfigOps.createConfigExportTemplate({ state });
      expect(response).toMatchSnapshot({
        meta: expect.any(Object),
      });
    });
  });

  describe('readConfig()', () => {
    test('0: Method is implemented', async () => {
      expect(IgaConfigOps.readConfig).toBeDefined();
    });

    test('1: Read full IGA config', async () => {
      const response = await IgaConfigOps.readConfig({ state });
      expect(response).toMatchSnapshot();
    });
  });

  describe('readConfigByKey()', () => {
    test('0: Method is implemented', async () => {
      expect(IgaConfigOps.readConfigByKey).toBeDefined();
    });

    test('1: Read existing config key', async () => {
      const response = await IgaConfigOps.readConfigByKey({
        key: TestData.existingKey as string,
        state,
      });
      expect(response).toMatchSnapshot();
    });

    test('2: Read non-existing config key', async () => {
      await expect(
        IgaConfigOps.readConfigByKey({
          key: TestData.nonExistingKey as string,
          state,
        })
      ).rejects.toThrow(
        `Error reading request form IGA config ${TestData.nonExistingKey}`
      );
    });
  });

  describe('exportConfig()', () => {
    test('0: Method is implemented', async () => {
      expect(IgaConfigOps.exportConfig).toBeDefined();
    });

    test('1: Export all IGA config', async () => {
      const response = await IgaConfigOps.exportConfig({ state });
      expect(response).toMatchSnapshot({
        meta: expect.any(Object),
      });
    });

    test('2: Export all IGA config with result callback', async () => {
      const response = await IgaConfigOps.exportConfig({
        resultCallback: snapshotResultCallback,
        state,
      });
      expect(response).toMatchSnapshot({
        meta: expect.any(Object),
      });
    });
  });

  describe('exportConfigByKey()', () => {
    test('0: Method is implemented', async () => {
      expect(IgaConfigOps.exportConfigByKey).toBeDefined();
    });

    test('1: Export existing config key', async () => {
      const response = await IgaConfigOps.exportConfigByKey({
        key: TestData.existingKey as string,
        state,
      });
      expect(response).toMatchSnapshot({
        meta: expect.any(Object),
      });
    });

    test('2: Export non-existing config key', async () => {
      await expect(
        IgaConfigOps.exportConfigByKey({
          key: TestData.nonExistingKey as string,
          state,
        })
      ).rejects.toThrow(
        `Error exporting IGA config for key ${TestData.nonExistingKey}`
      );
    });
  });

  describe('importConfig()', () => {
    test('0: Method is implemented', async () => {
      expect(IgaConfigOps.importConfig).toBeDefined();
    });

    test('1: Import full config', async () => {
      const importData = await IgaConfigOps.exportConfig({ state });
      const response = await IgaConfigOps.importConfig({
        importData,
        state,
      });
      expect(response).toMatchSnapshot();
    });
  });

  describe('importConfigByKey()', () => {
    test('0: Method is implemented', async () => {
      expect(IgaConfigOps.importConfigByKey).toBeDefined();
    });

    test('1: Import existing config key', async () => {
      const importData = await IgaConfigOps.exportConfigByKey({
        key: TestData.existingKey as string,
        state,
      });
      const response = await IgaConfigOps.importConfigByKey({
        key: TestData.existingKey as string,
        importData,
        state,
      });
      expect(response).toMatchSnapshot();
    });

    test('2: Import with key missing from import data', async () => {
      const importData = await IgaConfigOps.exportConfigByKey({
        key: TestData.existingKey2 as string,
        state,
      });
      await expect(
        IgaConfigOps.importConfigByKey({
          key: TestData.existingKey as string,
          importData,
          state,
        })
      ).rejects.toThrow(
        `Error importing IGA config for key ${TestData.existingKey}`
      );
    });

    test('3: Import non-existing config key', async () => {
      const importData = {
        config: {
          [TestData.nonExistingKey]: {},
        },
      };
      await expect(
        IgaConfigOps.importConfigByKey({
          key: TestData.nonExistingKey as string,
          importData,
          state,
        })
      ).rejects.toThrow(
        `Error importing IGA config for key ${TestData.nonExistingKey}`
      );
    });
  });
});