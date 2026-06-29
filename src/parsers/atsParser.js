import { readFileSync } from 'node:fs';
import { createEmptyCandidate } from '../models/candidate.js';

const ATS_SOURCE = 'ATS JSON';
const FIELD_MAPPING = 'field_mapping';

/**
 * Record which canonical field was populated from this parser.
 */
function addProvenance(candidate, field) {
  candidate.provenance.push({
    field,
    source: ATS_SOURCE,
    method: FIELD_MAPPING,
  });
}

/**
 * Split a comma-separated location string into city, region, and country.
 * Examples: "San Francisco, CA, USA" or "London, UK"
 */
function parseLocationString(location) {
  const parts = location.split(',').map((part) => part.trim()).filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  if (parts.length === 1) {
    return { city: parts[0], region: null, country: null };
  }

  if (parts.length === 2) {
    return { city: parts[0], region: null, country: parts[1] };
  }

  return {
    city: parts[0],
    region: parts[1],
    country: parts[parts.length - 1],
  };
}

/**
 * Read an ATS JSON file and map its fields into a canonical candidate object.
 * @param {string} filePath - Path to the ATS JSON file
 * @returns {object} Canonical candidate profile
 */
export function parseATS(filePath) {
  const atsData = JSON.parse(readFileSync(filePath, 'utf-8'));
  const candidate = createEmptyCandidate();

  // candidate_name -> fullName
  if (atsData.candidate_name != null) {
    candidate.fullName = atsData.candidate_name;
    addProvenance(candidate, 'fullName');
  }

  // email_address -> emails
  if (atsData.email_address != null) {
    candidate.emails.push(atsData.email_address);
    addProvenance(candidate, 'emails');
  }

  // phone_number -> phones (kept exactly as provided)
  if (atsData.phone_number != null) {
    candidate.phones.push(atsData.phone_number);
    addProvenance(candidate, 'phones');
  }

  // job_title -> headline
  if (atsData.job_title != null) {
    candidate.headline = atsData.job_title;
    addProvenance(candidate, 'headline');
  }

  // current_company and job_title -> experience[0]
  if (atsData.current_company != null || atsData.job_title != null) {
    const experienceEntry = {
      company: null,
      title: null,
      start: null,
      end: null,
      summary: null,
    };

    if (atsData.current_company != null) {
      experienceEntry.company = atsData.current_company;
      addProvenance(candidate, 'experience.company');
    }

    if (atsData.job_title != null) {
      experienceEntry.title = atsData.job_title;
      addProvenance(candidate, 'experience.title');
    }

    candidate.experience.push(experienceEntry);
  }

  // skills -> skills[] (names kept exactly as provided)
  if (Array.isArray(atsData.skills) && atsData.skills.length > 0) {
    candidate.skills = atsData.skills.map((skillName) => ({
      name: skillName,
      confidence: null,
      sources: [ATS_SOURCE],
  }));
    addProvenance(candidate, 'skills');
  }

  // location -> location object
  if (atsData.location != null) {
    const location = parseLocationString(String(atsData.location));
    if (location) {
      candidate.location = location;
      addProvenance(candidate, 'location');
    }
  }

  return candidate;
}
