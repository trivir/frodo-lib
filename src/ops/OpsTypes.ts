import { FrodoError } from './FrodoError';

export interface ExportMetaData {
  origin: string;
  originAmVersion: string;
  exportedBy: string;
  exportDate: string;
  exportTool: string;
  exportToolVersion: string;
}

export type ResultCallback<R> = (
  err: FrodoError | undefined,
  result: R | undefined
) => void;
