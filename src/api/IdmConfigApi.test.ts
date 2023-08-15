/**
 * To record and update snapshots, you must perform 3 steps in order:
 *
 * 1. Record API responses
 *
 *    To record API responses, you must call the test:record script and
 *    override all the connection state config entities required to connect to the
 *    env to record from:
 *
 *    ATTENTION: For the recording to succeed, you MUST make sure to use a
 *               user account, not a service account.
 *
 *        FRODO_DEBUG=1 FRODO_HOST=frodo-dev npm run test:record IdmConfigApi
 *
 *    The above command assumes that you have a connection profile for
 *    'frodo-dev' on your development machine.
 *
 * 2. Update snapshots
 *
 *    After recording API responses, you must manually update/create snapshots
 *    by running:
 *
 *        FRODO_DEBUG=1 npm run test:update IdmConfigApi
 *
 * 3. Test your changes
 *
 *    If 1 and 2 didn't produce any errors, you are ready to run the tests in
 *    replay mode and make sure they all succeed as well:
 *
 *        FRODO_DEBUG=1 npm run test:only IdmConfigApi
 *
 * Note: FRODO_DEBUG=1 is optional and enables debug logging for some output
 * in case things don't function as expected
 */

import {autoSetupPolly} from "../utils/AutoSetupPolly";
import * as IdmConfigApi from "./IdmConfigApi";
import {state} from "../index";

autoSetupPolly();

async function stageConfigEntity(
  entity: {
    id: string,
    data: string | object
  },
  create = true
) {
  // delete if exists, then create
  try {
    await IdmConfigApi.deleteConfigEntity({ entityId: entity.id, state })
  } catch (error) {
    // ignore
  } finally {
    if (create) {
      await IdmConfigApi.putConfigEntity({
        entityId: entity.id,
        entityData: entity.data,
        state
      });
    }
  }
}

describe('IdmConfigApi', () => {
  const entity1 = {
    id: 'TestEntity1',
    data: {
      string: "Hello world"
    }
  }
  const entity2 = {
    id: 'TestEntity2',
    data: {
      obj1: {
        id: 'test-id',
        number: 42
      },
      obj2: ['this', 'is', 'a', 'test']
    }
  }
  // in recording mode, setup test data before recording
  beforeAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      await stageConfigEntity(entity1);
      await stageConfigEntity(entity2);
    }
  });
  // in recording mode, remove test data after recording
  afterAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      await stageConfigEntity(entity1, false);
      await stageConfigEntity(entity2, false);
    }
  });

  describe('exportConfigEntities()', () => {
    test('0: Method is implemented', async () => {
      expect(IdmConfigApi.exportConfigEntities).toBeDefined();
    });

    test('1: Export config entities', async () => {
      const response = await IdmConfigApi.exportConfigEntities({ state });
      expect(response).toMatchSnapshot();
    });
  });

});
