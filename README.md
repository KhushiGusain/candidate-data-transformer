# Multi-Source Candidate Data Transformer

This project transforms candidate information from multiple sources into a single canonical candidate profile. It supports both structured (ATS JSON) and unstructured (Resume TXT) inputs, normalizes extracted data, merges information from different sources, and produces configurable output using a projection configuration.

---

## Resources

| Resource | Link |
|----------|------|
| Technical Design Document | <YOUR_PDF_LINK> |
| Demo Video | <YOUR_VIDEO_LINK> |

---

## Features

- Parses candidate data from ATS JSON (structured) and Resume TXT (unstructured).
- Maps all input sources into a canonical candidate model.
- Normalizes phone numbers and skill names.
- Merges candidate information from multiple sources.
- Tracks provenance for extracted fields.
- Calculates an overall confidence score based on source reliability.
- Supports configurable output through a JSON-based projection configuration.
- Validates the final projected output before writing it to disk.

---

## Project Structure

```
Multi-Source-Data-Transformer/
├── data/
│   ├── input/              # Sample input files
│   └── output/             # Generated output
├── src/
│   ├── models/             # Canonical candidate model
│   ├── parsers/            # ATS and Resume parsers
│   ├── services/           # Normalize, merge, project and validate
│   └── index.js            # Pipeline entry point
├── tests/                  # Pipeline tests
├── README.md
└── package.json
```

---

## Pipeline Overview

The transformation pipeline follows these stages:

```
ATS JSON          Resume TXT
     │                 │
     ▼                 ▼
  ATS Parser      Resume Parser
          \       /
           ▼     ▼
      Canonical Candidate
              │
              ▼
        Normalization
              │
              ▼
            Merge
              │
              ▼
     Configurable Projection
              │
              ▼
          Validation
              │
              ▼
         output.json
```

---

## Configuration

The output schema is controlled through a JSON configuration file.

The configuration supports:

- Selecting which fields to include.
- Renaming output fields.
- Handling missing values (`null`, `omit`, or `error`).
- Toggling confidence and provenance fields.

Default configuration:

```text
data/input/default-config.json
```

- ---


## How to Run

### Install dependencies

```bash
npm install
```

### Run the pipeline

```bash
node src/index.js
```

The transformed candidate profile will be generated at:

```text
data/output/output.json
```

---

## Sample Output

Running the pipeline generates the transformed candidate profile at:

```text
data/output/output.json
```

The repository includes a sample output generated from the representative input files.

## Running Tests

Run the test suite using Node's built-in test runner:

```bash
npm test
```
The tests verify:

- End-to-end pipeline execution against the expected output.
- Skill normalization and merge behavior.
---

## Tech Stack

- **Language:** JavaScript (Node.js)
- **Testing:** Node.js Built-in Test Runner
- **Phone Number Normalization:** libphonenumber-js

