import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

function runPipelineAndReadOutput() {
  execSync('node src/index.js', { cwd: rootDir, stdio: 'pipe' });
  return JSON.parse(readFileSync(join(rootDir, 'data/output/output.json'), 'utf-8'));
}

test('pipeline golden output', () => {
  // End-to-end golden output test for the complete transformation pipeline.
  const actual = runPipelineAndReadOutput();
  const expected = JSON.parse(
    readFileSync(join(rootDir, 'tests/expected-output.json'), 'utf-8'),
  );

  assert.deepStrictEqual(actual, expected);
});

test('duplicate skills are merged across sources', () => {
  // Verifies normalization and merge behavior when the same skills appear in multiple inputs.
  const output = runPipelineAndReadOutput();
  const { skills } = output;

  assert.equal(skills.filter((skill) => skill === 'React').length, 1);
  assert.equal(skills.filter((skill) => skill === 'Node.js').length, 1);
  assert.equal(skills.length, new Set(skills).size);
});
