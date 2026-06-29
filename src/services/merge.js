import { createEmptyCandidate } from '../models/candidate.js';

/**
 * Trusted source scores used to weight the merged profile.
 * ATS data is treated as more structured and reliable than parsed resume text.
 */
const SOURCE_CONFIDENCE = {
  'ATS JSON': 0.95,
  'Resume TXT': 0.80,
};

function isPresent(value) {
  return value !== null && value !== undefined;
}

/**
 * Prefer the primary source when both candidates supply a value.
 * The primary input (e.g. ATS) is treated as the more authoritative record.
 */
function pickValue(primaryValue, secondaryValue) {
  return isPresent(primaryValue) ? primaryValue : secondaryValue;
}

/**
 * Combine contact lists from both sources while avoiding repeats.
 * Primary values are kept first so preferred contact details take precedence.
 */
function mergeUniqueArray(primaryArray, secondaryArray, caseInsensitive = false) {
  const merged = [...primaryArray];
  const seen = new Set(
    primaryArray.map((value) => (caseInsensitive ? value.toLowerCase() : value)),
  );

  for (const value of secondaryArray) {
    const key = caseInsensitive ? value.toLowerCase() : value;

    if (!seen.has(key)) {
      seen.add(key);
      merged.push(value);
    }
  }

  return merged;
}

/**
 * Collapse duplicate skills while keeping one entry per name.
 * Primary wins on conflict because its metadata (e.g. sources) is preferred.
 */
function mergeSkills(primarySkills, secondarySkills) {
  const merged = [];
  const seen = new Set();

  for (const skill of [...primarySkills, ...secondarySkills]) {
    if (skill == null || typeof skill.name !== 'string') {
      continue;
    }

    const trimmedName = skill.name.trim();
    if (!trimmedName) {
      continue;
    }

    const key = trimmedName.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      merged.push({ ...skill });
    }
  }

  return merged;
}

/**
 * Score the merged profile by how reliable its sources are.
 * Averaging unique source confidences reflects trust in origin, not field count.
 */
function calculateOverallConfidence(provenance) {
  if (provenance.length === 0) {
    return null;
  }

  const sources = [...new Set(provenance.map((entry) => entry.source))];
  const totalConfidence = sources.reduce(
    (sum, source) => sum + (SOURCE_CONFIDENCE[source] ?? 0),
    0,
  );

  return totalConfidence / sources.length;
}

/**
 * Merge two canonical candidate objects into one new profile.
 * Returns a fresh object so the original parsed records remain unchanged for auditing.
 * @param {object} primaryCandidate - Preferred source (e.g. ATS)
 * @param {object} secondaryCandidate - Supplementary source (e.g. resume)
 * @returns {object} New merged canonical candidate
 */
export function mergeCandidates(primaryCandidate, secondaryCandidate) {
  const merged = createEmptyCandidate();

  // Scalar fields: primary wins to avoid blending conflicting single values
  merged.candidateId = pickValue(
    primaryCandidate.candidateId,
    secondaryCandidate.candidateId,
  );
  merged.fullName = pickValue(primaryCandidate.fullName, secondaryCandidate.fullName);
  merged.headline = pickValue(primaryCandidate.headline, secondaryCandidate.headline);
  merged.yearsExperience = pickValue(
    primaryCandidate.yearsExperience,
    secondaryCandidate.yearsExperience,
  );

  // Location: merge per sub-field so a gap in one source can be filled by the other
  merged.location = {
    city: pickValue(primaryCandidate.location.city, secondaryCandidate.location.city),
    region: pickValue(primaryCandidate.location.region, secondaryCandidate.location.region),
    country: pickValue(
      primaryCandidate.location.country,
      secondaryCandidate.location.country,
    ),
  };

  // Known link slots follow primary-wins; extra links are collected without duplicates.
  merged.links = {
    linkedin: pickValue(primaryCandidate.links.linkedin, secondaryCandidate.links.linkedin),
    github: pickValue(primaryCandidate.links.github, secondaryCandidate.links.github),
    portfolio: pickValue(
      primaryCandidate.links.portfolio,
      secondaryCandidate.links.portfolio,
    ),
    other: mergeUniqueArray(primaryCandidate.links.other, secondaryCandidate.links.other),
  };

  // Keep every distinct contact value in case sources list different valid entries.
  merged.emails = mergeUniqueArray(
    primaryCandidate.emails,
    secondaryCandidate.emails,
    true,
  );
  merged.phones = mergeUniqueArray(primaryCandidate.phones, secondaryCandidate.phones);

  // Collapse equivalent skills so the same capability is not listed twice.
  merged.skills = mergeSkills(primaryCandidate.skills, secondaryCandidate.skills);

  // Not deduplicated: each source may describe different roles or levels of detail.
  merged.experience = [
    ...primaryCandidate.experience,
    ...secondaryCandidate.experience,
  ];

  // Not deduplicated: sources may contribute separate education records.
  merged.education = [
    ...primaryCandidate.education,
    ...secondaryCandidate.education,
  ];

  // Preserve full extraction history so downstream steps can audit field origins.
  merged.provenance = [
    ...primaryCandidate.provenance,
    ...secondaryCandidate.provenance,
  ];

  // Confidence follows source reliability rather than field count alone.
  merged.overallConfidence = calculateOverallConfidence(merged.provenance);

  return merged;
}
