import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Map common skill aliases to canonical names.
 * Lookup is case-insensitive.
 */
const SKILL_ALIASES = {
  reactjs: 'React',
  react: 'React',
  node: 'Node.js',
  nodejs: 'Node.js',
  js: 'JavaScript',
  javascript: 'JavaScript',
};

/**
 * Convert a valid Indian phone number to E.164.
 * Invalid or non-Indian numbers are returned unchanged.
 */
function normalizePhone(phone) {
  const parsed = parsePhoneNumberFromString(phone, 'IN');

  if (parsed?.isValid() && parsed.country === 'IN') {
    return parsed.format('E.164');
  }

  return phone;
}

/**
 * Map a skill name through the alias dictionary.
 * Unknown names are returned unchanged.
 */
function normalizeSkillName(name) {
  const alias = SKILL_ALIASES[name.trim().toLowerCase()];
  return alias ?? name;
}

/**
 * Normalize phone numbers on the candidate in place.
 */
function normalizePhones(candidate) {
  for (let i = 0; i < candidate.phones.length; i++) {
    candidate.phones[i] = normalizePhone(candidate.phones[i]);
  }
}

/**
 * Normalize skill names on the candidate in place.
 */
function normalizeSkills(candidate) {
  for (const skill of candidate.skills) {
    if (skill.name != null) {
      skill.name = normalizeSkillName(skill.name);
    }
  }
}

/**
 * Apply normalization rules to a canonical candidate object.
 * Mutates and returns the same object.
 * @param {object} candidate - Canonical candidate profile
 * @returns {object} The same candidate after normalization
 */
export function normalizeCandidate(candidate) {
  normalizePhones(candidate);
  normalizeSkills(candidate);
  return candidate;
}
