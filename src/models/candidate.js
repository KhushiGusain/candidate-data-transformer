export function createEmptyCandidate() {
  return {
    // Basic Information
    candidateId: null,
    fullName: null,

    // Contact Information
    emails: [],
    phones: [],

    // Location
    location: {
      city: null,
      region: null,
      country: null,
    },

    // External Profile Links
    links: {
      linkedin: null,
      github: null,
      portfolio: null,
      other: [],
    },

    headline: null,
    yearsExperience: null,

    // [{ name, confidence, sources }]
    skills: [],

    // [{ company, title, start, end, summary }]
    experience: [],

    // [{ institution, degree, field, endYear }]
    education: [],

    // [{ field, source, method }]
    provenance: [],

    overallConfidence: null,
  };
}