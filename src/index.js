import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parseATS } from './parsers/atsParser.js';
import { parseResume } from './parsers/resumeParser.js';
import { normalizeCandidate } from './services/normalize.js';
import { mergeCandidates } from './services/merge.js';
import { projectCandidate } from './services/project.js';
import { validateOutput } from './services/validate.js';

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..');

const ATS_PATH = join(rootDir, 'data/input/ats.json');
const RESUME_PATH = join(rootDir, 'data/input/resume.txt');
const CONFIG_PATH = join(rootDir, 'data/input/default-config.json');
const OUTPUT_PATH = join(rootDir, 'data/output/output.json');

/**
 * Run the full candidate transformation pipeline.
 */
function main() {
  const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8'));
  const projectionConfig = config.projection ?? config;

  // Parse each source into a canonical candidate
  const atsCandidate = parseATS(ATS_PATH);
  const resumeCandidate = parseResume(RESUME_PATH);

  // Normalize parsed profiles before merging
  normalizeCandidate(atsCandidate);
  normalizeCandidate(resumeCandidate);

  // Combine both sources into one canonical profile
  const mergedCandidate = mergeCandidates(atsCandidate, resumeCandidate);

  // Shape the merged profile for output
  const output = projectCandidate(mergedCandidate, projectionConfig);

  // Validate the projected result
  const validation = validateOutput(output);

  if (!validation.valid) {
    console.error('Validation failed:');
    for (const error of validation.errors) {
      console.error(`- ${error}`);
    }
    return;
  }

  // Write validated output to disk
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(`Output written to ${OUTPUT_PATH}`);
}

main();
