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
import { cloneDeep } from '../../../utils/JsonUtils';
import { ScopeSkeleton } from '../../../api/cloud/iga/IgaScopeApi';

describe('IgaScopeOps', () => {

  TestData.setup();

  // Phase 1
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '1')
  ) {
    describe('createScopeExportTemplate()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.createScopeExportTemplate).toBeDefined();
      });

      test('1: Create Scope Export Template', async () => {
        const response = IgaScopeOps.createScopeExportTemplate({ state });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object)
        });
      });
    });

    describe('createScope()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.createScope).toBeDefined();
      });

      test(`1: Create scope`, async () => {
        const response = await IgaScopeOps.createScope({
          scopeData: TestData.scope1,
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });

    describe('readScope()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.readScope).toBeDefined();
      });

      test(`1: Read existing scope by ID`, async () => {
        const response = await IgaScopeOps.readScope({
          id: TestData.scope2.id,
          state,
        });
        expect(response).toMatchSnapshot();
      });
  
      test('2: Read non-existing scope', async () => {
        const unknownId = '11111111-1111-1111-1111-111111111111';
        await expect(IgaScopeOps.readScope({
          id: unknownId,
          state,
        })).rejects.toThrow('Error reading scope ' + unknownId);
      });
    });

    describe('readScopeByName()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.readScopeByName).toBeDefined();
      });

      test(`1: Read existing scope by name`, async () => {
        const response = await IgaScopeOps.readScopeByName({
          name: TestData.scope2.name,
          state,
        });
        expect(response).toMatchSnapshot();
      });
  
      test('2: Read non-existing scope with unknown name', async () => {
        const unknownName = 'unknownName';
        await expect(IgaScopeOps.readScopeByName({
          name: unknownName,
          state,
        })).rejects.toThrow('Error reading scope ' + unknownName);
      });
    });

    describe('readScopes()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.readScopes).toBeDefined();
      });

      test(`1: Read existing scopes`, async () => {
        const response = await IgaScopeOps.readScopes({
          state,
        });
        expect(response).toMatchSnapshot();
      });
    });

    describe('exportScope()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.exportScope).toBeDefined();
      });

      test(`1: Export existing scope by ID`, async () => {
        const response = await IgaScopeOps.exportScope({
          id: TestData.scope2.id,
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });
  
      test('2: Export non-existing scope', async () => {
        const unknownId = '11111111-1111-1111-1111-111111111111';
        await expect(IgaScopeOps.exportScope({
          id: unknownId,
          state,
        })).rejects.toThrow('Error exporting scope ' + unknownId);
      });
    });

    describe('exportScopeByName()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.exportScopeByName).toBeDefined();
      });

      test(`1: Export existing scope by name`, async () => {
        const response = await IgaScopeOps.exportScopeByName({
          name: TestData.scope2.name,
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });

      test('2: Export non-existing scope with unknown name', async () => {
        const unknownName = 'unknownName';
        await expect(IgaScopeOps.exportScopeByName({
          name: unknownName,
          state,
        })).rejects.toThrow('Error exporting scope ' + unknownName);
      });
    });

    describe('exportScopes()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.exportScopes).toBeDefined();
      });

      test(`1: Export existing scopes`, async () => {
        const response = await IgaScopeOps.exportScopes({
          state,
        });
        expect(response).toMatchSnapshot({
          meta: expect.any(Object),
        });
      });
    });

    describe('updateScope()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.updateScope).toBeDefined();
      });

      test(`1: Update existing scope`, async () => {
        const response = await IgaScopeOps.updateScope({
          id: TestData.scope2.id,
          scopeData: TestData.scope2,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('2: Should not update scope if no changes are made', async () => {
        state.setForceUpdate(false);
        let response = await IgaScopeOps.updateScope({
          id: TestData.scope8.id,
          scopeData: TestData.scope8,
          state: state,
        });
        expect(response).toBeNull();
        const scope: ScopeSkeleton = cloneDeep(TestData.scope8);
        scope.description = 'test new description'; 
        response = await IgaScopeOps.updateScope({
          id: scope.id,
          scopeData: scope,
          state: state,
        });
        expect(response).not.toBeNull();
        expect(response.description).toBe('test new description');
        expect(response).toMatchSnapshot();
      });
    });

    describe('importScopes()', () => {
      const importData = IgaScopeOps.createScopeExportTemplate({ state });
      importData.scope = {
        [TestData.scope3.id]: TestData.scope3,
        [TestData.scope4.id]: TestData.scope4,
        [TestData.scope5.id]: TestData.scope5,
      }
      
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.importScopes).toBeDefined();
      });

      test('1: Import None', async () => {
        const response = await IgaScopeOps.importScopes({
          importData: IgaScopeOps.createScopeExportTemplate({ state }),
          resultCallback: snapshotResultCallback,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('2: Import by ID', async () => {
        await TestData.stageScope(TestData.scope3);
        const response = await IgaScopeOps.importScopes({
          id: TestData.scope3.id,
          importData,
          resultCallback: snapshotResultCallback,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('3: Import by Name', async () => {
        await TestData.stageScope(TestData.scope3);
        const response = await IgaScopeOps.importScopes({
          name: TestData.scope3.name,
          importData,
          resultCallback: snapshotResultCallback,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('4: Import all', async () => {
        await TestData.stageScope(TestData.scope3);
        const response = await IgaScopeOps.importScopes({
          importData,
          resultCallback: snapshotResultCallback,
          state,
        });
        expect(response).toMatchSnapshot();
      });

      test('5: Should not import scope if no changes were made', async () => {
        state.setForceUpdate(false);
        const importData = IgaScopeOps.createScopeExportTemplate({ state });
        importData.scope[TestData.scope9.id] = TestData.scope9;
        let response = await IgaScopeOps.importScopes({
          importData,
          resultCallback: snapshotResultCallback,
          state: state,
        });
        expect(response.length).toBe(0);
        const scope: ScopeSkeleton = cloneDeep(TestData.scope9);
        scope.description = 'test new description';
        importData.scope[scope.id] = scope;
        response = await IgaScopeOps.importScopes({
          importData,
          resultCallback: snapshotResultCallback,
          state: state,
        });
        expect(response.length).toBe(1);
        expect(response[0].description).toBe('test new description');
        expect(response).toMatchSnapshot();
      });
    });

    describe('deleteScope()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.deleteScope).toBeDefined();
      });

      test(`1: Delete existing scope by id`, async () => {
        const response = await IgaScopeOps.deleteScope({
          id: TestData.scope6.id,
          state,
        });
        expect(response).toMatchSnapshot();
      });
  
      test('2: Delete non-existing scope by id', async () => {
        const unknownId = '11111111-1111-1111-1111-111111111111';
        await expect(IgaScopeOps.deleteScope({
          id: unknownId,
          state,
        })).rejects.toThrow('Error deleting scope ' + unknownId);
      });
    });

    describe('deleteScopeByName()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.deleteScopeByName).toBeDefined();
      });

      test(`1: Delete existing scope by name`, async () => {
        const response = await IgaScopeOps.deleteScopeByName({
          name: TestData.scope7.name,
          state,
        });
        expect(response).toMatchSnapshot();
      });
  
      test('2: Delete non-existing scope by name', async () => {
        const unknownName = 'unknownName';
        await expect(IgaScopeOps.deleteScopeByName({
          name: unknownName,
          state,
        })).rejects.toThrow('Error deleting scope ' + unknownName);
      });
    });
  }

  // Phase 2
  if (
    !process.env.FRODO_POLLY_MODE ||
    (process.env.FRODO_POLLY_MODE === 'record' &&
      process.env.FRODO_RECORD_PHASE === '2')
  ) {
    describe('deleteScopes()', () => {
      test('0: Method is implemented', async () => {
        expect(IgaScopeOps.deleteScopes).toBeDefined();
      });

      test.todo('1: Delete existing scopes');
    });
  }
});