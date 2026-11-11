# ADR-0002: generated metadata registry and immutable releases

- **Status:** Accepted
- **Context:** Catalog and categories must be data-driven, invalid templates must be rejected, and generator consumers must pin immutable source.
- **Decision:** Template metadata and category JSON are canonical. A Node standard-library script validates them and generates deterministic registry JSON plus preview copies. Local registry has no immutable ref; release generation accepts semver tag or full SHA only.
- **Alternatives:** Hand-maintained app list; remote API/database; fetch from `main`.
- **Reasons:** No backend in V1, minimal dependencies, no duplicate catalogs, generator-friendly JSON, immutable release contract.
- **Tradeoffs:** New templates are included at build time, not runtime sync; release process/tag publication remains manual; schema migration policy is still future work.
