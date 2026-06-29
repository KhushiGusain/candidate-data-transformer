/**
 * Check whether a field name refers to an email value.
 */
function isEmailField(fieldName) {
  return /email/i.test(fieldName);
}

/**
 * Check whether a field name refers to a phone value.
 */
function isPhoneField(fieldName) {
  return /phone/i.test(fieldName);
}

/**
 * Validate the final projected output object.
 * Reports issues without throwing.
 * @param {unknown} output - Projected candidate output
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateOutput(output) {
  const errors = [];

  // Projected output must be a plain object
  if (output === null || typeof output !== 'object' || Array.isArray(output)) {
    return {
      valid: false,
      errors: ['Output must be an object'],
    };
  }

  for (const [field, value] of Object.entries(output)) {
    // Skip null placeholders from on_missing: "null"
    if (value == null) {
      continue;
    }

    // Email fields must be strings containing "@"
    if (isEmailField(field)) {
      if (typeof value !== 'string' || !value.includes('@')) {
        errors.push(`"${field}" must be a valid email containing "@"`);
      }
    }

    // Phone fields must be strings
    if (isPhoneField(field)) {
      if (typeof value !== 'string') {
        errors.push(`"${field}" must be a string`);
      }
    }

    // Validate confidence only when a non-null value is present
    if (field === 'overallConfidence') {
      if (typeof value !== 'number' || value < 0 || value > 1) {
        errors.push('overallConfidence must be a number between 0 and 1');
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
