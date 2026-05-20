import { ScopeSkeleton } from '../../api/cloud/iga/IgaScopeApi';
import { state } from '../../index';
import {
  createScope as _createScope,
  deleteScope as _deleteScope,
  queryScopes as _queryScopes,
} from '../../api/cloud/iga/IgaScopeApi';
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



// scope1: used for readScope, exportScope, updateScope
export const scope1: ScopeSkeleton = {
  id: '73c690c8-8251-4914-98e4-722f762dd5ec',
  _rev: 0,
  ...getTestScopeData('test_scope_1'),
};

// scope2: used for readScopeByName, exportScopeByName
export const scope2: ScopeSkeleton = {
  id: '0fbe053c-aa3a-447f-a1df-e409790036a1',
  _rev: 0,
  ...getTestScopeData('test_scope_2'),
};

// scope3: used for deleteScope by ID
export const scope3: ScopeSkeleton = {
  id: '537dc742-4f97-4c39-8603-3cb33c6aa5ee',
  _rev: 0,
  ...getTestScopeData('test_scope_3'),
};

// scope4: used for deleteScopeByName
export const scope4: ScopeSkeleton = {
  id: '8c8362be-31db-4a4c-8a06-a45845674f15',
  _rev: 0,
  ...getTestScopeData('test_scope_4'),
};

// scope5: never staged — used for all negative/non-existing test cases
export const scope5: ScopeSkeleton = {
  id: '11111111-1111-1111-1111-111111111111',
  _rev: 0,
  ...getTestScopeData('test_scope_5'),
};

/**
 * Delete any existing scope with the given name, then optionally create a fresh one.
 * Because the API assigns IDs on create, staging always deletes by name query
 * rather than by ID.
 */
export async function stageScope(
  scope: ScopeSkeleton,
  createNew = false
) {
  try {
    const existing = await _queryScopes({
      queryFilter: `name eq "${scope.name}"`,
      state,
    });
    for (const s of existing) {
      await _deleteScope({ id: s.id, state });
    }
  } catch (error) {
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
      // scope1: exists — used for readScope, exportScope, updateScope
      await stageScope(scope1, true);
      // scope2: exists — used for readScopeByName, exportScopeByName
      await stageScope(scope2, true);
      // scope3: exists — used for deleteScope by ID
      await stageScope(scope3, true);
      // scope4: exists — used for deleteScopeByName
      await stageScope(scope4, true);
      // scope5: does NOT exist — used for all negative test cases
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