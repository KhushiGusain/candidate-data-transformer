# Multi-Source Data Transformer

Transforms candidate profiles from multiple sources (ATS exports, resumes) into a single canonical output.

## Project structure

```
├── config/          # Default and custom pipeline configuration
├── data/
│   ├── input/       # Source files to transform
│   └── output/      # Transformed candidate profiles
├── src/
│   ├── index.js           # CLI entry point
│   ├── models/            # Canonical data models
│   ├── parsers/           # Source-specific parsers
│   ├── normalizers/       # Field normalization
│   ├── merger/            # Multi-source merge logic
│   ├── projector/         # Output projection
│   ├── validators/        # Output validation
│   └── utils/             # Shared utilities
└── tests/
```

## Scripts

```bash
npm start   # Run the CLI entry point
npm test    # Run tests
```

## Requirements

- Node.js 18+
