# Multi-Source Candidate Data Transformer

This project transforms candidate information from multiple sources into a single canonical candidate profile. It supports both structured (ATS JSON) and unstructured (Resume TXT) inputs, normalizes extracted data, merges information from different sources, and produces configurable output using a projection configuration.

The solution is built as a modular data processing pipeline where each stage has a single responsibility, making the codebase easy to understand, maintain, and extend.

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

Each stage has a single responsibility:

- **Parsers** extract data from different source formats into a common canonical model.
- **Normalization** standardizes values such as phone numbers and skill names.
- **Merge** combines candidate information from multiple sources while preserving provenance.
- **Projection** reshapes the canonical profile according to a configuration file.
- **Validation** verifies the projected output before it is written to disk.

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

## Running Tests

Run the test suite using Node's built-in test runner:

```bash
npm test
```

The tests verify:

- End-to-end pipeline execution against the expected output.
- Skill normalization and merge behavior.
