/**
 * To record and update snapshots, you must perform 3 steps in order:
 *
 * 1. Record API responses & update snapshots
 *
 *    This step breaks down into 2 phases:
 *
 *    Phase 1: Record Non-destructive tests
 *    Phase 2: Record DESTRUCTIVE tests
 *
 *    Because destructive tests interfere with the recording of non-destructive
 *    tests and also interfere among themselves, they have to be run in groups
 *    of non-interfering tests.
 *
 *    To record and update snapshots, you must call the test:record
 *    script and override all the connection state variables required
 *    to connect to the env to record from and also indicate the phase:
 *
 *        FRODO_DEBUG=1 FRODO_RECORD_PHASE=1 FRODO_HOST=frodo-dev npm run test:record IgaScopeOps
 *
 *    THESE TESTS ARE DESTRUCTIVE!!! DO NOT RUN AGAINST AN ENV WITH ACTIVE SCOPES!!!
 *
 *        FRODO_DEBUG=1 FRODO_RECORD_PHASE=2 FRODO_HOST=frodo-dev npm run test:record IgaScopeOps
 *
 *    The above command assumes that you have a connection profile for
 *    'frodo-dev' on your development machine.
 *
 * 2. Update CJS snapshots
 *
 *    After recording, the ESM snapshots will already be updated as that happens
 *    in one go, but you must manually update the CJS snapshots by running:
 *
 *        FRODO_DEBUG=1 npm run test:update IgaScopeOps
 *
 * 3. Test your changes
 *
 *    If 1 and 2 didn't produce any errors, you are ready to run the tests in
 *    replay mode and make sure they all succeed as well:
 *
 *        npm run test:only IgaScopeOps
 *
 * Note: FRODO_DEBUG=1 is optional and enables debug logging for some output
 * in case things don't function as expected
 */
import { state } from '../../../index';
import * as IgaScopeOps from './IgaScopeOps';
import * as TestData from '../../../test/setup/IgaScopeSetup';
import { snapshotResultCallback } from '../../../test/utils/TestUtils';

