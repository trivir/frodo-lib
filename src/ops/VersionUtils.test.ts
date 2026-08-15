import { describe, test, expect } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { getVersion } from './VersionUtils.ts';
import { state } from '../index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkg = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')
);

describe('index', () => {
  test('get library version', () => {
    const result = getVersion({ state });
    expect(result).toEqual(`${pkg.version}`);
  });
});
