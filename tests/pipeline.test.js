import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

test('pipeline golden output', () => {
  // End-to-end golden output test for the complete transformation pipeline.
  execSync('node src/index.js', { cwd: rootDir, stdio: 'pipe' });

  const actual = JSON.parse(
    readFileSync(join(rootDir, 'data/output/output.json'), 'utf-8'),
  );
  const expected = JSON.parse(
    readFileSync(join(rootDir, 'tests/expected-output.json'), 'utf-8'),
  );

  assert.deepStrictEqual(actual, expected);
});
