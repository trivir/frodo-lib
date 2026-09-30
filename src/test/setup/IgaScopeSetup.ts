import {
  ScopeSkeleton,
  createScope as _createScope,
  deleteScope,
} from '../../api/cloud/iga/IgaScopeApi';
import { state } from '../../index';
import {
  autoSetupPolly,
  setupPollyRecordingContext,
} from '../../utils/AutoSetupPolly';
import { orderedMatchRequestsBy } from '../../utils/PollyUtils';

export function getTestScope(id: string, name: string): ScopeSkeleton {
  return {
    id,
    name,
    description: `Test scope: ${name}`,
    status: 'active',
    sourceCondition: {
      user: {
        version: 'v2',
        filter: {
          and: [
            {
              contains: {
                search_string: {
                  literal: '1',
                },
                in_string: 'user._id',
              },
            },
            {
              not_contains: {
                search_string: {
                  literal: '2',
                },
                in_string: 'user.accountStatus',
              },
            },
            {
              or: [
                {
                  gte: {
                    right: {
                      literal: 1,
                    },
                    left: 'user.frIndexedInteger1',
                  },
                },
                {
                  gt: {
                    right: {
                      literal: 2,
                    },
                    left: 'user.frIndexedInteger1',
                  },
                },
                {
                  lte: {
                    right: {
                      literal: 3,
                    },
                    left: 'user.frIndexedInteger1',
                  },
                },
                {
                  lt: {
                    right: {
                      literal: 4,
                    },
                    left: 'user.frIndexedInteger1',
                  },
                },
              ],
            },
            {
              and: [
                {
                  equals: {
                    right: {
                      literal: '3',
                    },
                    left: 'user.accountStatus',
                  },
                },
                {
                  not_equals: {
                    right: {
                      literal: '4',
                    },
                    left: 'user.accountStatus',
                  },
                },
                {
                  or: [
                    {
                      starts_with: {
                        prefix: {
                          literal: '5',
                        },
                        value: 'user.city',
                      },
                    },
                    {
                      ends_with: {
                        suffix: {
                          literal: '6',
                        },
                        value: 'user.country',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
    targetCondition: {
      application: {
        version: 'v2',
        filter: {},
      },
      role: {
        version: 'v2',
        filter: {
          or: [
            {
              starts_with: {
                prefix: {
                  literal: '1',
                },
                value: 'catalog.role._id',
              },
            },
            {
              equals: {
                right: {
                  literal: false,
                },
                left: 'catalog.role.glossary.Test Boolean',
              },
            },
          ],
        },
      },
      entitlement: {
        version: 'v2',
        filter: {},
      },
      user: {
        version: 'v2',
        filter: {
          or: [
            {
              not_equals: {
                right: {
                  literal: 'a',
                },
                left: 'user.city',
              },
            },
            {
              and: [
                {
                  not_equals: {
                    right: {
                      literal: 'b',
                    },
                    left: 'user.country',
                  },
                },
              ],
            },
          ],
        },
      },
    },
    permissions: {
      createEntitlement: true,
      modifyEntitlement: true,
      viewGrants: true,
      createUser: true,
      modifyUser: true,
      deleteUser: true,
      viewUserAccess: true,
      createRole: true,
      modifyRole: true,
      publishRole: true,
      deleteRole: true,
    },
  };
}

export const scope1: ScopeSkeleton = getTestScope(
  '72c65784-c1ac-47e5-9703-ea0967487e99',
  'testScope1'
);
export const scope2: ScopeSkeleton = getTestScope(
  '9db2e5b6-e9e1-483e-886a-53e2c47f8d74',
  'testScope2'
);
export const scope3: ScopeSkeleton = getTestScope(
  'a42f39bd-7f23-445e-8b71-4730d3c58f21',
  'testScope3'
);
export const scope4: ScopeSkeleton = getTestScope(
  'af71f4f1-843b-4b7a-bbdc-007bdf2cde69',
  'testScope4'
);
export const scope5: ScopeSkeleton = getTestScope(
  'cfef12ab-88e8-4d40-9553-27e50501d699',
  'testScope5'
);
export const scope6: ScopeSkeleton = getTestScope(
  '9035fc62-91e3-44af-b84b-c745699ba09b',
  'testScope6'
);
export const scope7: ScopeSkeleton = getTestScope(
  'b4c4d0cc-6e9f-4f2e-9ccf-719bac6d78e6',
  'testScope7'
);
export const scope8: ScopeSkeleton = getTestScope(
  '767e6a29-353a-4a99-9f99-84c8925cf20e',
  'testScope8'
);
export const scope9: ScopeSkeleton = getTestScope(
  '8fc1769e-94ed-42bd-ab6d-e87f0521a72c',
  'testScope9'
);

const allScopes = [
  scope1,
  scope2,
  scope3,
  scope4,
  scope5,
  scope6,
  scope7,
  scope8,
  scope9,
];

const oldScopeIds = new Map<string, string>();

/**
 * Deletes the scope, and re-creates it if createNew is true
 * @param {ScopeSkeleton} scope The scope to delete/create
 * @param {boolean} createNew True to create a new scope after deletion, false otherwise. Default: false
 */
export async function stageScope(
  scope: ScopeSkeleton,
  createNew: boolean = false
): Promise<void> {
  try {
    await deleteScope({
      id: scope.id,
      state,
    });
  } catch {
    // ignore error
  } finally {
    if (createNew) {
      const oldId = scope.id;
      scope.id = (
        await _createScope({
          scopeData: scope,
          state,
        })
      ).id;
      oldScopeIds.set(scope.id, oldId);
    }
  }
}

export function setup() {
  const ctx = autoSetupPolly(orderedMatchRequestsBy());

  beforeEach(async () => {
    state.setForceUpdate(true);
    if (process.env.FRODO_POLLY_MODE === 'record') {
      setupPollyRecordingContext(ctx, [
        {
          pathToObj: [],
          identifier: 'id',
          testObjs: allScopes,
          oldObjIds: oldScopeIds,
          namesWhereMultipleRequestsMade: [scope7.name],
        },
      ]);
    }
  });

  beforeAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      await stageScope(scope1);
      await stageScope(scope2, true);
      await stageScope(scope3);
      await stageScope(scope4);
      await stageScope(scope5, true);
      await stageScope(scope6, true);
      await stageScope(scope7, true);
      await stageScope(scope8, true);
      await stageScope(scope9, true);
    }
  });

  afterAll(async () => {
    if (process.env.FRODO_POLLY_MODE === 'record') {
      for (const scope of allScopes) {
        await stageScope(scope);
      }
    }
  });
}
