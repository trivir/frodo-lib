export interface NoIdObjectSkeletonInterface {
  _rev?: string;
  [k: string]:
    | string
    | number
    | boolean
    | string[]
    | IdObjectSkeletonInterface
    | object
    | undefined;
}

export interface IdObjectSkeletonInterface extends NoIdObjectSkeletonInterface {
  _id?: string;
}

export interface AmConfigEntityInterface extends IdObjectSkeletonInterface {
  _type?: EntityType;
}

export type Readable<Type> = Type;

export type Writable<Type> = {
  inherited: boolean;
  value?: Type;
};

export type QueryResult<Type> = {
  result: Type[];
};

export type PagedResult<Type> = {
  result: Type[];
  resultCount: number;
  pagedResultsCookie: string;
  totalPagedResultsPolicy: 'EXACT' | 'NONE';
  totalPagedResults: number;
  remainingPagedResults: number;
};

export type SearchResult<Type> = {
  result: Type[];
  resultCount: number;
  totalCount?: number | null;
  totalHits?: number | null;
  searchAfterKey?: string | string[] | null;
};

export type EntityType = IdObjectSkeletonInterface & {
  name: string;
  collection: boolean;
};

export type SearchTargetOperator =
  | 'AND'
  | 'EQUALS'
  | 'CONTAINS'
  | 'ALL'
  | 'OR'
  | 'STARTS_WITH'
  | 'ENDS_WITH'
  | 'EXISTS'
  | 'GTE'
  | 'GT'
  | 'LTE'
  | 'LT'
  | 'NOT';

export interface SearchTargetFilterOperation {
  operator: SearchTargetOperator;
  operand:
    | SearchTargetFilterOperation[]
    | {
        targetName: string;
        targetValue: string | number | boolean;
      };
}

export type Metadata = {
  modifiedDate: string;
  createdDate: string;
};

/**
 * See {@link https://backstage.forgerock.com/docs/idm/7.5/crest/crest-patch.html}.
 */
export interface PatchOperationInterface {
  operation:
    | 'add'
    | 'copy'
    | 'increment'
    | 'move'
    | 'remove'
    | 'replace'
    | 'transform';
  field: string;
  value?: any;
  from?: string;
}

export type ConditionGroupOperator = 'and' | 'or';

export type ConditionOperator =
  | 'contains'
  | 'not_contains'
  | 'equals'
  | 'not_equals'
  | 'starts_with'
  | 'ends_with'
  | 'gte'
  | 'gt'
  | 'lt'
  | 'lte';

export type ConditionFilter = {
  [k in ConditionGroupOperator]?: (
    | ConditionFilter
    | {
        [k in ConditionOperator]?: {
          left?: string | { literal: string | number | boolean };
          right?: string | { literal: string | number | boolean };
          search_string?: string | { literal: string | number };
          in_string?: string | { literal: string | number };
          prefix?: string | { literal: string | number };
          suffix?: string | { literal: string | number };
          value?: string | { literal: string | number };
        };
      }
  )[];
};

export interface Condition {
  version?: string;
  filter?: ConditionFilter;
}
