import {
  ScopeSkeleton,
  createScope as _createScope,
  deleteScope as _deleteScope,
  queryScopes as _queryScopes,
} from '../../api/cloud/iga/IgaScopeApi';
import { state } from '../../index';
import {
  autoSetupPolly,
  setupPollyRecordingContext,
} from '../../utils/AutoSetupPolly';
import { defaultMatchRequestsBy } from '../../utils/PollyUtils';

export function getTestScopeData(
  name: string
): Omit<ScopeSkeleton, 'id' | '_rev'> {
  return {
    name,
    description: `Test scope: ${name}`,
    status: 'active',
    sourceCondition: {
      user: {
        version: 'v2',
        filter: {},
      },
    },
    targetCondition: {
      application: {
        version: 'v2',
        filter: {},
      },
    },
    permissions: {
      viewUserAccess: true,
      viewGrants: true,
    },
    entity: {
      class: 'managed/user',
      type: 'string',
    },
  };
}

/**
 * Other IGA commands allow user generated IDs. Scope uses Server generated Ids. 
 * This is a problem because it means that when the id is created, it is random causing the tests to fail. 
 * To bypass this, I had to manually create and hard code the scope id
 */

// scope1: used for readScope, exportScope, updateScope
export const scope1: ScopeSkeleton = {
  id: '72c65784-c1ac-47e5-9703-ea0967487e99',
  _rev: 0,
  ...getTestScopeData('scope1'),
};

// scope2: used for readScopeByName, exportScopeByName
export const scope2: ScopeSkeleton = {
  id: '9db2e5b6-e9e1-483e-886a-53e2c47f8d74',
  _rev: 0,
  ...getTestScopeData('scope2'),
};

// scope3: used for deleteScope by ID
export const scope3: ScopeSkeleton = {
  id: 'a42f39bd-7f23-445e-8b71-4730d3c58f21',
  _rev: 0,
  ...getTestScopeData('scope3'),
};

// scope4: used for deleteScopeByName
export const scope4: ScopeSkeleton = {
  id: 'af71f4f1-843b-4b7a-bbdc-007bdf2cde69',
  _rev: 0,
  ...getTestScopeData('scope4'),
};

// scope5: never staged — used for all negative/non-existing test cases
export const scope5: ScopeSkeleton = {
  id: 'cfef12ab-88e8-4d40-9553-27e50501d699',
  _rev: 0,
  ...getTestScopeData('scope5'),
};

/**
 * Delete any existing scope with the given name, then optionally create a fresh one.
 * Because the API assigns IDs on create, staging always deletes by name query
 * rather than by ID.
 */
export async function stageScope(scope: ScopeSkeleton, createNew = false) {
  try {
    const existing = await _queryScopes({
      queryFilter: `name eq "${scope.name}"`,
      state,
    });
    for (const s of existing) {
      await _deleteScope({ id: s.id, state });
    }
  } catch (error) {
    //ignore
    }
  if (createNew) {
    await _createScope({
      scopeData: scope,
      state,
    });
  }
}

export function setup() {
  const ctx = autoSetupPolly(defaultMatchRequestsBy());

  beforeEach(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      setupPollyRecordingContext(ctx, []);
    }
  });

  // in recording mode, setup test data before recording
  beforeAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {

      await stageScope(scope5, false);
    }
  });

  // in recording mode, remove test data after recording
  afterAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      await stageScope(scope1);
      await stageScope(scope2);
      await stageScope(scope3);
      await stageScope(scope4);
      await stageScope(scope5);
    }
  });
}
