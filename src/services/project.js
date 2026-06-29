/**
 * Supported source paths for projection.
 * No generic JSONPath — only explicit patterns from the assignment.
 */
const SUPPORTED_PATHS = new Set([
  'fullName',
  'headline',
  'yearsExperience',
  'emails[0]',
  'phones[0]',
  'skills[].name',
  'location.city',
  'location.region',
  'location.country',
]);

/**
 * Read a supported value from the canonical candidate.
 */
function resolvePath(candidate, from) {
  switch (from) {
    case 'fullName':
      return candidate.fullName;
    case 'headline':
      return candidate.headline;
    case 'yearsExperience':
      return candidate.yearsExperience;
    case 'emails[0]':
      return candidate.emails[0];
    case 'phones[0]':
      return candidate.phones[0];
    case 'skills[].name':
      return candidate.skills
        .filter((skill) => skill != null && typeof skill.name === 'string')
        .map((skill) => skill.name);
    case 'location.city':
      return candidate.location.city;
    case 'location.region':
      return candidate.location.region;
    case 'location.country':
      return candidate.location.country;
    default:
      return undefined;
  }
}

/**
 * Normalize a field entry into an output path and source path.
 */
function normalizeFieldSpec(field) {
  if (typeof field === 'string') {
    return { path: field, from: field };
  }

  return { path: field.path, from: field.from };
}

/**
 * Decide whether a resolved value should be treated as missing.
 */
function isMissing(value) {
  if (value === undefined || value === null) {
    return true;
  }

  if (Array.isArray(value) && value.length === 0) {
    return true;
  }

  return false;
}

/**
 * Apply on_missing behavior for a single projected field.
 */
function applyMissingPolicy(output, path, onMissing) {
  if (onMissing === 'error') {
    throw new Error(`Missing value for projected field "${path}"`);
  }

  if (onMissing === 'omit') {
    return;
  }

  output[path] = null;
}

/**
 * Project a canonical candidate into a configured output shape.
 * @param {object} candidate - Merged canonical candidate
 * @param {object} config - Projection configuration
 * @returns {object} New output object
 */
export function projectCandidate(candidate, config) {
  const output = {};
  const fields = config.fields ?? [];
  const onMissing = config.on_missing ?? 'null';

  // Map each configured field from the canonical candidate to the output object
  for (const field of fields) {
    const { path, from } = normalizeFieldSpec(field);

    if (!SUPPORTED_PATHS.has(from)) {
      throw new Error(`Unsupported projection path: "${from}"`);
    }

    const value = resolvePath(candidate, from);

    if (isMissing(value)) {
      applyMissingPolicy(output, path, onMissing);
      continue;
    }

    output[path] = value;
  }

  // Optionally include merge confidence as a top-level output field
  if (config.include_confidence) {
    output.overallConfidence = candidate.overallConfidence;
  }

  return output;
}
