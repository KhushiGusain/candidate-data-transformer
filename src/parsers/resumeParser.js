import { readFileSync } from 'node:fs';
import { createEmptyCandidate } from '../models/candidate.js';

const RESUME_SOURCE = 'Resume TXT';

/**
 * Record which canonical field was populated from this parser.
 */
function addProvenance(candidate, field, method) {
  candidate.provenance.push({
    field,
    source: RESUME_SOURCE,
    method,
  });
}

/**
 * Return trimmed non-empty lines from resume text.
 */
function getNonEmptyLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * Collect lines under a section header until the next section or end of file.
 */
function getSectionLines(lines, sectionName) {
  const sectionHeaders = ['SKILLS', 'EXPERIENCE', 'EDUCATION'];
  const startIndex = lines.findIndex(
    (line) => line.toUpperCase() === sectionName.toUpperCase(),
  );

  if (startIndex === -1) {
    return [];
  }

  const content = [];

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();

    if (sectionHeaders.includes(line.toUpperCase())) {
      break;
    }

    if (line) {
      content.push(line);
    }
  }

  return content;
}

/**
 * Read a plain-text resume and extract fields into a canonical candidate object.
 * @param {string} filePath - Path to the resume text file
 * @returns {object} Canonical candidate profile
 */
export function parseResume(filePath) {
  const candidate = createEmptyCandidate();

  let text = '';
  try {
    text = readFileSync(filePath, 'utf-8');
  } catch {
    return candidate;
  }

  const lines = text.split(/\r?\n/);
  const nonEmptyLines = getNonEmptyLines(text);

  // Name: first non-empty line
  if (nonEmptyLines.length > 0) {
    candidate.fullName = nonEmptyLines[0];
    addProvenance(candidate, 'fullName', 'line_parsing');
  }

  // Headline: second non-empty line
  if (nonEmptyLines.length > 1) {
    candidate.headline = nonEmptyLines[1];
    addProvenance(candidate, 'headline', 'line_parsing');
  }

  // Email
  const emailMatch = text.match(/Email:\s*(\S+@\S+\.\S+)/i);
  if (emailMatch) {
    candidate.emails.push(emailMatch[1]);
    addProvenance(candidate, 'emails', 'regex');
  }

  // Phone (kept exactly as provided)
  const phoneMatch = text.match(/Phone:\s*(.+)/i);
  if (phoneMatch) {
    candidate.phones.push(phoneMatch[1].trim());
    addProvenance(candidate, 'phones', 'regex');
  }

  // Skills section
  const skillLines = getSectionLines(lines, 'SKILLS');
  if (skillLines.length > 0) {
    const skillNames = skillLines[0].split(',').map((skill) => skill.trim()).filter(Boolean);

    if (skillNames.length > 0) {
      candidate.skills = skillNames.map((name) => ({
        name,
        confidence: null,
        sources: [RESUME_SOURCE],
      }));
      addProvenance(candidate, 'skills', 'section_parsing');
    }
  }

  // Education section
  const educationLines = getSectionLines(lines, 'EDUCATION');
  if (educationLines.length > 0) {
    const educationEntry = {
      institution: null,
      degree: null,
      field: null,
      endYear: null,
    };

    const mainLine = educationLines[0];
    const parts = mainLine.split('|').map((part) => part.trim());

    if (parts[0]) {
      educationEntry.degree = parts[0];
    }

    if (parts[1]) {
      educationEntry.institution = parts[1];
    }

    for (const line of educationLines.slice(1)) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      if (yearMatch) {
        educationEntry.endYear = Number(yearMatch[0]);
        break;
      }
    }

    candidate.education.push(educationEntry);
    addProvenance(candidate, 'education', 'section_parsing');
  }

  return candidate;
}