describe('IgaScopeOps', () => {

  TestData.setup();

  // Phase 1 - Non-destructive + scoped destructive tests
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '1')
  ) {

    describe('createScopeExportTemplate()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.createScopeExportTemplate).toBeDefined();
      });

      test('1: Create scope export template', () => {
        const response = IgaScopeOps.createScopeExportTemplate({ state });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });
    });

    describe('readScope()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.readScope).toBeDefined();
      });

      test('1: Read existing scope by ID', async () => {
        const response = await IgaScopeOps.readScope({
          id: TestData.scope1.id,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('2: Read non-existing scope by ID', async () => {
        await expect(
          IgaScopeOps.readScope({
            id: TestData.scope5.id,
            state,
          })
        ).rejects.toThrow(`Error reading scope ${TestData.scope5.id}`);
      });
    });

    describe('readScopeByName()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.readScopeByName).toBeDefined();
      });

      test('1: Read existing scope by name', async () => {
        const response = await IgaScopeOps.readScopeByName({
          name: TestData.scope2.name,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('2: Read non-existing scope by name', async () => {
        await expect(
          IgaScopeOps.readScopeByName({
            name: TestData.scope5.name,
            state,
          })
        ).rejects.toThrow(`Error reading scope ${TestData.scope5.name}`);
      });
    });

    describe('readScopes()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.readScopes).toBeDefined();
      });

      test('1: Read all scopes', async () => {
        const response = await IgaScopeOps.readScopes({
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });

    describe('readScopeEntities()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.readScopeEntities).toBeDefined();
      });

      test('1: Read scope entities', async () => {
        const response = await IgaScopeOps.readScopeEntities({
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });

    describe('readScopeEntitySchema()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.readScopeEntitySchema).toBeDefined();
      });

      test('1: Read scope entity schema for known entity type', async () => {
        const response = await IgaScopeOps.readScopeEntitySchema({
          entityName: 'user',
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('2: Read scope entity schema for unknown entity type', async () => {
        await expect(
          IgaScopeOps.readScopeEntitySchema({
            entityName: 'unknownEntityType',
            state,
          })
        ).rejects.toThrow(`Error reading scope entity schema for unknownEntityType`);
      });
    });

    describe('exportScope()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.exportScope).toBeDefined();
      });

      test('1: Export existing scope by ID', async () => {
        const response = await IgaScopeOps.exportScope({
          id: TestData.scope1.id,
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

      test('2: Export non-existing scope by ID', async () => {
        await expect(
          IgaScopeOps.exportScope({
            id: TestData.scope5.id,
            state,
          })
        ).rejects.toThrow(`Error exporting scope ${TestData.scope5.id}`);
      });
    });

    describe('exportScopeByName()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.exportScopeByName).toBeDefined();
      });

      test('1: Export existing scope by name', async () => {
        const response = await IgaScopeOps.exportScopeByName({
          name: TestData.scope2.name,
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

      test('2: Export non-existing scope by name', async () => {
        await expect(
          IgaScopeOps.exportScopeByName({
            name: TestData.scope5.name,
            state,
          })
        ).rejects.toThrow(`Error exporting scope ${TestData.scope5.name}`);
      });
    });

    describe('exportScopes()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.exportScopes).toBeDefined();
      });

      test('1: Export all scopes', async () => {
        const response = await IgaScopeOps.exportScopes({
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });
    });

    describe('updateScope()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.updateScope).toBeDefined();
      });

      test('1: Update existing scope', async () => {
        const response = await IgaScopeOps.updateScope({
          id: TestData.scope1.id,
          scopeData: TestData.scope1,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('2: Update non-existing scope', async () => {
        await expect(
          IgaScopeOps.updateScope({
            id: TestData.scope5.id,
            scopeData: TestData.scope5,
            state,
          })
        ).rejects.toThrow(`Error updating scope '${TestData.scope5.id}'`);
      });
    });

    describe('importScopes()', () => {
      const importData = IgaScopeOps.createScopeExportTemplate({ state });
      importData.scope = {
        [TestData.scope1.id]: TestData.scope1,
        [TestData.scope2.id]: TestData.scope2,
        [TestData.scope3.id]: TestData.scope3,
      };

      test('0: Method is implemented', () => {
        expect(IgaScopeOps.importScopes).toBeDefined();
      });

      test('1: Import none (empty import data)', async () => {
        const response = await IgaScopeOps.importScopes({
          importData: IgaScopeOps.createScopeExportTemplate({ state }),
          resultCallback: snapshotResultCallback,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('2: Import by ID', async () => {
        const response = await IgaScopeOps.importScopes({
          id: TestData.scope1.id,
          importData,
          resultCallback: snapshotResultCallback,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('3: Import by name', async () => {
        const response = await IgaScopeOps.importScopes({
          name: TestData.scope2.name,
          importData,
          resultCallback: snapshotResultCallback,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('4: Import all', async () => {
        const response = await IgaScopeOps.importScopes({
          importData,
          resultCallback: snapshotResultCallback,
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });

    describe('deleteScope()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.deleteScope).toBeDefined();
      });

      test('1: Delete existing scope by ID', async () => {
        const response = await IgaScopeOps.deleteScope({
          id: TestData.scope3.id,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('2: Delete non-existing scope by ID', async () => {
        await expect(
          IgaScopeOps.deleteScope({
            id: TestData.scope5.id,
            state,
          })
        ).rejects.toThrow(`Error deleting scope ${TestData.scope5.id}`);
      });
    });

    describe('deleteScopeByName()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.deleteScopeByName).toBeDefined();
      });

      test('1: Delete existing scope by name', async () => {
        const response = await IgaScopeOps.deleteScopeByName({
          name: TestData.scope4.name,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('2: Delete non-existing scope by name', async () => {
        await expect(
          IgaScopeOps.deleteScopeByName({
            name: TestData.scope5.name,
            state,
          })
        ).rejects.toThrow(`Error deleting scope ${TestData.scope5.name}`);
      });
    });

  }

  // Phase 2 - Bulk destructive tests only
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '2')
  ) {

    describe('deleteScopes()', () => {
      test('0: Method is implemented', () => {
        expect(IgaScopeOps.deleteScopes).toBeDefined();
      });

      test('1: Delete all scopes', async () => {
        const response = await IgaScopeOps.deleteScopes({
          resultCallback: snapshotResultCallback,
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });

  }
});